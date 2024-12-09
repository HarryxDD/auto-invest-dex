/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */

import { encode } from "bs58";
import Decimal from "decimal.js";

export class UtilsProvider {
  /**
   * @dev The function to scroll to a specific element.
   * @param element The element to scroll to.
   * @param to The position to scroll to.
   * @param duration The duration to scroll.
   * @returns The promise.
   */
  // public scrollTo(element: HTMLElement, to: number, duration: number) {
  //   const start = element.scrollTop,
  //     change = to - start,
  //     startDate = +new Date(),
  //     easeInOutQuad = function (t: any, b: any, c: any, d: any) {
  //       t /= d / 2;
  //       if (t < 1) return (c / 2) * t * t + b;
  //       t--;
  //       return (-c / 2) * (t * (t - 2) - 1) + b;
  //     },
  //     animateScroll = function () {
  //       const currentDate = +new Date();
  //       const currentTime = currentDate - startDate;
  //       element.scrollTop = parseInt(
  //         easeInOutQuad(currentTime, start, change, duration)
  //       );
  //       if (currentTime < duration) {
  //         requestAnimationFrame(animateScroll);
  //       } else {
  //         element.scrollTop = to;
  //       }
  //     };
  //   animateScroll();
  // }
  /**
   * The function to randomize a string based on base58 hash algorithm
   */
  public randomize(): string {
    const seed = new Date().getUTCMilliseconds().toString();
    return encode(new TextEncoder().encode(seed));
  }

  /**
   * The function to provide interval operation with setTimeout behind the scene.
   * @param handler
   * @param msec
   */
  public withInterval(handler: () => void | Promise<void>, msec: number) {
    /**
     * Stopped flag
     */
    let isStopped = false;

    /**
     * Construct handler
     */
    const timeOutHandler = () => {
      setTimeout(async () => {
        console.log("running interval ...");
        if (isStopped) return;

        await handler();
        await timeOutHandler();
      }, msec);
    };

    /**
     * Trigger handler
     */
    timeOutHandler();

    /**
     * The stop handler
     */
    return () => {
      isStopped = true;
    };
  }

  /**
   * The function to provide a wrapper to return null if the process duration exceeds a certain msec.
   * @param handler
   * @param msec
   */
  public withTimeout<Result>(
    handler: () => Result | Promise<Result>,
    msec: number
  ): Promise<Result | null> {
    return new Promise(async (resolve, reject) => {
      /**
       * Assign a random value to make sure it's unique
       */
      const randomizedValue = this.randomize();
      let result: Result | string = randomizedValue;

      /**
       * Make a setTimeout to resolve the value
       */
      setTimeout(() => {
        /**
         * Compare the result to randomized value and return null.
         */
        if (result === randomizedValue) {
          console.log(
            `Process exceeded ${msec} ms and returned null. Process: ${handler}`
          );
          return resolve(null);
        }
      }, msec);

      try {
        /**
         * Assign the expected returned value
         */
        result = await handler();
        return resolve(result);
      } catch (e) {
        /**
         * Re-assign as rather other value than randomized value
         */
        result = "";
        /**
         * If any errors occur, reserve the errors
         */
        return reject(e);
      }
    });
  }

  /**
   * @description Short text
   * @param value
   * @param size
   */
  public makeShort(value = "", size = 5) {
    const arr = value.split("");
    if (arr.length > size) {
      return (
        arr.splice(0, size).join("") +
        "..." +
        arr.splice(arr.length - size, size).join("")
      );
    }
    return arr.splice(0, size).join("");
  }

  /**
   * @dev The function to format long number to short text
   * @var {number} num
   * @var {number} digits
   */
  static formatLongNumber(num: number) {
    // Return the number if it's less than 1000.
    if (num <= 1000) {
      return num.toString();
    }

    let counter = 0;
    let arr = num.toString().split("");
    const idxDecimal = arr.indexOf(".");
    const decimalArr = arr.slice(idxDecimal, arr.length);

    // Modify the array to remove the decimal part.
    arr = arr.slice(0, idxDecimal > 0 ? idxDecimal : arr.length).reverse();

    // This is the main part. It will add the comma after every third digit.
    arr = arr.map((c, index) => {
      // Reset the counter after every third digit.
      counter += 1;

      // Add the comma.
      if (counter === 3 && index < arr.length - 1) {
        counter = 0;
        return "," + c;
      }

      // Return the digit if it's not the time to add the comma.
      return c;
    });

    return arr
      .reverse()
      .concat(idxDecimal > 0 ? decimalArr : [])
      .join("");
  }

  /**
   * @dev The function to convert text time to millisecond.
   * @notice Example: 1W => 604800000
   * @param textTime The text time to convert.
   */
  public convertTextTimeToMillisecond(textTime: string) {
    // Define the time unit.
    const timeUnit = {
      s: 1000,
      m: 60000,
      h: 3600000,
      d: 86400000,
      w: 604800000,
      y: 31536000000,
    };

    const number = textTime.substring(0, textTime.length - 1);
    const unit = textTime.substring(textTime.length - 1);

    if (Object.keys(timeUnit).indexOf(unit?.toLowerCase()) === -1) {
      return 0;
    }

    // Return the converted time.
    return parseInt(number) * (timeUnit as any)?.[unit.toLowerCase()];
  }

  /**
   * @dev The function to caculate the duration between two timestamps.
   * @param start The start timestamp.
   * @param end The end timestamp.
   * @returns The duration in text.
   */
  public caculateDuration(start: number, end: number) {
    const duration = end - start;
    const timeUnit = {
      s: 1000,
      m: 60000,
      h: 3600000,
      d: 86400000,
      w: 604800000,
      y: 31536000000,
    };

    const unitLabels = {
      s: "seconds",
      m: "minutes",
      h: "hours",
      d: "days",
      w: "weeks",
      y: "years",
    };

    // console.log({
    //   startDate: new Date(start),
    //   endDate: new Date(end),
    //   duration,
    // });

    let unit = Object.keys(timeUnit).find(
      (unit) => duration / (timeUnit as any)?.[unit] < 1
    );

    //@dev Return seconds if the duration is less than 1 minute.
    if (!unit && duration < timeUnit.y) {
      return `${duration / 1000}s`;
    }

    if (duration > timeUnit.y) {
      const dValue = (duration / timeUnit.y).toFixed(2);
      return `${dValue} years`;
    }

    //@dev Return the duration in text.
    if (unit) {
      unit = Object.keys(timeUnit)[Object.keys(timeUnit).indexOf(unit) - 1];
      return `${Math.floor(duration / (timeUnit as any)?.[unit])} ${
        (unitLabels as any)?.[unit]
      }`;
    }
  }

  /**
   * @dev The function to get subscript string.
   * @param str The string to get subscript.
   * @returns The subscript string.
   */
  public getSubscriptStr(str: string): string | undefined {
    // Define the subscript object.
    const subscripts = {
      "0": "₀",
      "1": "₁",
      "2": "₂",
      "3": "₃",
      "4": "₄",
      "5": "₅",
      "6": "₆",
      "7": "₇",
      "8": "₈",
      "9": "₉",
      "+": "₊",
      "-": "₋",
      "=": "₌",
      "(": "₍",
      ")": "₎",
    };

    // Return the subscript string.
    return str
      .split("")
      .map((char) => (subscripts as any)[char])
      .join("");
  }

  public getSupscriptStr(str: string): string | undefined {
    const superscripts = {
      "0": "⁰",
      "1": "¹",
      "2": "²",
      "3": "³",
      "4": "⁴",
      "5": "⁵",
      "6": "⁶",
      "7": "⁷",
      "8": "⁸",
      "9": "⁹",
      "+": "⁺",
      "-": "⁻",
      "=": "⁼",
      "(": "⁽",
      ")": "⁾",
      n: "ⁿ",
      i: "ⁱ",
    };

    return str
      .split("")
      .map((char) => (superscripts as any)[char])
      .join("");
  }

  /**
   * @dev The function to format currency from raw number based on fraction digits.
   * @param number source number to format.
   * @param fractionDigits the digits to display after the decimal point.
   * @returns formatted number.
   */
  public formatCurrency(number: string | number, fractionDigits = 3) {
    // Round to specified number of decimal places.
    const roundedNumber = Number(number)
      .toFixed(fractionDigits)
      .replace(/\.?0+$/, "");

    // Split into integer and fractional parts.
    const parts = roundedNumber.toString().split(".");

    // Add commas as thousands separators if integer part has at least four digits.
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Join integer and fractional parts with a decimal point
    return parts.join(".");
  }

  /**
   * @dev The function to format long number.
   * @param number The number to be formatted.
   * @returns {string} Formatted string.
   */
  public formatLongNumber(number: number) {
    let r = "";
    if (number < 1000) {
      r = number.toString();
    } else if (number < 1000000) {
      r = (number / 1000).toFixed(1) + "K";
    } else {
      r = (number / 1000000).toFixed(1) + "M";
    }

    return r.replace(".", ",");
  }

  /**
   * @dev The function to format long number.
   * @param {number} The number to be formatted.
   * @returns {string} Formatted string.
   */
  public shorterNumber(longNum: number) {
    const num = Number(longNum.toString().replace(/[^0-9.]/g, ""));
    if (num < 1000) {
      return num;
    }
    const si = [
      { v: 1e3, s: "K" },
      { v: 1e6, s: "M" },
      { v: 1e9, s: "B" },
      { v: 1e12, s: "T" },
      { v: 1e15, s: "P" },
      { v: 1e18, s: "E" },
    ];
    let index;
    for (index = si.length - 1; index > 0; index--) {
      if (num >= si[index].v) {
        break;
      }
    }
    return (
      (num / si[index].v).toFixed(2).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") +
      si[index].s
    );
  }

  /**
   * @dev The function to get displayed decimals.
   * @param veryComplexDecimalsValue this is the value that has many decimals.
   * @returns value with displayed decimals.
   */
  public getDisplayedDecimals(veryComplexDecimalsValue: number) {
    // Return null if the value is not a number.
    if (isNaN(veryComplexDecimalsValue)) return null;

    // Convert the value to string and remove the trailing zeros.
    const valueStr = new Decimal(veryComplexDecimalsValue).toFixed();
    const newStr = valueStr.replace(/(0)+$/, "");
    const zeroMatched = newStr.match(/\.(0)+/);

    // Return the value if there is no zero matched or the zero matched length is less than 3.
    if (!zeroMatched || zeroMatched[0]?.replace(".", "").split("").length < 3) {
      return Number(
        new Decimal(veryComplexDecimalsValue).toFixed(5).replace(/0+$/, "")
      ).toString();
    }

    // Split the value into base value and rest value.
    const baseValue = newStr.split(".")[0];
    // Get the total zero count.
    const [matchedStr] = zeroMatched;
    // Get the total zero count by removing the dot.
    const totalZero = matchedStr.replace(".", "").split("").length;
    // Get the rest value by removing the base value and matched zero value.
    const restValue = newStr.replace(`${baseValue}${matchedStr}`, "");

    return `${this.formatCurrency(baseValue)}.0${this.getSubscriptStr(
      totalZero.toString()
    )}${(restValue.length > 5 ? restValue.substring(0, 5) : restValue).replace(
      /0+$/,
      ""
    )}`;
  }

  /**
   * @dev The function to make a copy of an object.
   * @param obj The object to copy.
   * @returns The copied object.
   */
  public cloneObject(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * @dev The function to convert an instance to plain object.
   * @param obj
   */
  public instanceToPlain(obj: any) {
    return this.cloneObject(obj);
  }

  public mergeDateAndTime(date: Date, time: Date) {
    // Extract date components from firstBatchDate
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Extract time components from firstBatchTime
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    // Create a new Date object combining both date and time components
    const combinedDateTime = new Date(year, month, day, hours, minutes, seconds);
    return combinedDateTime;
  }
}
