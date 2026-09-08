// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// NUMBER / METRIC UTILITIES
// Version: 2026.09
// ============================================================

/**
 * Числовые функции проекта.
 *
 * ВАЖНО:
 * Обычный JavaScript Number безопасен только
 * до Number.MAX_SAFE_INTEGER.
 *
 * Для административных метрик, счётчиков и значений,
 * которые могут быть больше 9.22e18, используем
 * decimal-string операции.
 */

// ============================================================
// TYPES
// ============================================================

export type DecimalString = string;

export interface NumberRange {
  min: number;
  max: number;
}

// ============================================================
// BASIC
// ============================================================

export function isNumber(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

export function isInteger(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value)
  );
}

export function isSafeInteger(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value)
  );
}

// ============================================================
// DECIMAL STRING NORMALIZATION
// ============================================================

export function normalizeDecimalString(
  value: unknown
): DecimalString | null {
  if (
    typeof value === "number"
  ) {
    if (
      !Number.isFinite(value) ||
      !Number.isInteger(value) ||
      value < 0
    ) {
      return null;
    }

    if (
      !Number.isSafeInteger(value)
    ) {
      return null;
    }

    return String(value);
  }

  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  if (
    !/^\d+$/.test(normalized)
  ) {
    return null;
  }

  const withoutLeadingZeros =
    normalized.replace(
      /^0+(?=\d)/,
      ""
    );

  return (
    withoutLeadingZeros ||
    "0"
  );
}

// ============================================================
// DECIMAL STRING VALIDATION
// ============================================================

export function isDecimalString(
  value: unknown
): value is DecimalString {
  return (
    normalizeDecimalString(
      value
    ) !== null
  );
}

// ============================================================
// DECIMAL COMPARISON
// ============================================================

export function compareDecimalStrings(
  a: string,
  b: string
): -1 | 0 | 1 {
  const left =
    normalizeDecimalString(a);

  const right =
    normalizeDecimalString(b);

  if (
    left === null ||
    right === null
  ) {
    throw new Error(
      "Invalid decimal string"
    );
  }

  if (
    left.length <
    right.length
  ) {
    return -1;
  }

  if (
    left.length >
    right.length
  ) {
    return 1;
  }

  if (left === right) {
    return 0;
  }

  return left < right
    ? -1
    : 1;
}

// ============================================================
// DECIMAL ADDITION
// ============================================================

export function addDecimalStrings(
  a: string,
  b: string
): DecimalString {
  const left =
    normalizeDecimalString(a);

  const right =
    normalizeDecimalString(b);

  if (
    left === null ||
    right === null
  ) {
    throw new Error(
      "Invalid decimal string"
    );
  }

  let i =
    left.length - 1;

  let j =
    right.length - 1;

  let carry = 0;

  const digits: string[] = [];

  while (
    i >= 0 ||
    j >= 0 ||
    carry > 0
  ) {
    const x =
      i >= 0
        ? Number(left[i])
        : 0;

    const y =
      j >= 0
        ? Number(right[j])
        : 0;

    const sum =
      x + y + carry;

    digits.push(
      String(sum % 10)
    );

    carry =
      Math.floor(sum / 10);

    i--;
    j--;
  }

  return digits
    .reverse()
    .join("")
    .replace(
      /^0+(?=\d)/,
      ""
    );
}

// ============================================================
// DECIMAL SUBTRACTION
// ============================================================

export function subtractDecimalStrings(
  a: string,
  b: string
): DecimalString {
  const left =
    normalizeDecimalString(a);

  const right =
    normalizeDecimalString(b);

  if (
    left === null ||
    right === null
  ) {
    throw new Error(
      "Invalid decimal string"
    );
  }

  if (
    compareDecimalStrings(
      left,
      right
    ) < 0
  ) {
    throw new Error(
      "Decimal subtraction would become negative"
    );
  }

  let i =
    left.length - 1;

  let j =
    right.length - 1;

  let borrow = 0;

  const digits: string[] = [];

  while (i >= 0) {
    let x =
      Number(left[i]) -
      borrow;

    const y =
      j >= 0
        ? Number(right[j])
        : 0;

    if (x < y) {
      x += 10;
      borrow = 1;
    } else {
      borrow = 0;
    }

    digits.push(
      String(x - y)
    );

    i--;
    j--;
  }

  return digits
    .reverse()
    .join("")
    .replace(
      /^0+(?=\d)/,
      ""
    );
}

// ============================================================
// DECIMAL INCREMENT
// ============================================================

export function incrementDecimal(
  value: string
): DecimalString {
  return addDecimalStrings(
    value,
    "1"
  );
}

// ============================================================
// DECIMAL DECREMENT
// ============================================================

export function decrementDecimal(
  value: string
): DecimalString {
  return subtractDecimalStrings(
    value,
    "1"
  );
}

// ============================================================
// DECIMAL MULTIPLICATION
// ============================================================

export function multiplyDecimalStrings(
  a: string,
  b: string
): DecimalString {
  const left =
    normalizeDecimalString(a);

  const right =
    normalizeDecimalString(b);

  if (
    left === null ||
    right === null
  ) {
    throw new Error(
      "Invalid decimal string"
    );
  }

  if (
    left === "0" ||
    right === "0"
  ) {
    return "0";
  }

  const result = new Array<number>(
    left.length +
      right.length
  ).fill(0);

  for (
    let i =
      left.length - 1;
    i >= 0;
    i--
  ) {
    for (
      let j =
        right.length - 1;
      j >= 0;
      j--
    ) {
      const index =
        i + j + 1;

      result[index] +=
        Number(left[i]) *
        Number(right[j]);
    }
  }

  for (
    let i =
      result.length - 1;
    i > 0;
    i--
  ) {
    if (
      result[i] >= 10
    ) {
      result[i - 1] +=
        Math.floor(
          result[i] / 10
        );

      result[i] %= 10;
    }
  }

  return result
    .join("")
    .replace(
      /^0+(?=\d)/,
      ""
    );
}

// ============================================================
// DECIMAL DIVISION
// ============================================================

export function divideDecimalStrings(
  dividend: string,
  divisor: string
): DecimalString {
  const a =
    normalizeDecimalString(
      dividend
    );

  const b =
    normalizeDecimalString(
      divisor
    );

  if (
    a === null ||
    b === null
  ) {
    throw new Error(
      "Invalid decimal string"
    );
  }

  if (b === "0") {
    throw new Error(
      "Division by zero"
    );
  }

  if (
    compareDecimalStrings(
      a,
      b
    ) < 0
  ) {
    return "0";
  }

  let remainder = "0";
  let quotient = "";

  for (
    const digit of a
  ) {
    remainder =
      normalizeDecimalString(
        remainder + digit
      ) ?? "0";

    let q = 0;

    while (
      compareDecimalStrings(
        remainder,
        b
      ) >= 0
    ) {
      remainder =
        subtractDecimalStrings(
          remainder,
          b
        );

      q++;
    }

    quotient += String(q);
  }

  return (
    quotient.replace(
      /^0+(?=\d)/,
      ""
    ) || "0"
  );
}

// ============================================================
// MODULO
// ============================================================

export function moduloDecimalStrings(
  dividend: string,
  divisor: string
): DecimalString {
  const quotient =
    divideDecimalStrings(
      dividend,
      divisor
    );

  const multiplied =
    multiplyDecimalStrings(
      quotient,
      divisor
    );

  return subtractDecimalStrings(
    dividend,
    multiplied
  );
}

// ============================================================
// BIG METRIC HELPERS
// ============================================================

export function metricToString(
  value: unknown
): DecimalString {
  const normalized =
    normalizeDecimalString(
      value
    );

  if (
    normalized === null
  ) {
    return "0";
  }

  return normalized;
}

export function addMetric(
  current: unknown,
  amount: unknown = 1
): DecimalString {
  return addDecimalStrings(
    metricToString(current),
    metricToString(amount)
  );
}

export function subtractMetric(
  current: unknown,
  amount: unknown = 1
): DecimalString {
  const currentValue =
    metricToString(current);

  const amountValue =
    metricToString(amount);

  if (
    compareDecimalStrings(
      currentValue,
      amountValue
    ) < 0
  ) {
    return "0";
  }

  return subtractDecimalStrings(
    currentValue,
    amountValue
  );
}

// ============================================================
// NUMBER CLAMP
// ============================================================

export function clamp(
  value: number,
  min: number,
  max: number
): number {
  if (
    !Number.isFinite(value)
  ) {
    return min;
  }

  if (
    min > max
  ) {
    return Math.min(
      Math.max(value, max),
      min
    );
  }

  return Math.min(
    Math.max(value, min),
    max
  );
}

// ============================================================
// INTEGER CLAMP
// ============================================================

export function clampInteger(
  value: number,
  min: number,
  max: number
): number {
  return Math.round(
    clamp(
      value,
      min,
      max
    )
  );
}

// ============================================================
// SAFE PARSING
// ============================================================

export function toNumber(
  value: unknown,
  fallback = 0
): number {
  if (
    typeof value === "number"
  ) {
    return Number.isFinite(
      value
    )
      ? value
      : fallback;
  }

  if (
    typeof value === "string"
  ) {
    const parsed =
      Number(value);

    return Number.isFinite(
      parsed
    )
      ? parsed
      : fallback;
  }

  return fallback;
}

export function toInteger(
  value: unknown,
  fallback = 0
): number {
  const number =
    toNumber(
      value,
      fallback
    );

  return Number.isInteger(
    number
  )
    ? number
    : Math.trunc(number);
}

export function toPositiveInteger(
  value: unknown,
  fallback = 1
): number {
  const number =
    toInteger(
      value,
      fallback
    );

  return number > 0
    ? number
    : fallback;
}

// ============================================================
// PERCENTAGE
// ============================================================

export function percentage(
  value: number,
  total: number,
  precision = 2
): number {
  if (
    !Number.isFinite(value) ||
    !Number.isFinite(total) ||
    total === 0
  ) {
    return 0;
  }

  const result =
    (value / total) *
    100;

  return round(
    result,
    precision
  );
}

// ============================================================
// ROUNDING
// ============================================================

export function round(
  value: number,
  decimals = 0
): number {
  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }

  const factor =
    10 **
    Math.max(
      0,
      Math.min(
        decimals,
        20
      )
    );

  return (
    Math.round(
      (value + Number.EPSILON) *
        factor
    ) / factor
  );
}

export function floor(
  value: number,
  decimals = 0
): number {
  const factor =
    10 ** Math.max(
      0,
      decimals
    );

  return (
    Math.floor(
      value * factor
    ) / factor
  );
}

export function ceil(
  value: number,
  decimals = 0
): number {
  const factor =
    10 ** Math.max(
      0,
      decimals
    );

  return (
    Math.ceil(
      value * factor
    ) / factor
  );
}

// ============================================================
// FORMAT
// ============================================================

export function formatNumber(
  value: number,
  locale = "ru-RU"
): string {
  if (
    !Number.isFinite(value)
  ) {
    return "0";
  }

  return new Intl.NumberFormat(
    locale
  ).format(value);
}

// ============================================================
// FORMAT BIG METRIC
// ============================================================

export function formatMetric(
  value: unknown,
  locale = "ru-RU"
): string {
  const decimal =
    metricToString(value);

  if (
    decimal.length <= 15
  ) {
    const number =
      Number(decimal);

    if (
      Number.isSafeInteger(
        number
      )
    ) {
      return new Intl.NumberFormat(
        locale
      ).format(number);
    }
  }

  return formatDecimalGrouped(
    decimal
  );
}

// ============================================================
// DECIMAL GROUPING
// ============================================================

export function formatDecimalGrouped(
  value: string
): string {
  const normalized =
    normalizeDecimalString(
      value
    );

  if (
    normalized === null
  ) {
    return "0";
  }

  let result = "";

  for (
    let i = 0;
    i < normalized.length;
    i++
  ) {
    if (
      i > 0 &&
      (
        normalized.length -
        i
      ) %
        3 ===
        0
    ) {
      result += " ";
    }

    result +=
      normalized[i];
  }

  return result;
}

// ============================================================
// COMPACT METRIC
// ============================================================

export function compactMetric(
  value: unknown
): string {
  const decimal =
    metricToString(value);

  if (
    decimal.length <= 3
  ) {
    return decimal;
  }

  const groups = [
    {
      digits: 3,
      suffix: "K",
    },
    {
      digits: 6,
      suffix: "M",
    },
    {
      digits: 9,
      suffix: "B",
    },
    {
      digits: 12,
      suffix: "T",
    },
    {
      digits: 15,
      suffix: "Qa",
    },
    {
      digits: 18,
      suffix: "Qi",
    },
    {
      digits: 21,
      suffix: "Sx",
    },
    {
      digits: 24,
      suffix: "Sp",
    },
    {
      digits: 27,
      suffix: "Oc",
    },
    {
      digits: 30,
      suffix: "No",
    },
  ];

  for (
    let i =
      groups.length - 1;
    i >= 0;
    i--
  ) {
    const group =
      groups[i];

    if (
      decimal.length >=
      group.digits
    ) {
      const integerPart =
        decimal.slice(
          0,
          decimal.length -
            group.digits
        );

      const decimalPart =
        decimal.slice(
          decimal.length -
            group.digits,
          decimal.length -
            group.digits +
            2
        );

      const formatted =
        decimalPart
          ? `${integerPart}.${decimalPart}`
          : integerPart;

      return `${formatted} ${group.suffix}`;
    }
  }

  return decimal;
}

// ============================================================
// MIN / MAX
// ============================================================

export function min(
  ...values: number[]
): number {
  const valid =
    values.filter(
      Number.isFinite
    );

  return valid.length
    ? Math.min(...valid)
    : 0;
}

export function max(
  ...values: number[]
): number {
  const valid =
    values.filter(
      Number.isFinite
    );

  return valid.length
    ? Math.max(...valid)
    : 0;
}

// ============================================================
// RANGE
// ============================================================

export function isInRange(
  value: number,
  minValue: number,
  maxValue: number
): boolean {
  return (
    Number.isFinite(value) &&
    value >= minValue &&
    value <= maxValue
  );
}

export function normalizeRange(
  minValue: number,
  maxValue: number
): NumberRange {
  if (
    minValue <= maxValue
  ) {
    return {
      min: minValue,
      max: maxValue,
    };
  }

  return {
    min: maxValue,
    max: minValue,
  };
}

// ============================================================
// RATIO
// ============================================================

export function ratio(
  value: number,
  total: number,
  precision = 4
): number {
  if (
    !Number.isFinite(value) ||
    !Number.isFinite(total) ||
    total === 0
  ) {
    return 0;
  }

  return round(
    value / total,
    precision
  );
}

// ============================================================
// AVERAGE
// ============================================================

export function average(
  values: number[]
): number {
  const valid =
    values.filter(
      Number.isFinite
    );

  if (
    valid.length === 0
  ) {
    return 0;
  }

  return (
    valid.reduce(
      (sum, value) =>
        sum + value,
      0
    ) /
    valid.length
  );
}

// ============================================================
// SUM
// ============================================================

export function sum(
  values: number[]
): number {
  return values
    .filter(
      Number.isFinite
    )
    .reduce(
      (total, value) =>
        total + value,
      0
    );
}

// ============================================================
// RANDOM INTEGER
// ============================================================

export function randomInteger(
  minValue: number,
  maxValue: number
): number {
  const min =
    Math.ceil(minValue);

  const max =
    Math.floor(maxValue);

  if (
    min > max
  ) {
    throw new Error(
      "Invalid random integer range"
    );
  }

  const range =
    max - min + 1;

  if (
    range <=
    0xffffffff
  ) {
    const bytes =
      new Uint32Array(1);

    crypto.getRandomValues(
      bytes
    );

    return (
      min +
      (
        bytes[0] %
        range
      )
    );
  }

  return Math.floor(
    Math.random() *
      range
  ) + min;
}

// ============================================================
// END
// ============================================================
