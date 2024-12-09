import { DurationObjectUnits, EStrategyFrequency } from "@/constants/strategy";
import { Token } from "@/libs/entities/platform-config.entity";

export const convertDurationsTimeToHours = (
    duration: EStrategyFrequency
): number => {
    const swapDuration = (val: number) => {
      return val * 3600;
    };
  
    if (duration === EStrategyFrequency.ONE_HOUR) {
      return swapDuration(1);
    } if (duration === EStrategyFrequency.FOUR_HOUR) {
      return swapDuration(4);
    } if (duration === EStrategyFrequency.EIGHT_HOUR) {
        return swapDuration(8);
    } if (duration === EStrategyFrequency.TWELVE_HOUR) {
        return swapDuration(12);
    } if (duration === EStrategyFrequency.DAILY) {
        return swapDuration(24);
    } if (duration === EStrategyFrequency.WEEKLY) {
        return swapDuration(24 * 7);
    } if (duration === EStrategyFrequency.MONTHLY) {
        return swapDuration(24 * 30);
    } 

    return swapDuration(0)
  };
  

export const convertHoursToDurationsTime = (
  hours: number
): DurationObjectUnits => {
  /** @dev Initialize duration result. */
  const result: DurationObjectUnits = {};

  /** @dev Condition for each  */
  if (hours >= 24 * 365) {
    result.years = Math.floor(hours / (365 * 24));
    hours %= (365 * 24);
  }
  if (hours >= 24 * 30) {
    result.months = Math.floor(hours / (30 * 24));
    hours %= (30 * 24);
  }
  if (hours >= 24 * 7) {
    result.weeks = Math.floor(hours / (24 * 7));
    hours %= (24 * 7);
  }
  if (hours >= 24) {
    result.days = Math.floor(hours / 24);
    hours %= 24;
  }
  if (hours > 0) {
    result.hours = hours;
  }

  return result;
};

export const extractAveragePrice = (tokenA: Token, tokenB: Token) => {
  return (tokenB?.estimatedValue || 0) / (tokenA?.estimatedValue || 0); 
};