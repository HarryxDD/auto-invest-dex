import Decimal from "decimal.js";
import { UtilsProvider } from "@/utils/utils.provider";

/**
 * @notice AppNumber instance represents logic handler for all numbers in the app
 * @private value - represents the value of the number
 * @public getValue() - returns the value of the number
 * @public add(value) - adds the value to the number
 * @public subtract(value) - subtracts the value from the number
 * @public multiply(value) - multiplies the number by the value
 * @public divide(value) - divides the number by the value
 * @public pow(value) - raises the number to the power of the value
 * @public toNumber() - returns the number as a number
 * @public getDisplayedString() - returns the number as a string
 * @public toString() - returns the number as a string
 * @public equals(value) - returns true if the value is equal to the number
 * @public toJSON() - returns the number as a string
 * @public toHex() - returns the number as a string
 */
export class AppNumber {
  /**
   * @dev value - represents the value of the number
   * @private
   */
  private readonly value: Decimal;

  /**
   * @notice constructors initializes AppNumber instance
   * @param value
   */
  constructor(value: string | bigint | number) {
    this.value = new Decimal(value.toString());
  }

  /**
   * @notice from(value) - creates a new AppNumber instance from primitive value
   * @param value
   */
  public static from(value: string | bigint | number) {
    return new AppNumber(value);
  }

  /**
   * @notice getValue() - returns the value of the number
   */
  public getValue(): Decimal {
    return this.value;
  }

  /**
   * @notice getDisplayedString() - returns the number as a string
   */
  public getDisplayedString(renderForMobile = false): string {
    if (!renderForMobile || this.value.toNumber() < 10000) {
      return (
        // TODO: recheck the null case
        new UtilsProvider().getDisplayedDecimals(this.value.toNumber()) || ""
      );
    }

    return new UtilsProvider().shorterNumber(this.value.toNumber()).toString();
  }

  public equals(value: AppNumber) {
    return this.value.equals(value.getValue());
  }

  /**
   * @notice add(value) - adds the value to the number
   * @param value
   */
  public add(value: AppNumber) {
    return new AppNumber(
      this.value.plus(value.getValue().toNumber()).toNumber()
    );
  }

  /**
   * @notice subtract(value) - subtracts the value from the number
   * @param value
   */
  public subtract(value: AppNumber) {
    return new AppNumber(
      this.value.minus(value.getValue().toNumber()).toNumber()
    );
  }

  /**
   * @notice multiply(value) - multiplies the number by the value
   * @param value
   */
  public multiply(value: AppNumber) {
    return new AppNumber(
      this.value.times(value.getValue().toNumber()).toNumber()
    );
  }

  /**
   * @notice divide(value) - divides the number by the value
   * @param value
   */
  public divide(value: AppNumber) {
    return new AppNumber(
      this.value.dividedBy(value.getValue().toNumber()).toNumber()
    );
  }

  /**
   * @notice pow(value) - raises the number to the power of the value
   * @param value
   */
  public pow(value: AppNumber) {
    return new AppNumber(
      this.value.pow(value.getValue().toNumber()).toNumber()
    );
  }

  /**
   * @notice gt(other) - check if the number is greater than other.
   * @param other
   */
  public gt(other: AppNumber): boolean {
    return this.value.greaterThan(other.getValue());
  }

  /**
   * @notice gt(other) - check if the number is greater than or equals to other.
   * @param other
   */
  public gte(other: AppNumber): boolean {
    return this.value.greaterThanOrEqualTo(other.getValue());
  }

  /**
   * @notice gt(other) - check if the number is equals to other.
   * @param other
   */
  public eq(other: AppNumber): boolean {
    return this.value.eq(other.getValue());
  }

  /**
   * @notice gt(other) - check if the number is less than or equal to other.
   * @param other
   */
  public lte(other: AppNumber): boolean {
    return this.value.lessThanOrEqualTo(other.getValue());
  }

  /**
   * @notice gt(other) - check if the number is less than other.
   * @param other
   */
  public lt(other: AppNumber): boolean {
    return this.value.lessThan(other.getValue());
  }

  /**
   * @notice toNumber() - returns the number as a number
   */
  public toNumber() {
    return this.value.toNumber();
  }

  /**
   * @notice toBigNumber() - returns the number as a number
   */
  public toBigNumber() {
    return BigInt(this.value.toFixed(0));
  }

  /**
   * @notice toString() - returns the number as a string
   */
  public toString(): string {
    return this.value.toString();
  }

  /**
   * @notice toIntegerString() - returns the number as a string
   */
  public toIntegerString(): string {
    return this.value.toFixed(0);
  }

  /**
   * @notice toJSON() - returns the number as a string
   */
  public toJSON(): string {
    return this.value.toString();
  }

  /**
   * @notice toHex() - returns the number as a string
   */
  public toHex(): string {
    return this.value.toHex();
  }
}
