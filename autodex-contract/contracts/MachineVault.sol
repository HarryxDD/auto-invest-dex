// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@uniswap/universal-router/contracts/libraries/Commands.sol";
import "@uniswap/universal-router/contracts/libraries/Constants.sol";

import "./MachineRegistry.sol";

import "./Types.sol";
import "./Params.sol";
import "./IQuoter.sol";
import "./Etherman.sol";
import "./IRouterV2.sol";
import "./IRouterV3.sol";

interface UniversalRouter {
	function execute(
		bytes calldata commands,
		bytes[] calldata inputs,
		uint256 deadline
	) external payable;

	function execute(
		bytes calldata commands,
		bytes[] calldata inputs
	) external payable;
}

interface IPermit2 {
	function approve(
		address token,
		address spender,
		uint160 amount,
		uint48 expiration
	) external;
}

contract MachineVault is
	Initializable,
	PausableUpgradeable,
	ReentrancyGuardUpgradeable,
	OwnableUpgradeable
{
	using SafeMathUpgradeable for uint256;

	MachineRegistry public registry;
	IPermit2 public permit2;
	Etherman public etherman;

	mapping(address => address) public quoterMapping;

	event SwapFeeUpdated(address indexed actor, uint256 value);
	event RegistryUpdated(address indexed actor, address indexed registry);
	event EthermanUpdated(
		address indexed actor,
		address indexed ethermanAddress
	);
	event Permit2Updated(address indexed actor, address indexed permit2);
	event QuoterUpdated(address indexed actor, address indexed quoter);

	/// @dev Emit Withdrawn whenever a withdrawal happens
	event Withdrawn(
		address indexed actor,
		string machineId,
		address baseTokenAddress,
		uint256 baseTokenAmount,
		address targetTokenAddress,
		uint256 targetTokenAmount,
		uint256 timestamp
	);

	/// @dev Emit Deposited whenever a deposit happens
	event Deposited(
		address indexed actor,
		string machineId,
		address indexed tokenAddress,
		uint256 amount,
		uint256 timestamp
	);

	/// @dev Emit ClosedPosition whenever a position is closed
	event ClosedPosition(
		address indexed actor,
		string machineId,
		address baseTokenAddress,
		uint256 baseTokenAmount,
		address targetTokenAddress,
		uint256 targetTokenAmount,
		uint256 timestamp
	);

	/// @dev Emit Swapped whenever a swap happens
	event Swapped(
		address indexed actor,
		string machineId,
		address baseTokenAddress,
		uint256 baseTokenAmount,
		address targetTokenAddress,
		uint256 targetTokenAmount,
		uint256 timestamp
	);

	/// @notice Modifier to verify only permitted actor can perform the operation
	modifier onlyRelayer() {
		require(
			registry.hasRole(registry.RELAYER(), msg.sender),
			"Permission: only relayer is permitted"
		);

		_;
	}

	/// @notice Get current quote
	function getCurrentQuote(
		address baseTokenAddress,
		address targetTokenAddress,
		address ammRouterAddress,
		uint256 amountIn,
		uint256 fee
	) public returns (uint256, uint256) {
		/// @dev Try returning v2 first
		try
			this.getCurrentQuoteV2(
				baseTokenAddress,
				targetTokenAddress,
				ammRouterAddress,
				amountIn
			)
		returns (uint256 _in, uint256 _out) {
			return (_in, _out);
		} catch {
			/// @dev If getting v2 fails, we return v3
			return
				getCurrentQuoteV3(
					baseTokenAddress,
					targetTokenAddress,
					ammRouterAddress,
					amountIn,
					fee
				);
		}
	}

	/// @notice Get quote of a machine
	function getQuote(
		address baseTokenAddress,
		address targetTokenAddress,
		address ammRouterV3Address,
		uint256 amountIn,
		uint256 fee
	) private returns (uint256, uint256) {
		bytes memory path = abi.encodePacked(
			baseTokenAddress,
			uint24(fee),
			targetTokenAddress
		);
		IQuoter quoter = IQuoter(quoterMapping[ammRouterV3Address]);

		return (amountIn, quoter.quoteExactInput(path, amountIn));
	}

	/// @notice Get current quote v3
	function getCurrentQuoteV3(
		address baseTokenAddress,
		address targetTokenAddress,
		address ammRouterV3Address,
		uint256 amountIn,
		uint256 fee
	) public returns (uint256, uint256) {
		require(
			registry.allowedInteractiveAddresses(ammRouterV3Address) == true,
			"Error: amm address is not supported"
		);
		return
			getQuote(
				baseTokenAddress,
				targetTokenAddress,
				ammRouterV3Address,
				amountIn,
				fee
			);
	}

	/// @notice Get current quote for v2
	function getCurrentQuoteV2(
		address baseTokenAddress,
		address targetTokenAddress,
		address ammRouterV2Address,
		uint256 amountIn
	) public view returns (uint256, uint256) {
		require(
			registry.allowedInteractiveAddresses(ammRouterV2Address) == true,
			"Error: amm address is not supported"
		);

		address[] memory path = new address[](2);
		path[0] = baseTokenAddress;
		path[1] = targetTokenAddress;

		return (
			amountIn,
			IUniswapV2Router(ammRouterV2Address).getAmountsOut(amountIn, path)[
				1
			]
		);
	}

	/// @notice Make swap with v2 or v3
	function makeSwap(
		address router,
		address baseTokenAddress,
		address targetTokenAddress,
		Types.AMMRouterVersion version,
		uint256 amount,
		uint256 fee,
		uint256 minimumAmountOut
	) private returns (uint256) {
		if (version == Types.AMMRouterVersion.V2) {
			return
				makeSwapV2(
					router,
					baseTokenAddress,
					targetTokenAddress,
					amount,
					minimumAmountOut
				);
		}

		if (version == Types.AMMRouterVersion.V3NonUniversal) {
			return
				makeSwapV3(
					router,
					baseTokenAddress,
					targetTokenAddress,
					amount,
					fee,
					minimumAmountOut
				);
		}

		return
			makeSwapV3WithUniversalV3Router(
				router,
				baseTokenAddress,
				targetTokenAddress,
				amount,
				fee,
				minimumAmountOut
			);
	}

	/// @notice Make swap leverages uniswap non universal router
	function makeSwapV3(
		address router,
		address baseTokenAddress,
		address targetTokenAddress,
		uint256 amount,
		uint256 fee,
		uint256 minimumAmountOut
	) private returns (uint256) {
		IERC20(baseTokenAddress).approve(router, amount);

		uint256 beforeBalance = IERC20(targetTokenAddress).balanceOf(
			address(this)
		);

		bytes memory path = abi.encodePacked(
			baseTokenAddress,
			uint24(fee),
			targetTokenAddress
		);
		IRouterV3.ExactInputParams memory params = IRouterV3.ExactInputParams({
			path: path,
			recipient: address(this),
			deadline: block.timestamp,
			amountIn: amount,
			amountOutMinimum: minimumAmountOut
		});
		IRouterV3(router).exactInput(params);

		return
			IERC20(targetTokenAddress).balanceOf(address(this)).sub(
				beforeBalance
			);
	}

	/// @notice Make swap leverages uniswap universal router
	function makeSwapV3WithUniversalV3Router(
		address router,
		address baseTokenAddress,
		address targetTokenAddress,
		uint256 amount,
		uint256 fee,
		uint256 minimumAmountOut
	) private returns (uint256) {
		IERC20(baseTokenAddress).approve(address(permit2), amount);

		permit2.approve(
			baseTokenAddress,
			router,
			uint160(amount),
			uint48(block.timestamp)
		);

		uint256 beforeBalance = IERC20(targetTokenAddress).balanceOf(
			address(this)
		);

		bytes memory commands = abi.encodePacked(
			bytes1(uint8(Commands.V3_SWAP_EXACT_IN))
		);
		bytes[] memory inputs = new bytes[](1);
		inputs[0] = abi.encode(
			address(this),
			amount,
			minimumAmountOut,
			abi.encodePacked(baseTokenAddress, uint24(fee), targetTokenAddress),
			true
		);
		UniversalRouter(router).execute(commands, inputs);

		return
			IERC20(targetTokenAddress).balanceOf(address(this)).sub(
				beforeBalance
			);
	}

	/// @notice Make swap leverages uniswap universal router
	function makeSwapV2(
		address router,
		address baseTokenAddress,
		address targetTokenAddress,
		uint256 amount,
		uint256 minimumAmountOut
	) private returns (uint256) {
		IERC20(baseTokenAddress).approve(address(router), amount);

		address[] memory path = new address[](2);
		path[0] = baseTokenAddress;
		path[1] = targetTokenAddress;

		uint256 beforeBalance = IERC20(targetTokenAddress).balanceOf(
			address(this)
		);

		IUniswapV2Router(router)
			.swapExactTokensForTokensSupportingFeeOnTransferTokens(
				amount,
				minimumAmountOut,
				path,
				address(this),
				block.timestamp
			);

		return
			IERC20(targetTokenAddress).balanceOf(address(this)).sub(
				beforeBalance
			);
	}

	/// @notice Make DCA swap for the given machine machine
	function makeDCASwap(
		string calldata machineId,
		uint256 fee,
		uint256 minimumAmountOut
	) external onlyRelayer nonReentrant returns (uint256, uint256) {
		/// @dev Extract necessary info
		(
			address ammRouterAddress,
			address baseTokenAddress,
			address targetTokenAddress,
			Types.AMMRouterVersion version,
			,
			uint256 batchVolume,
			,
			,
			,
			,

		) = registry.getTradingInfoOf(machineId);

		uint256 amountOut = makeSwap(
			ammRouterAddress,
			baseTokenAddress,
			targetTokenAddress,
			version,
			batchVolume,
			fee,
			minimumAmountOut
		);

		/// @dev Emit event
		emit Swapped(
			msg.sender,
			machineId,
			baseTokenAddress,
			batchVolume,
			targetTokenAddress,
			amountOut,
			block.timestamp
		);

		/// @dev Return amount in and amount out
		return (batchVolume, amountOut);
	}

	/// @notice Make close position for the given machine
	function closePosition(
		string calldata machineId,
		uint256 fee,
		uint256 minimumAmountOut
	) external onlyRelayer nonReentrant returns (uint256, uint256) {
		/// @dev Extract necessary info
		(
			address ammRouterAddress,
			address baseTokenAddress,
			address targetTokenAddress,
			Types.AMMRouterVersion version,
			,
			,
			,
			,
			,
			,

		) = registry.getTradingInfoOf(machineId);
		(, uint256 targetTokenBalance) = registry.getBalanceInfoOf(machineId);

		uint256 amountOut = makeSwap(
			ammRouterAddress,
			targetTokenAddress,
			baseTokenAddress,
			version,
			targetTokenBalance,
			fee,
			minimumAmountOut
		);

		/// @dev Emit event
		emit ClosedPosition(
			msg.sender,
			machineId,
			baseTokenAddress,
			amountOut,
			targetTokenAddress,
			targetTokenBalance,
			block.timestamp
		);

		/// @dev Return amount in and amount out
		return (targetTokenBalance, amountOut);
	}

	/// @notice withdraw
	function withdraw(
		Params.UpdateMachineWithdrawalParams calldata params
	) external onlyRelayer nonReentrant {
		/// @dev Withdraw tokens
		(
			,
			address baseTokenAddress,
			address targetTokenAddress,
			,
			,
			,
			,
			,
			,
			,

		) = registry.getTradingInfoOf(params.id);
		(uint256 baseTokenBalance, uint256 targetTokenBalance) = registry
			.getBalanceInfoOf(params.id);
		address owner = registry.getOwnerOf(params.id);

		/// @dev Try to withdraw native ether if token was held in the vault as wrapped erc20 ether
		if (baseTokenAddress == etherman.WETH()) {
			IERC20(baseTokenAddress).approve(
				address(etherman),
				baseTokenBalance
			);
			etherman.unwrapWETH(baseTokenBalance, payable(owner));
		} else {
			/// @dev Otherwise transfer erc20 instead
			require(
				IERC20(baseTokenAddress).transfer(owner, baseTokenBalance),
				"Error: cannot transfer token"
			);
		}

		/// @dev Try to withdraw native ether if token was held in the vault as wrapped erc20 ether
		if (targetTokenAddress == etherman.WETH()) {
			IERC20(targetTokenAddress).approve(
				address(etherman),
				targetTokenBalance
			);
			etherman.unwrapWETH(targetTokenBalance, payable(owner));
		} else {
			/// @dev Otherwise transfer erc20 instead
			require(
				IERC20(targetTokenAddress).transfer(owner, targetTokenBalance),
				"Error: cannot transfer token"
			);
		}

		/// @dev Emit event
		emit Withdrawn(
			msg.sender,
			params.id,
			baseTokenAddress,
			baseTokenBalance,
			targetTokenAddress,
			targetTokenBalance,
			block.timestamp
		);
	}

	/// @notice Deposit
	function deposit(
		Params.UpdateMachineDepositParams calldata params
	) external onlyRelayer nonReentrant {
		/// @dev deposit from actor to vault.
		require(
			IERC20(params.tokenAddress).transferFrom(
				msg.sender,
				address(this),
				params.amount
			),
			"Error: cannot transfer token"
		);

		/// @dev Emit event
		emit Deposited(
			msg.sender,
			params.id,
			params.tokenAddress,
			params.amount,
			block.timestamp
		);
	}

	/// @notice Receive function to receive native ether
	receive() external payable {}

	/// @notice Set registry address
	function setRegistry(address registryAddress) external onlyOwner {
		registry = MachineRegistry(registryAddress);
		emit RegistryUpdated(msg.sender, registryAddress);
	}

	/// @notice Set registry address
	function setPermit2(address permit2Address) external onlyOwner {
		permit2 = IPermit2(permit2Address);
		emit Permit2Updated(msg.sender, permit2Address);
	}

	/// @notice Set quoter address
	function setQuoter(
		address router,
		address quoterAddress
	) external onlyOwner {
		require(
			registry.allowedInteractiveAddresses(router) == true,
			"Error: router is not supported"
		);
		quoterMapping[router] = quoterAddress;
		emit QuoterUpdated(msg.sender, quoterAddress);
	}

	/// @notice Set etherman address
	function setEtherman(address payable ethermanAddress) external onlyOwner {
		etherman = Etherman(ethermanAddress);
		emit EthermanUpdated(msg.sender, ethermanAddress);
	}

	/// @notice Initialize etherman
	function initEtherman(address _weth) external onlyOwner {
		etherman = new Etherman(_weth);
		emit EthermanUpdated(msg.sender, address(etherman));
	}

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	function initialize() public initializer {
		__Pausable_init();
		__Ownable_init();
		__ReentrancyGuard_init();
	}

	function pause() public onlyOwner {
		_pause();
	}

	function unpause() public onlyOwner {
		_unpause();
	}
}
