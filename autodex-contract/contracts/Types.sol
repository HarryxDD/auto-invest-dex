// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

library Types {
	enum MachineStatus {
		Unset,
		Active,
		Paused,
		Closed,
		Withdrawn
	}

	enum ValueComparisonOperator {
		Unset, /// @dev default value
		Gt, /// @dev greater than
		Gte, /// @dev greater than or equal
		Lt, /// @dev less than
		Lte, /// @dev less than or equal
		Bw, /// @dev between
		NBw /// @dev not between
	}

	struct ValueComparison {
		uint256 value0;
		uint256 value1;
		ValueComparisonOperator operator;
	}

	enum TradingStopConditionType {
		Unset,
		Price,
		PortfolioPercentageDiff,
		PortfolioValueDiff
	}

	struct TradingStopCondition {
		TradingStopConditionType stopType;
		uint256 value;
	}

	enum StopConditionOperator {
		EndTimeReach,
		BatchAmountReach,
		SpentBaseTokenAmountReach,
		ReceivedTargetTokenAmountReach
	}

	struct StopCondition {
		uint256 value;
		StopConditionOperator operator;
	}

	enum AMMRouterVersion {
		V3,
		V2,
		V3NonUniversal
	}

	struct Machine {
		string id;
		uint256 totalDepositedBaseAmount;
		uint256 totalSwappedBaseAmount;
		uint256 totalReceivedTargetAmount;
		uint256 totalClosedPositionInTargetTokenAmount;
		uint256 totalReceivedFundInBaseTokenAmount;
		uint256 baseTokenBalance;
		uint256 targetTokenBalance;
		uint256 executedBatchAmount;
		uint256 nextScheduledExecutionAt;
		MachineStatus status;
		address owner;
		address ammRouterAddress;
		address baseTokenAddress;
		address targetTokenAddress;
		uint256 startAt;
		uint256 batchVolume;
		uint256 frequency;
		ValueComparison openingPositionCondition;
		StopCondition[] stopConditions;
		TradingStopCondition takeProfitCondition;
		TradingStopCondition stopLossCondition;
		AMMRouterVersion ammRouterVersion;
	}
}
