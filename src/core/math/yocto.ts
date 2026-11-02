/**
 * WARDEN — Integer-Safe Financial Arithmetic Module for NEAR Protocol
 *
 * 1 NEAR = 10^24 yoctoNEAR (1,000,000,000,000,000,000,000,000 yoctoNEAR).
 * JavaScript Number.MAX_SAFE_INTEGER is 2^53 - 1 (9,007,199,254,740,991).
 * Standard floating-point calculations cause catastrophic rounding and financial loss.
 *
 * This module enforces strictly integer-safe arithmetic using native BigInt.
 */

export const YOCTO_PER_NEAR = 10n ** 24n;
export const ZERO_YOCTO = 0n;

/**
 * Safely parses any yoctoNEAR string or BigInt into a validated non-negative BigInt.
 * Throws on negative values or invalid formats.
 */
export function toBigIntYocto(val: string | bigint): bigint {
  if (typeof val === "bigint") {
    if (val < 0n) {
      throw new Error(`YoctoNEAR amount cannot be negative: ${val}`);
    }
    return val;
  }

  const trimmed = val.trim();
  if (!trimmed) {
    return 0n;
  }

  // Reject decimal points in raw yocto strings (yocto is the smallest atomic unit)
  if (trimmed.includes(".")) {
    throw new Error(`Atomic yoctoNEAR string must not contain decimal points: "${val}"`);
  }

  if (trimmed.startsWith("-")) {
    throw new Error(`YoctoNEAR amount cannot be negative: "${val}"`);
  }

  try {
    const result = BigInt(trimmed);
    if (result < 0n) {
      throw new Error(`YoctoNEAR amount cannot be negative: "${val}"`);
    }
    return result;
  } catch (err) {
    throw new Error(`Invalid yoctoNEAR integer string: "${val}"`);
  }
}

/**
 * Converts a human-readable NEAR decimal string (e.g., "1.5", "0.0001", "100")
 * to exact yoctoNEAR BigInt without ever using JavaScript floating-point numbers.
 */
export function nearToYocto(nearStr: string): bigint {
  const trimmed = nearStr.trim();
  if (!trimmed) return 0n;
  if (trimmed.startsWith("-")) {
    throw new Error(`NEAR amount cannot be negative: "${nearStr}"`);
  }

  const parts = trimmed.split(".");
  if (parts.length > 2) {
    throw new Error(`Invalid decimal format for NEAR: "${nearStr}"`);
  }

  const whole = parts[0] || "0";
  const fraction = parts[1] || "";

  if (fraction.length > 24) {
    throw new Error(`NEAR amount exceeds 24 decimal places of precision: "${nearStr}"`);
  }

  // Pad the fractional part to 24 decimals
  const paddedFraction = fraction.padEnd(24, "0");

  const wholeYocto = BigInt(whole) * YOCTO_PER_NEAR;
  const fractionYocto = BigInt(paddedFraction);

  return wholeYocto + fractionYocto;
}

/**
 * Converts a yoctoNEAR BigInt or string to human-readable NEAR string
 * using pure integer string division and decimal insertion.
 */
export function yoctoToNear(yoctoVal: bigint | string, maxDecimals: number = 6): string {
  const yocto = toBigIntYocto(yoctoVal);
  if (yocto === 0n) return "0";

  const wholePart = (yocto / YOCTO_PER_NEAR).toString();
  const remainder = (yocto % YOCTO_PER_NEAR).toString().padStart(24, "0");

  if (maxDecimals <= 0) {
    return wholePart;
  }

  // Truncate to maxDecimals
  const truncatedFraction = remainder.slice(0, maxDecimals).replace(/0+$/, "");

  if (!truncatedFraction) {
    return wholePart;
  }

  return `${wholePart}.${truncatedFraction}`;
}

export function addYocto(a: string | bigint, b: string | bigint): bigint {
  return toBigIntYocto(a) + toBigIntYocto(b);
}

export function subYocto(a: string | bigint, b: string | bigint): bigint {
  const bigA = toBigIntYocto(a);
  const bigB = toBigIntYocto(b);
  if (bigB > bigA) {
    throw new Error(`YoctoNEAR subtraction underflow: ${bigA} - ${bigB}`);
  }
  return bigA - bigB;
}

/**
 * Returns:
 *  1 if a > b
 * -1 if a < b
 *  0 if a === b
 */
export function compareYocto(a: string | bigint, b: string | bigint): -1 | 0 | 1 {
  const bigA = toBigIntYocto(a);
  const bigB = toBigIntYocto(b);
  if (bigA > bigB) return 1;
  if (bigA < bigB) return -1;
  return 0;
}

export function isGreaterThan(a: string | bigint, b: string | bigint): boolean {
  return compareYocto(a, b) === 1;
}

export function isGreaterThanOrEqual(a: string | bigint, b: string | bigint): boolean {
  const cmp = compareYocto(a, b);
  return cmp === 1 || cmp === 0;
}
