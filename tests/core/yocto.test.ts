import { describe, it, expect } from "vitest";
import {
  toBigIntYocto,
  nearToYocto,
  yoctoToNear,
  addYocto,
  subYocto,
  compareYocto,
  YOCTO_PER_NEAR,
} from "../../src/core/math/yocto";

describe("Integer-Safe Financial Arithmetic (YoctoNEAR)", () => {
  it("converts 1 NEAR to exactly 10^24 yoctoNEAR", () => {
    const yocto = nearToYocto("1");
    expect(yocto).toBe(1000000000000000000000000n);
    expect(yocto).toBe(YOCTO_PER_NEAR);
  });

  it("converts fractional NEAR strings with exact 24-decimal precision without floats", () => {
    const halfNear = nearToYocto("0.5");
    expect(halfNear).toBe(500000000000000000000000n);

    const microNear = nearToYocto("0.000001");
    expect(microNear).toBe(1000000000000000000n);

    const oneYocto = nearToYocto("0.000000000000000000000001");
    expect(oneYocto).toBe(1n);
  });

  it("handles numbers far exceeding Number.MAX_SAFE_INTEGER without precision loss", () => {
    const hugeNear = nearToYocto("100000000"); // 100 million NEAR = 10^32 yoctoNEAR
    expect(hugeNear > BigInt(Number.MAX_SAFE_INTEGER)).toBe(true);
    expect(hugeNear.toString()).toBe("100000000000000000000000000000000");
  });

  it("converts yoctoNEAR back to human readable NEAR string accurately", () => {
    expect(yoctoToNear(1000000000000000000000000n)).toBe("1");
    expect(yoctoToNear(1500000000000000000000000n)).toBe("1.5");
    expect(yoctoToNear(0n)).toBe("0");
    expect(yoctoToNear("250000000000000000000000")).toBe("0.25");
  });

  it("rejects negative numbers and decimals in atomic yocto amounts", () => {
    expect(() => toBigIntYocto("-100")).toThrow();
    expect(() => toBigIntYocto("1.5")).toThrow();
    expect(() => nearToYocto("-1")).toThrow();
  });

  it("adds and subtracts yoctoNEAR with underflow protection", () => {
    const a = nearToYocto("10");
    const b = nearToYocto("5");
    expect(addYocto(a, b)).toBe(nearToYocto("15"));
    expect(subYocto(a, b)).toBe(nearToYocto("5"));
    expect(() => subYocto(b, a)).toThrow(/underflow/);
  });

  it("correctly compares yoctoNEAR amounts", () => {
    const smaller = nearToYocto("1.0");
    const larger = nearToYocto("1.1");
    expect(compareYocto(smaller, larger)).toBe(-1);
    expect(compareYocto(larger, smaller)).toBe(1);
    expect(compareYocto(smaller, smaller)).toBe(0);
  });
});
