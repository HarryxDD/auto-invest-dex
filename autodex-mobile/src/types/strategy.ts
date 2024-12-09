import { EConditionOperator, EStrategyFrequency } from "@/constants/strategy";

export interface EBuyCondition { type: EConditionOperator, values: string[] | null };

export interface SingleTokenParams {
  firstPairItem: string;
  secondPairItem: string;
  amountEachBatch: string;
  frequency: EStrategyFrequency;
  firstBatchDate: Date;
  firstBatchTime: Date;
  depositAmount: string;
  
  byAtMarketCondition?: EBuyCondition;
  endDate?: Date | null;
  endTime?: Date | null;
  targetTokenAmount?: string | null;
  targetSOLAmount?: string | null;
  targetBatchesPurchased?: string | null;
  takeProfit?: string | null;
  stopLoss?: string | null;
}
