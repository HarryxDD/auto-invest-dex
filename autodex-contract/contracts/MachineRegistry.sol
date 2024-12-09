// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "./Types.sol";
import "./Params.sol";

contract MachineRegistry is
	Initializable,
	PausableUpgradeable,
	ReentrancyGuardUpgradeable,
	AccessControlUpgradeable,
	OwnableUpgradeable
{
	using SafeMathUpgradeable for uint256;

	/// @notice Operator that is allowed to run swap
	bytes32 public constant OPERATOR = keccak256("OPERATOR");

	/// @notice Relayer that is specific to internal components such as router or vault
	bytes32 public constant RELAYER = keccak256("RELAYER");

	/// @notice We use precision as 1 million for the more accurate percentage
	uint256 public constant PERCENTAGE_PRECISION = 1000000;

	/// @notice Store machine configuration
	mapping(address => bool) public allowedInteractiveAddresses;

	/// @notice Store user machine data
	mapping(string => Types.Machine) public machines;

	/// @notice Utility check
	mapping(string => bool) public blacklistedIdMap;

	/// @notice Event emitted when whitelisting/blacklisting address
	event AddressWhitelisted(
		address indexed actor,
		address indexed mintAddress,
		bool value
	);

	/// @notice Event emitted when initializing user machine
	event machineInitialized(
		address indexed actor,
		string machineId,
		address indexed owner,
		Types.Machine machineData,
		uint256 timestamp
	);

	/// @notice Event emitted when initializing user machine
	event machineUpdated(
		address indexed actor,
		string machineId,
		address indexed owner,
		string reason,
		Types.Machine machineData,
		uint256 timestamp
	);

	/// @notice Check if id is unique
	/// @dev should be used as a modifier
	modifier idMustBeAvailable(string calldata id) {
		require(blacklistedIdMap[id] == false, "ID: the id is not unique");
		blacklistedIdMap[id] = true;

		_;
	}

	/// @notice Check if id is unique
	/// @dev should be used as a modifier
	modifier mustBeValidMachine(string calldata id) {
		require(blacklistedIdMap[id] == true, "ID: the id must be existed");
		require(machines[id].owner != address(0), "machine: invalid machine");

		_;
	}

	/// @notice Check if the target is the owner of a given machine id
	/// @dev should be used as a modifier
	modifier mustBeOwnerOf(string calldata machineId, address target) {
		require(
			isOwnerOf(machineId, target),
			"Permission: not permitted operation"
		);

		_;
	}

	/// @notice Check whether an address is the machine owner
	function isOwnerOf(
		string calldata machineId,
		address target
	) public view returns (bool) {
		return machines[machineId].owner == target;
	}

	/// @notice Check whether an address is the machine owner
	function getStopConditionsOf(
		string calldata machineId
	) public view returns (Types.StopCondition[] memory) {
		return machines[machineId].stopConditions;
	}

	/// @notice Check whether a machine meet stop condition. The machine should be settled before checking this condition.
	function shouldCloseMachine(
		string calldata machineId
	) public view returns (bool) {
		Types.Machine storage machine = machines[machineId];
		Types.StopCondition[] storage stopConditions = machines[machineId]
			.stopConditions;

		/// @notice Save some gas
		if (stopConditions.length == 0) return false;

		bool shouldStop = false;

		/**
		 * @notice Check condition to stop the machine
		 *  If the condition is endTimeReach
		 *   should stop if the current block time is greater than or equal to the condition value
		 *  If the condition is batchAmountReach
		 *    should stop if the executed batch amount is greater than or equal to the condition value
		 *  If the condition is spentBaseTokenAmountReach
		 *   should stop if the total swapped base token amount is greater than or equal to the condition value
		 *  If the condition is receivedTargetTokenAmountReach
		 *   should stop if the total received target token amount is greater than or equal to the condition value
		 */
		for (uint256 index = 0; index < stopConditions.length; index++) {
			Types.StopCondition storage condition = stopConditions[index];
			if (
				condition.operator == Types.StopConditionOperator.EndTimeReach
			) {
				shouldStop = shouldStop || condition.value <= block.timestamp;
				continue;
			}

			if (
				condition.operator ==
				Types.StopConditionOperator.BatchAmountReach
			) {
				shouldStop =
					shouldStop ||
					machine.executedBatchAmount >= condition.value;
				continue;
			}

			if (
				condition.operator ==
				Types.StopConditionOperator.SpentBaseTokenAmountReach
			) {
				shouldStop =
					shouldStop ||
					machine.totalSwappedBaseAmount >= condition.value;
				continue;
			}

			if (
				condition.operator ==
				Types.StopConditionOperator.ReceivedTargetTokenAmountReach
			) {
				shouldStop =
					shouldStop ||
					machine.totalReceivedTargetAmount >= condition.value;
				continue;
			}
		}

		return shouldStop;
	}

	/// @notice Check whether a machine meet buy condition. The machine should not be settled until this condition is verified.
	function shouldOpenPosition(
		string calldata machineId,
		uint256 swappedBaseTokenAmount,
		uint256 receivedTargetTokenAmount
	) public view returns (bool) {
		Types.Machine storage machine = machines[machineId];
		Types.ValueComparison storage condition = machines[machineId]
			.openingPositionCondition;

		if (condition.operator == Types.ValueComparisonOperator.Unset) {
			return true;
		}

		/// @dev Calculate price and compare with the condition
		uint256 expectedAmountOut = receivedTargetTokenAmount
			.mul(machine.batchVolume)
			.div(swappedBaseTokenAmount);

		if (condition.operator == Types.ValueComparisonOperator.Lt) {
			return expectedAmountOut < condition.value0;
		}

		if (condition.operator == Types.ValueComparisonOperator.Lte) {
			return expectedAmountOut <= condition.value0;
		}

		if (condition.operator == Types.ValueComparisonOperator.Gt) {
			return expectedAmountOut > condition.value0;
		}

		if (condition.operator == Types.ValueComparisonOperator.Gte) {
			return expectedAmountOut >= condition.value0;
		}

		if (condition.operator == Types.ValueComparisonOperator.Bw) {
			return
				expectedAmountOut >= condition.value0 &&
				expectedAmountOut <= condition.value1;
		}

		if (condition.operator == Types.ValueComparisonOperator.NBw) {
			return
				expectedAmountOut < condition.value0 ||
				expectedAmountOut > condition.value1;
		}

		/// @dev Default will be true
		return true;
	}

	/// @notice Check whether a machine meet buy condition. The machine should not be settled until this condition is verified.
	function shouldTakeProfit(
		string calldata machineId,
		uint256 swappedTargetTokenAmount,
		uint256 receivedBaseTokenAmount
	) public view returns (bool) {
		Types.Machine storage machine = machines[machineId];
		Types.TradingStopCondition storage condition = machines[machineId]
			.takeProfitCondition;

		/// @dev Save some gas by early returns
		if (condition.stopType == Types.TradingStopConditionType.Unset) {
			return false;
		}

		/// @dev If machine stop condition is based on price, return true if expectedAmountOut is greater than or equal condition value
		if (condition.stopType == Types.TradingStopConditionType.Price) {
			/// @dev Calculate price
			uint256 targetTokenDecimal = ERC20(machine.targetTokenAddress)
				.decimals();
			uint256 expectedAmountOut = receivedBaseTokenAmount
				.mul(10 ** targetTokenDecimal)
				.div(swappedTargetTokenAmount);

			return expectedAmountOut >= condition.value;
		}

		/// @dev machine stop condition is based on portfolio value diff
		if (
			condition.stopType ==
			Types.TradingStopConditionType.PortfolioValueDiff
		) {
			return
				receivedBaseTokenAmount >=
				machine.totalSwappedBaseAmount.add(condition.value);
		}

		/// @dev machine stop condition is based on portfolio percentage diff
		if (
			condition.stopType ==
			Types.TradingStopConditionType.PortfolioPercentageDiff
		) {
			/// @dev Return false if the portfolio is in a loss position
			if (receivedBaseTokenAmount <= machine.totalSwappedBaseAmount) {
				return false;
			}

			/// @dev Compute the position profit
			return
				receivedBaseTokenAmount
					.sub(machine.totalSwappedBaseAmount)
					.mul(PERCENTAGE_PRECISION)
					.div(machine.totalSwappedBaseAmount) >= condition.value;
		}

		return false;
	}

	/// @notice Check whether a machine meet buy condition. The machine should not be settled until this condition is verified.
	function shouldStopLoss(
		string calldata machineId,
		uint256 swappedTargetTokenAmount,
		uint256 receivedBaseTokenAmount
	) public view returns (bool) {
		Types.Machine storage machine = machines[machineId];
		Types.TradingStopCondition storage condition = machines[machineId]
			.stopLossCondition;

		/// @dev Save some gas by early returns
		if (condition.stopType == Types.TradingStopConditionType.Unset) {
			return false;
		}

		/// @dev If machine stop condition is based on price, return true if expectedAmountOut is less than or equal condition value
		if (condition.stopType == Types.TradingStopConditionType.Price) {
			/// @dev Calculate price
			uint256 targetTokenDecimals = ERC20(machine.targetTokenAddress)
				.decimals();
			uint256 expectedAmountOut = receivedBaseTokenAmount
				.mul(10 ** targetTokenDecimals)
				.div(swappedTargetTokenAmount);

			return expectedAmountOut <= condition.value;
		}

		/// @dev machine stop condition is based on portfolio value diff
		if (
			condition.stopType ==
			Types.TradingStopConditionType.PortfolioValueDiff
		) {
			return
				receivedBaseTokenAmount <= machine.totalSwappedBaseAmount &&
				machine.totalSwappedBaseAmount.sub(receivedBaseTokenAmount) >=
				condition.value;
		}

		/// @dev machine stop condition is based on portfolio percentage diff
		if (
			condition.stopType ==
			Types.TradingStopConditionType.PortfolioPercentageDiff
		) {
			/// @dev Return false if the portfolio is not in a loss position
			if (receivedBaseTokenAmount > machine.totalSwappedBaseAmount) {
				return false;
			}

			/// @dev Compute the position loss
			return
				machine
					.totalSwappedBaseAmount
					.sub(receivedBaseTokenAmount)
					.mul(PERCENTAGE_PRECISION)
					.div(machine.totalSwappedBaseAmount) >= condition.value;
		}

		return false;
	}

	/// @notice Get trading pair info of a given machine id
	function getTradingInfoOf(
		string calldata machineId
	)
		public
		view
		returns (
			address,
			address,
			address,
			Types.AMMRouterVersion,
			uint256,
			uint256,
			uint256,
			uint256,
			Types.ValueComparison memory,
			Types.TradingStopCondition memory,
			Types.TradingStopCondition memory
		)
	{
		return (
			machines[machineId].ammRouterAddress,
			machines[machineId].baseTokenAddress,
			machines[machineId].targetTokenAddress,
			machines[machineId].ammRouterVersion,
			machines[machineId].startAt,
			machines[machineId].batchVolume,
			machines[machineId].frequency,
			machines[machineId].nextScheduledExecutionAt,
			machines[machineId].openingPositionCondition,
			machines[machineId].takeProfitCondition,
			machines[machineId].stopLossCondition
		);
	}

	/// @notice Get balance info of a given machine
	function getBalanceInfoOf(
		string calldata machineId
	) public view returns (uint256, uint256) {
		return (
			machines[machineId].baseTokenBalance,
			machines[machineId].targetTokenBalance
		);
	}

	/// @notice Get owner address of a given machine
	function getOwnerOf(
		string calldata machineId
	) public view returns (address) {
		return (machines[machineId].owner);
	}

	/// @notice Check whether a machine is available for depositing
	function isAbleToDeposit(
		string calldata machineId,
		address owner
	) external view returns (bool) {
		return (machines[machineId].owner == owner &&
			machines[machineId].status != Types.MachineStatus.Closed &&
			machines[machineId].status != Types.MachineStatus.Withdrawn);
	}

	/// @notice Check whether a machine is available for depositing
	function isAbleToUpdate(
		string calldata machineId,
		address owner
	) external view returns (bool) {
		return (machines[machineId].owner == owner &&
			machines[machineId].status != Types.MachineStatus.Closed &&
			machines[machineId].status != Types.MachineStatus.Withdrawn);
	}

	/// @notice Check whether a machine is available to close
	function isAbleToClose(
		string calldata machineId,
		address owner
	) external view returns (bool) {
		return (machines[machineId].owner == owner &&
			machines[machineId].status != Types.MachineStatus.Closed &&
			machines[machineId].status != Types.MachineStatus.Withdrawn);
	}

	/// @notice Check whether a machine is available to withdraw
	function isAbleToWithdraw(
		string calldata machineId,
		address owner
	) external view returns (bool) {
		return (machines[machineId].owner == owner &&
			machines[machineId].status == Types.MachineStatus.Closed);
	}

	/// @notice Check whether a machine is available to restart
	function isAbleToRestart(
		string calldata machineId,
		address owner
	) external view returns (bool) {
		return (machines[machineId].owner == owner &&
			machines[machineId].status == Types.MachineStatus.Paused);
	}

	/// @notice Check whether a machine is available to pause
	function isAbleToPause(
		string calldata machineId,
		address owner
	) external view returns (bool) {
		return (machines[machineId].owner == owner &&
			machines[machineId].status == Types.MachineStatus.Active);
	}

	/// @notice Check whether a machine is ready to swap
	function isReadyToSwap(
		string calldata machineId
	) external view returns (bool) {
		return (machines[machineId].status == Types.MachineStatus.Active &&
			machines[machineId].baseTokenBalance >=
			machines[machineId].batchVolume &&
			machines[machineId].startAt <= block.timestamp &&
			machines[machineId].nextScheduledExecutionAt <= block.timestamp);
	}

	/// @notice Check whether a machine is ready to swap
	function isReadyToClosePosition(
		string calldata machineId
	) external view returns (bool) {
		return (machines[machineId].status != Types.MachineStatus.Withdrawn &&
			machines[machineId].startAt <= block.timestamp &&
			machines[machineId].targetTokenBalance > 0);
	}

	/// @notice Users initialize their machine
	function initializeUserMachine(
		Params.CreateMachineParams calldata params
	) external onlyRole(RELAYER) idMustBeAvailable(params.id) {
		/// @dev Validate input
		require(
			params.startAt >= block.timestamp,
			"Timestamp: must be equal or greater than block time"
		);
		require(params.batchVolume > 0, "Batch volume: cannot be zero");
		require(params.frequency > 0, "Frequency: cannot be zero");
		require(params.owner != address(0), "Address: invalid owner");
		require(
			params.ammRouterAddress != address(0),
			"Address: invalid ammRouterAddress"
		);
		require(
			allowedInteractiveAddresses[params.ammRouterAddress],
			"Address: ammRouterAddress is not whitelisted"
		);
		require(
			params.baseTokenAddress != address(0),
			"Address: invalid baseTokenAddress"
		);
		require(
			allowedInteractiveAddresses[params.baseTokenAddress],
			"Address: baseTokenAddress is not whitelisted"
		);
		require(
			params.targetTokenAddress != address(0),
			"Address: invalid targetTokenAddress"
		);
		require(
			allowedInteractiveAddresses[params.targetTokenAddress],
			"Address: targetTokenAddress is not whitelisted"
		);
		/// @dev Validate stop condition through loop
		for (uint256 index = 0; index < params.stopConditions.length; index++) {
			require(
				params.stopConditions[index].value > 0,
				"StopCondition: value must not be zero"
			);
		}
		/// @dev Validate value comparison struct
		if (
			params.openingPositionCondition.operator !=
			Types.ValueComparisonOperator.Unset
		) {
			if (
				params.openingPositionCondition.operator ==
				Types.ValueComparisonOperator.Bw ||
				params.openingPositionCondition.operator ==
				Types.ValueComparisonOperator.NBw
			) {
				require(
					params.openingPositionCondition.value0 > 0 &&
						params.openingPositionCondition.value1 >=
						params.openingPositionCondition.value0,
					"ValueComparison: invalid value"
				);
			} else {
				require(
					params.openingPositionCondition.value0 > 0,
					"ValueComparison: invalid value"
				);
			}
		}
		/// @dev Validate value comparison struct
		if (
			params.takeProfitCondition.stopType !=
			Types.TradingStopConditionType.Unset
		) {
			require(
				params.takeProfitCondition.value > 0,
				"ValueComparison: invalid value"
			);
		}
		/// @dev Validate value comparison struct
		if (
			params.stopLossCondition.stopType !=
			Types.TradingStopConditionType.Unset
		) {
			require(
				params.stopLossCondition.value > 0,
				"ValueComparison: invalid value"
			);
		}

		/// @dev Initialize user machine data
		machines[params.id] = Types.Machine({
			id: params.id,
			owner: params.owner,
			ammRouterAddress: params.ammRouterAddress,
			baseTokenAddress: params.baseTokenAddress,
			targetTokenAddress: params.targetTokenAddress,
			ammRouterVersion: params.ammRouterVersion,
			startAt: params.startAt,
			nextScheduledExecutionAt: params.startAt,
			batchVolume: params.batchVolume,
			frequency: params.frequency,
			stopConditions: params.stopConditions,
			openingPositionCondition: params.openingPositionCondition,
			takeProfitCondition: params.takeProfitCondition,
			stopLossCondition: params.stopLossCondition,
			/// @dev Those fields are updated during the relayers operation
			status: Types.MachineStatus.Active,
			totalDepositedBaseAmount: 0,
			totalReceivedTargetAmount: 0,
			totalSwappedBaseAmount: 0,
			totalClosedPositionInTargetTokenAmount: 0,
			totalReceivedFundInBaseTokenAmount: 0,
			baseTokenBalance: 0,
			targetTokenBalance: 0,
			executedBatchAmount: 0
		});

		/// @dev Emit event
		emit machineInitialized(
			msg.sender,
			params.id,
			params.owner,
			machines[params.id],
			block.timestamp
		);
	}

	/// @notice Users initialize their machine
	function updateMachine(
		Params.UpdateMachineParams calldata params,
		string calldata reason
	) external onlyRole(RELAYER) mustBeValidMachine(params.id) {
		Types.Machine storage currentmachine = machines[params.id];

		if (currentmachine.startAt >= block.timestamp) {
			/// @dev Validate input
			require(
				params.startAt >= block.timestamp,
				"Timestamp: must be equal or greater than block time"
			);

			/// @dev Update field
			currentmachine.startAt = params.startAt;
			currentmachine.nextScheduledExecutionAt = params.startAt;
		}

		require(params.batchVolume > 0, "Batch volume: cannot be zero");
		require(params.frequency > 0, "Frequency: cannot be zero");
		/// @dev Validate stop condition through loop
		for (uint256 index = 0; index < params.stopConditions.length; index++) {
			require(
				params.stopConditions[index].value > 0,
				"StopCondition: value must not be zero"
			);
		}
		/// @dev Validate value comparison struct
		if (
			params.openingPositionCondition.operator !=
			Types.ValueComparisonOperator.Unset
		) {
			if (
				params.openingPositionCondition.operator ==
				Types.ValueComparisonOperator.Bw ||
				params.openingPositionCondition.operator ==
				Types.ValueComparisonOperator.NBw
			) {
				require(
					params.openingPositionCondition.value0 > 0 &&
						params.openingPositionCondition.value1 >=
						params.openingPositionCondition.value0,
					"ValueComparison: invalid value"
				);
			} else {
				require(
					params.openingPositionCondition.value0 > 0,
					"ValueComparison: invalid value"
				);
			}
		}
		/// @dev Validate value comparison struct
		if (
			params.takeProfitCondition.stopType !=
			Types.TradingStopConditionType.Unset
		) {
			require(
				params.takeProfitCondition.value > 0,
				"ValueComparison: invalid value"
			);
		}
		/// @dev Validate value comparison struct
		if (
			params.stopLossCondition.stopType !=
			Types.TradingStopConditionType.Unset
		) {
			require(
				params.stopLossCondition.value > 0,
				"ValueComparison: invalid value"
			);
		}

		/// @dev Initialize user machine data
		machines[params.id] = Types.Machine({
			/// @dev Those fields are updated
			batchVolume: params.batchVolume,
			frequency: params.frequency,
			stopConditions: params.stopConditions,
			openingPositionCondition: params.openingPositionCondition,
			takeProfitCondition: params.takeProfitCondition,
			stopLossCondition: params.stopLossCondition,
			/// @dev Reserve those fields
			id: currentmachine.id,
			owner: currentmachine.owner,
			ammRouterAddress: currentmachine.ammRouterAddress,
			baseTokenAddress: currentmachine.baseTokenAddress,
			targetTokenAddress: currentmachine.targetTokenAddress,
			ammRouterVersion: currentmachine.ammRouterVersion,
			status: currentmachine.status,
			totalDepositedBaseAmount: currentmachine.totalDepositedBaseAmount,
			totalReceivedTargetAmount: currentmachine.totalReceivedTargetAmount,
			totalSwappedBaseAmount: currentmachine.totalSwappedBaseAmount,
			totalClosedPositionInTargetTokenAmount: currentmachine
				.totalClosedPositionInTargetTokenAmount,
			totalReceivedFundInBaseTokenAmount: currentmachine
				.totalReceivedFundInBaseTokenAmount,
			baseTokenBalance: currentmachine.baseTokenBalance,
			targetTokenBalance: currentmachine.targetTokenBalance,
			executedBatchAmount: currentmachine.executedBatchAmount,
			nextScheduledExecutionAt: currentmachine.nextScheduledExecutionAt,
			startAt: currentmachine.startAt
		});

		/// @dev Emit event
		emit machineUpdated(
			msg.sender,
			currentmachine.id,
			currentmachine.owner,
			reason,
			machines[params.id],
			block.timestamp
		);
	}

	/// @notice The function to provide a method for relayers to update machine stats
	function updateMachineClosingPositionStats(
		Params.UpdateMachineClosingPositionStatsParams calldata params,
		string calldata reason
	) external onlyRole(RELAYER) {
		/// @dev Check for permission
		require(
			hasRole(OPERATOR, params.actor) ||
				isOwnerOf(params.id, params.actor),
			"Operation error: operation is not permitted"
		);

		Types.Machine storage machine = machines[params.id];

		/// @dev Assigned value
		machine.totalClosedPositionInTargetTokenAmount = machine
			.totalClosedPositionInTargetTokenAmount
			.add(params.swappedTargetTokenAmount);
		machine.totalReceivedFundInBaseTokenAmount = machine
			.totalReceivedFundInBaseTokenAmount
			.add(params.receivedBaseTokenAmount);

		/// @dev Update balance properly
		machine.baseTokenBalance = machine.baseTokenBalance.add(
			params.receivedBaseTokenAmount
		);
		machine.targetTokenBalance = machine.targetTokenBalance.sub(
			params.swappedTargetTokenAmount
		);

		/// @dev Emit events
		emit machineUpdated(
			msg.sender,
			params.id,
			params.actor,
			reason,
			machine,
			block.timestamp
		);
	}

	/// @notice The function to provide a method for relayers to update machine stats
	function updateMachineTradingStats(
		Params.UpdateMachineTradingStatsParams calldata params,
		string calldata reason
	) external onlyRole(RELAYER) {
		/// @dev Check for permission
		require(
			hasRole(OPERATOR, params.actor) ||
				isOwnerOf(params.id, params.actor),
			"Operation error: operation is not permitted"
		);

		Types.Machine storage machine = machines[params.id];

		/// @dev Assigned value
		machine.nextScheduledExecutionAt = block.timestamp.add(
			machine.frequency
		);
		machine.executedBatchAmount = machine.executedBatchAmount.add(1);

		/// @dev Update balance properly
		machine.totalSwappedBaseAmount = machine.totalSwappedBaseAmount.add(
			params.swappedBaseTokenAmount
		);
		machine.totalReceivedTargetAmount = machine
			.totalReceivedTargetAmount
			.add(params.receivedTargetTokenAmount);
		machine.baseTokenBalance = machine.baseTokenBalance.sub(
			params.swappedBaseTokenAmount
		);
		machine.targetTokenBalance = machine.targetTokenBalance.add(
			params.receivedTargetTokenAmount
		);

		/// @dev Emit events
		emit machineUpdated(
			msg.sender,
			params.id,
			params.actor,
			reason,
			machine,
			block.timestamp
		);
	}

	/// @notice The function to provide a method for relayers to update machine stats
	function updateMachineWithdrawalStats(
		Params.UpdateMachineWithdrawalParams calldata params,
		string calldata reason
	) external onlyRole(RELAYER) mustBeOwnerOf(params.id, params.actor) {
		Types.Machine storage machine = machines[params.id];

		/// @dev Assigned value
		machine.baseTokenBalance = 0;
		machine.targetTokenBalance = 0;
		machine.status = Types.MachineStatus.Withdrawn;

		/// @dev Emit events
		emit machineUpdated(
			msg.sender,
			params.id,
			params.actor,
			reason,
			machine,
			block.timestamp
		);
	}

	/// @notice The function to provide a method for relayers to update machine stats
	function updateMachineDepositStats(
		Params.UpdateMachineDepositParams calldata params,
		string calldata reason
	) external onlyRole(RELAYER) mustBeOwnerOf(params.id, params.actor) {
		Types.Machine storage machine = machines[params.id];

		/// @dev Assigned value
		machine.totalDepositedBaseAmount = machine.totalDepositedBaseAmount.add(
			params.amount
		);
		machine.baseTokenBalance = machine.baseTokenBalance.add(params.amount);

		/// @dev Emit events
		emit machineUpdated(
			msg.sender,
			params.id,
			params.actor,
			reason,
			machine,
			block.timestamp
		);
	}

	/// @notice The function to provide a method for relayers to update machine stats
	function updateMachineStatus(
		Params.UpdateMachineStatusParams calldata params,
		string calldata reason
	) external onlyRole(RELAYER) {
		require(
			hasRole(OPERATOR, params.actor) ||
				isOwnerOf(params.id, params.actor),
			"Operation error: operation is not permitted"
		);

		Types.Machine storage machine = machines[params.id];

		/// @dev Assigned value
		machine.status = params.status;

		/// @dev Emit events
		emit machineUpdated(
			msg.sender,
			params.id,
			params.actor,
			reason,
			machine,
			block.timestamp
		);
	}

	/// @notice Admin can update whitelisted address
	/// @dev Simply assign value to the mapping
	function whitelistAddress(
		address interactiveAddress,
		bool value
	) external onlyOwner {
		allowedInteractiveAddresses[interactiveAddress] = value;
		emit AddressWhitelisted(msg.sender, interactiveAddress, value);
	}

	function grantRole(
		bytes32 role,
		address account
	) public override onlyOwner {
		_grantRole(role, account);
	}

	function revokeRole(
		bytes32 role,
		address account
	) public override onlyOwner {
		_revokeRole(role, account);
	}

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	/// @notice Initialization func
	function initialize() public initializer {
		__Pausable_init();
		__Ownable_init();
		__AccessControl_init();
		__ReentrancyGuard_init();

		_grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
	}

	function pause() public onlyOwner onlyRole(DEFAULT_ADMIN_ROLE) {
		_pause();
	}

	function unpause() public onlyOwner onlyRole(DEFAULT_ADMIN_ROLE) {
		_unpause();
	}
}
