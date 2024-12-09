// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./Types.sol";

library Params {
	/**
	 * @dev Define machine item
	 */
	struct CreateMachineParams {
		/**
		 * @dev Each machine would have a unique id
		 */
		string id;
		address owner;
		/**
		 * @dev AMM configurations
		 */
		address ammRouterAddress;
		address baseTokenAddress;
		address targetTokenAddress;
		Types.AMMRouterVersion ammRouterVersion;
		/**
		 * @dev Machine trade config
		 **/
		uint256 startAt;
		uint256 batchVolume;
		Types.StopCondition[] stopConditions;
		uint256 frequency;
		/**
		 * @dev Machine opening position config
		 */
		Types.ValueComparison openingPositionCondition;
		/**
		 * @dev Machine closing position config
		 */
		Types.TradingStopCondition takeProfitCondition;
		Types.TradingStopCondition stopLossCondition;
	}

	/**
	 * @dev Define machine item
	 */
	struct UpdateMachineParams {
		/**
		 * @dev Each machine would have a unique id
		 */
		string id;
		/**
		 * @dev Machine trade config
		 **/
		uint256 startAt;
		uint256 batchVolume;
		Types.StopCondition[] stopConditions;
		uint256 frequency;
		/**
		 * @dev Machine opening position config
		 */
		Types.ValueComparison openingPositionCondition;
		/**
		 * @dev Machine closing position config
		 */
		Types.TradingStopCondition takeProfitCondition;
		Types.TradingStopCondition stopLossCondition;
	}

	/// @dev Define params
	struct UpdateMachineClosingPositionStatsParams {
		string id;
		address actor;
		/**
		 * @dev Archived info is used for statistic
		 */
		uint256 swappedTargetTokenAmount;
		uint256 receivedBaseTokenAmount;
	}

	/// @dev Define params
	struct UpdateMachineTradingStatsParams {
		address actor;
		string id;
		/**
		 * @dev Archived info is used for statistic
		 */
		uint256 swappedBaseTokenAmount;
		uint256 receivedTargetTokenAmount;
	}

	/// @dev Depositing params
	struct UpdateMachineWithdrawalParams {
		address actor;
		string id;
	}

	/// @dev Define params
	struct UpdateMachineDepositParams {
		address actor;
		string id;
		uint256 amount;
		address tokenAddress;
	}

	/// @dev Define params
	struct UpdateMachineStatusParams {
		address actor;
		string id;
		Types.MachineStatus status;
	}
}
