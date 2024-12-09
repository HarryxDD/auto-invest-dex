// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/MulticallUpgradeable.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./MachineRegistry.sol";
import "./MachineVault.sol";

import "./Types.sol";
import "./Params.sol";

contract MachineChef is
	Initializable,
	PausableUpgradeable,
	ReentrancyGuardUpgradeable,
	OwnableUpgradeable,
	MulticallUpgradeable
{
	MachineRegistry public registry;
	MachineVault public vault;

	/// @notice Events
	event VaultUpdated(address indexed actor, address updatedAddress);
	event RegistryUpdated(address indexed actor, address updatedAddress);

	/// @notice create machine
	function createMachine(Params.CreateMachineParams calldata params) public {
		require(
			params.owner == msg.sender,
			"Invalid machine: owner mismatches"
		);
		registry.initializeUserMachine(params);
	}

	/// @notice create machine
	function createMachineAndDepositEther(
		Params.CreateMachineParams calldata params
	) external payable nonReentrant {
		/// @dev Create machine
		createMachine(params);

		/// @dev Calling deposit ether
		_depositEther(params.id);
	}

	/// @notice create machine
	function createMachineAndDepositToken(
		Params.CreateMachineParams calldata params,
		uint256 depositAmount
	) external nonReentrant {
		/// @dev Create machine
		createMachine(params);

		/// @dev Calling deposit ether
		_depositToken(params.id, depositAmount);
	}

	/// @notice Update machine data
	function updateMachine(
		Params.UpdateMachineParams calldata params
	) external {
		require(
			registry.isAbleToUpdate(params.id, msg.sender),
			"Operation error: the machine is not able to update"
		);

		registry.updateMachine(params, "USER_UPDATE_POCKET");
	}

	/// @notice Make DCA swap
	function closePosition(
		string calldata machineId,
		uint256 fee,
		uint256 minOut
	) external nonReentrant {
		/// @dev Verify swap condition
		require(
			registry.isOwnerOf(machineId, msg.sender),
			"Operation error: only owner is permitted for the operation"
		);
		require(
			registry.isReadyToClosePosition(machineId),
			"Operation error: the machine is not ready to close position"
		);

		/// @dev Execute DCA Swap
		(uint256 amountIn, uint256 amountOut) = vault.closePosition(
			machineId,
			fee,
			minOut
		);

		/// @dev Update closing position stats
		registry.updateMachineClosingPositionStats(
			Params.UpdateMachineClosingPositionStatsParams({
				id: machineId,
				actor: msg.sender,
				swappedTargetTokenAmount: amountIn,
				receivedBaseTokenAmount: amountOut
			}),
			"USER_CLOSED_POSITION"
		);

		/// @dev Pause machine due to closing position
		registry.updateMachineStatus(
			Params.UpdateMachineStatusParams({
				id: machineId,
				actor: msg.sender,
				status: Types.MachineStatus.Closed
			}),
			"CLOSED_POCKET_DUE_TO_POSITION_CLOSED"
		);
	}

	/// @notice Make DCA swap
	function tryClosingPosition(
		string calldata machineId,
		uint256 fee,
		uint256 minOut
	) external nonReentrant {
		/// @dev Verify swap condition
		require(
			registry.hasRole(registry.OPERATOR(), msg.sender),
			"Operation error: only operator is permitted for the operation"
		);
		require(
			registry.isReadyToClosePosition(machineId),
			"Operation error: the machine is not ready to close position"
		);

		/// @dev Execute DCA Swap
		(uint256 amountIn, uint256 amountOut) = vault.closePosition(
			machineId,
			fee,
			minOut
		);

		bool shouldStopLoss = registry.shouldStopLoss(
			machineId,
			amountIn,
			amountOut
		);
		bool shouldTakeProfit = registry.shouldTakeProfit(
			machineId,
			amountIn,
			amountOut
		);

		/// @dev Check whether the buy condition meets
		require(
			shouldStopLoss || shouldTakeProfit,
			"Operation error: closing position condition does not reach"
		);

		/// @dev Given reason for taking profit
		if (shouldTakeProfit) {
			/// @dev Update trading stats
			registry.updateMachineClosingPositionStats(
				Params.UpdateMachineClosingPositionStatsParams({
					id: machineId,
					actor: msg.sender,
					swappedTargetTokenAmount: amountIn,
					receivedBaseTokenAmount: amountOut
				}),
				"OPERATOR_TAKE_PROFIT"
			);
		}

		/// @dev Given reason for stopping loss
		if (shouldStopLoss) {
			/// @dev Update trading stats
			registry.updateMachineClosingPositionStats(
				Params.UpdateMachineClosingPositionStatsParams({
					id: machineId,
					actor: msg.sender,
					swappedTargetTokenAmount: amountIn,
					receivedBaseTokenAmount: amountOut
				}),
				"OPERATOR_STOP_LOSS"
			);
		}

		/// @dev Close machine after closing position
		registry.updateMachineStatus(
			Params.UpdateMachineStatusParams({
				id: machineId,
				actor: msg.sender,
				status: Types.MachineStatus.Closed
			}),
			"CLOSED_POCKET_DUE_TO_POSITION_CLOSED"
		);
	}

	/// @notice Make DCA swap
	function tryMakingDCASwap(
		string calldata machineId,
		uint256 fee,
		uint256 minOut
	) external nonReentrant {
		/// @dev Verify swap condition
		require(
			registry.hasRole(registry.OPERATOR(), msg.sender),
			"Operation error: only operator is permitted for the operation"
		);
		require(
			registry.isReadyToSwap(machineId),
			"Operation error: the machine is not ready to perform swap"
		);

		/// @dev Execute DCA Swap
		(uint256 amountIn, uint256 amountOut) = vault.makeDCASwap(
			machineId,
			fee,
			minOut
		);

		/// @dev Check whether the buy condition meets
		require(
			registry.shouldOpenPosition(machineId, amountIn, amountOut),
			"Operation error: buy condition does not reach"
		);

		/// @dev Update trading stats
		registry.updateMachineTradingStats(
			Params.UpdateMachineTradingStatsParams({
				id: machineId,
				actor: msg.sender,
				swappedBaseTokenAmount: amountIn,
				receivedTargetTokenAmount: amountOut
			}),
			"OPERATOR_UPDATED_TRADING_STATS"
		);

		/// @dev Check whether should stop machine
		if (registry.shouldCloseMachine(machineId)) {
			registry.updateMachineStatus(
				Params.UpdateMachineStatusParams({
					id: machineId,
					actor: msg.sender,
					status: Types.MachineStatus.Closed
				}),
				"OPERATOR_CLOSED_POCKET_DUE_TO_STOP_CONDITIONS"
			);
		}
	}

	/// @dev Deposit and wrap ether
	function depositEther(
		string calldata machineId
	) external payable nonReentrant {
		_depositEther(machineId);
	}

	/// @dev Deposit token
	function depositToken(
		string calldata machineId,
		uint256 amount
	) external nonReentrant {
		_depositToken(machineId, amount);
	}

	/// @dev Deposit and wrap ether
	function _depositEther(string calldata machineId) private {
		/// @dev Verify amount
		uint256 amount = msg.value;
		require(amount > 0, "Operation error: invalid amount");

		/// @dev verify machine stats
		require(
			registry.isAbleToDeposit(machineId, msg.sender),
			"Operation error: cannot deposit"
		);

		(, address baseTokenAddress, , , , , , , , , ) = registry
			.getTradingInfoOf(machineId);

		/// @dev Wrap ether here
		IWETH9(baseTokenAddress).deposit{value: amount}();

		/// @dev Approve vault to be able to spend an amount of base token
		IERC20(baseTokenAddress).approve(address(vault), amount);

		/// @dev Construct params
		Params.UpdateMachineDepositParams memory params = Params
			.UpdateMachineDepositParams({
				id: machineId,
				actor: msg.sender,
				tokenAddress: baseTokenAddress,
				amount: amount
			});

		/// @dev Deposit to machine
		vault.deposit(params);

		/// @dev Update stats
		registry.updateMachineDepositStats(params, "USER_DEPOSITED_FUND");
	}

	/// @notice Deposit token to a machine
	function _depositToken(string calldata machineId, uint256 amount) private {
		/// @dev verify machine stats
		require(
			registry.isAbleToDeposit(machineId, msg.sender),
			"Operation error: cannot deposit"
		);

		(, address baseTokenAddress, , , , , , , , , ) = registry
			.getTradingInfoOf(machineId);

		/// @dev Spend user token
		require(
			IERC20(baseTokenAddress).transferFrom(
				msg.sender,
				address(this),
				amount
			),
			"Operation error: cannot deposit"
		);

		/// @dev Approve vault to be able to spend an amount of base token
		IERC20(baseTokenAddress).approve(address(vault), amount);

		/// @dev Construct params
		Params.UpdateMachineDepositParams memory params = Params
			.UpdateMachineDepositParams({
				id: machineId,
				actor: msg.sender,
				tokenAddress: baseTokenAddress,
				amount: amount
			});

		/// @dev Deposit to machine
		vault.deposit(params);

		/// @dev Update stats
		registry.updateMachineDepositStats(params, "USER_DEPOSITED_FUND");
	}

	/// @notice Deposit token to a machine
	function withdraw(string calldata machineId) external nonReentrant {
		require(
			registry.isAbleToWithdraw(machineId, msg.sender),
			"Operation error: cannot withdraw machine fund"
		);

		Params.UpdateMachineWithdrawalParams memory params = Params
			.UpdateMachineWithdrawalParams({id: machineId, actor: msg.sender});

		/// @dev Withdraw from machine
		vault.withdraw(params);

		/// @dev Update withdrawal stats
		registry.updateMachineWithdrawalStats(params, "USER_WITHDREW_FUND");
	}

	/// @notice pause machine
	function pauseMachine(string calldata machineId) external {
		require(
			registry.isAbleToPause(machineId, msg.sender),
			"Operation error: cannot pause machine"
		);

		/// @dev Update machine
		registry.updateMachineStatus(
			Params.UpdateMachineStatusParams({
				id: machineId,
				actor: msg.sender,
				status: Types.MachineStatus.Paused
			}),
			"USER_PAUSED_POCKET"
		);
	}

	/// @notice restart machine
	function restartMachine(string calldata machineId) external {
		require(
			registry.isAbleToRestart(machineId, msg.sender),
			"Operation error: cannot restart machine"
		);

		/// @dev Update machine
		registry.updateMachineStatus(
			Params.UpdateMachineStatusParams({
				id: machineId,
				actor: msg.sender,
				status: Types.MachineStatus.Active
			}),
			"USER_RESTARTED_POCKET"
		);
	}

	/// @notice close machine
	function closeMachine(string calldata machineId) external {
		require(
			registry.isAbleToClose(machineId, msg.sender),
			"Operation error: cannot close machine"
		);

		/// @dev Update machine
		registry.updateMachineStatus(
			Params.UpdateMachineStatusParams({
				id: machineId,
				actor: msg.sender,
				status: Types.MachineStatus.Closed
			}),
			"USER_CLOSED_POCKET"
		);
	}

	/// @notice Set vault
	function setVault(address payable vaultAddress) external onlyOwner {
		vault = MachineVault(vaultAddress);
		emit VaultUpdated(msg.sender, vaultAddress);
	}

	/// @notice Set Registry
	function setRegistry(address registryAddress) external onlyOwner {
		registry = MachineRegistry(registryAddress);
		emit RegistryUpdated(msg.sender, registryAddress);
	}

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	function initialize() public initializer {
		__Pausable_init();
		__Ownable_init();
		__ReentrancyGuard_init();
		__Multicall_init();
	}

	function pause() public onlyOwner {
		_pause();
	}

	function unpause() public onlyOwner {
		_unpause();
	}
}
