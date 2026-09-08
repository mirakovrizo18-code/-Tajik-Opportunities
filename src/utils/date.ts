// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// DATE / TIME UTILITIES
// Version: 2026.09
// ============================================================

import type {
  ISODateString,
} from "../types";

// ============================================================
// TYPES
// ============================================================

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

// ============================================================
// NOW
// ============================================================

export function now(): Date {
  return new Date();
}

export function nowIso(): ISODateString {
  return new Date()
    .toISOString() as ISODateString;
}

export function timestamp(): number {
  return Date.now();
}

// ============================================================
// PARSE
// ============================================================

export function parseDate(
  value: unknown
): Date | null {
  if (
    value instanceof Date
  ) {
    return isValidDate(value)
      ? new Date(value.getTime())
      : null;
  }

  if (
    typeof value !== "string" &&
    typeof value !== "number"
  ) {
    return null;
  }

  const date =
    new Date(value);

  return isValidDate(date)
    ? date
    : null;
}

// ============================================================
// VALIDATION
// ============================================================

export function isValidDate(
  value: unknown
): value is Date {
  return (
    value instanceof Date &&
    !Number.isNaN(
      value.getTime()
    )
  );
}

export function isValidDateValue(
  value: unknown
): boolean {
  return (
    parseDate(value) !== null
  );
}

// ============================================================
// ISO
// ============================================================

export function toIso(
  value: Date | string | number
): ISODateString | null {
  const date =
    parseDate(value);

  if (!date) {
    return null;
  }

  return date
    .toISOString() as ISODateString;
}

export function toIsoOrNow(
  value?: Date | string | number
): ISODateString {
  if (
    value === undefined
  ) {
    return nowIso();
  }

  return (
    toIso(value) ??
    nowIso()
  );
}

// ============================================================
// DATE PARTS
// ============================================================

export function getDateParts(
  value: Date | string | number
): DateParts | null {
  const date =
    parseDate(value);

  if (!date) {
    return null;
  }

  return {
    year:
      date.getUTCFullYear(),
    month:
      date.getUTCMonth() + 1,
    day:
      date.getUTCDate(),
    hour:
      date.getUTCHours(),
    minute:
      date.getUTCMinutes(),
    second:
      date.getUTCSeconds(),
    millisecond:
      date.getUTCMilliseconds(),
  };
}

// ============================================================
// START / END OF DAY
// ============================================================

export function startOfDay(
  value: Date | string | number
): Date | null {
  const date =
    parseDate(value);

  if (!date) {
    return null;
  }

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
}

export function endOfDay(
  value: Date | string | number
): Date | null {
  const date =
    parseDate(value);

  if (!date) {
    return null;
  }

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );
}

// ============================================================
// START / END OF WEEK
// ============================================================

export function startOfWeek(
  value: Date | string | number
): Date | null {
  const date =
    parseDate(value);

  if (!date) {
    return null;
  }

  const day =
    date.getUTCDay();

  const diff =
    day === 0
      ? 6
      : day - 1;

  const result =
    startOfDay(date);

  if (!result) {
    return null;
  }

  result.setUTCDate(
    result.getUTCDate() -
      diff
  );

  return result;
}

export function endOfWeek(
  value: Date | string | number
): Date | null {
  const start =
    startOfWeek(value);

  if (!start) {
    return null;
  }

  const result =
    new Date(
      start.getTime()
    );

  result.setUTCDate(
    result.getUTCDate() + 6
  );

  return endOfDay(result);
}

// ============================================================
// START / END OF MONTH
// ============================================================

export function startOfMonth(
  value: Date | string | number
): Date | null {
  const date =
    parseDate(value);

  if (!date) {
    return null;
  }

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      1,
      0,
      0,
      0,
      0
    )
  );
}

export function endOfMonth(
  value: Date | string | number
): Date | null {
  const date =
    parseDate(value);

  if (!date) {
    return null;
  }

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      0,
      23,
      59,
      59,
      999
    )
  );
}

// ============================================================
// START / END OF YEAR
// ============================================================

export function startOfYear(
  value: Date | string | number
): Date | null {
  const date =
    parseDate(value);

  if (!date) {
    return null;
  }

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      0,
      1,
      0,
      0,
      0,
      0
    )
  );
}

export function endOfYear(
  value: Date | string | number
): Date | null {
  const date =
    parseDate(value);

  if (!date) {
    return null;
  }

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      11,
      31,
      23,
      59,
      59,
      999
    )
  );
}

// ============================================================
// ADD TIME
// ============================================================

export function addMilliseconds(
  value: Date | string | number,
  amount: number
): Date | null {
  const date =
    parseDate(value);

  if (
    !date ||
    !Number.isFinite(amount)
  ) {
    return null;
  }

  return new Date(
    date.getTime() +
      amount
  );
}

export function addSeconds(
  value: Date | string | number,
  amount: number
): Date | null {
  return addMilliseconds(
    value,
    amount * 1000
  );
}

export function addMinutes(
  value: Date | string | number,
  amount: number
): Date | null {
  return addMilliseconds(
    value,
    amount * 60 * 1000
  );
}

export function addHours(
  value: Date | string | number,
  amount: number
): Date | null {
  return addMilliseconds(
    value,
    amount * 60 * 60 * 1000
  );
}

export function addDays(
  value: Date | string | number,
  amount: number
): Date | null {
  return addMilliseconds(
    value,
    amount *
      24 *
      60 *
      60 *
      1000
  );
}

export function addWeeks(
  value: Date | string | number,
  amount: number
): Date | null {
  return addDays(
    value,
    amount * 7
  );
}

// ============================================================
// MONTH / YEAR ADDITION
// ============================================================

export function addMonths(
  value: Date | string | number,
  amount: number
): Date | null {
  const date =
    parseDate(value);

  if (
    !date ||
    !Number.isFinite(amount)
  ) {
    return null;
  }

  const result =
    new Date(
      date.getTime()
    );

  result.setUTCMonth(
    result.getUTCMonth() +
      amount
  );

  return result;
}

export function addYears(
  value: Date | string | number,
  amount: number
): Date | null {
  const date =
    parseDate(value);

  if (
    !date ||
    !Number.isFinite(amount)
  ) {
    return null;
  }

  const result =
    new Date(
      date.getTime()
    );

  result.setUTCFullYear(
    result.getUTCFullYear() +
      amount
  );

  return result;
}

// ============================================================
// DIFFERENCE
// ============================================================

export function diffMilliseconds(
  a: Date | string | number,
  b: Date | string | number
): number | null {
  const first =
    parseDate(a);

  const second =
    parseDate(b);

  if (
    !first ||
    !second
  ) {
    return null;
  }

  return (
    first.getTime() -
    second.getTime()
  );
}

export function diffSeconds(
  a: Date | string | number,
  b: Date | string | number
): number | null {
  const diff =
    diffMilliseconds(a, b);

  return diff === null
    ? null
    : diff / 1000;
}

export function diffMinutes(
  a: Date | string | number,
  b: Date | string | number
): number | null {
  const diff =
    diffMilliseconds(a, b);

  return diff === null
    ? null
    : diff / 60000;
}

export function diffHours(
  a: Date | string | number,
  b: Date | string | number
): number | null {
  const diff =
    diffMilliseconds(a, b);

  return diff === null
    ? null
    : diff / 3600000;
}

export function diffDays(
  a: Date | string | number,
  b: Date | string | number
): number | null {
  const diff =
    diffMilliseconds(a, b);

  return diff === null
    ? null
    : diff /
      (24 * 60 * 60 * 1000);
}

// ============================================================
// COMPARISON
// ============================================================

export function isBefore(
  a: Date | string | number,
  b: Date | string | number
): boolean {
  const first =
    parseDate(a);

  const second =
    parseDate(b);

  if (
    !first ||
    !second
  ) {
    return false;
  }

  return (
    first.getTime() <
    second.getTime()
  );
}

export function isAfter(
  a: Date | string | number,
  b: Date | string | number
): boolean {
  const first =
    parseDate(a);

  const second =
    parseDate(b);

  if (
    !first ||
    !second
  ) {
    return false;
  }

  return (
    first.getTime() >
    second.getTime()
  );
}

export function isEqual(
  a: Date | string | number,
  b: Date | string | number
): boolean {
  const first =
    parseDate(a);

  const second =
    parseDate(b);

  if (
    !first ||
    !second
  ) {
    return false;
  }

  return (
    first.getTime() ===
    second.getTime()
  );
}

export function isBetween(
  value: Date | string | number,
  start: Date | string | number,
  end: Date | string | number,
  inclusive = true
): boolean {
  const date =
    parseDate(value);

  const from =
    parseDate(start);

  const to =
    parseDate(end);

  if (
    !date ||
    !from ||
    !to
  ) {
    return false;
  }

  const time =
    date.getTime();

  const startTime =
    from.getTime();

  const endTime =
    to.getTime();

  if (inclusive) {
    return (
      time >= startTime &&
      time <= endTime
    );
  }

  return (
    time > startTime &&
    time < endTime
  );
}

// ============================================================
// RANGE
// ============================================================

export function createDateRange(
  start: Date | string | number,
  end: Date | string | number
): DateRange | null {
  const startDate =
    parseDate(start);

  const endDate =
    parseDate(end);

  if (
    !startDate ||
    !endDate
  ) {
    return null;
  }

  if (
    startDate.getTime() >
    endDate.getTime()
  ) {
    return {
      start: endDate,
      end: startDate,
    };
  }

  return {
    start: startDate,
    end: endDate,
  };
}

// ============================================================
// UNIX TIMESTAMP
// ============================================================

export function unixSeconds(
  value: Date | string | number =
    new Date()
): number | null {
  const date =
    parseDate(value);

  if (!date) {
    return null;
  }

  return Math.floor(
    date.getTime() / 1000
  );
}

export function fromUnixSeconds(
  value: number
): Date | null {
  if (
    !Number.isFinite(value)
  ) {
    return null;
  }

  return new Date(
    value * 1000
  );
}

// ============================================================
// HUMAN READABLE
// ============================================================

export function formatDateRu(
  value: Date | string | number
): string {
  const date =
    parseDate(value);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "ru-RU",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(date);
}

export function formatDateTimeRu(
  value: Date | string | number
): string {
  const date =
    parseDate(value);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "ru-RU",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC",
    }
  ).format(date);
}

export function formatDateTj(
  value: Date | string | number
): string {
  const date =
    parseDate(value);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "tg-TJ",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(date);
}

export function formatDateTimeTj(
  value: Date | string | number
): string {
  const date =
    parseDate(value);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "tg-TJ",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC",
    }
  ).format(date);
}

// ============================================================
// RELATIVE TIME
// ============================================================

export function relativeTimeRu(
  value: Date | string | number,
  reference: Date | string | number =
    new Date()
): string {
  const diff =
    diffSeconds(
      value,
      reference
    );

  if (diff === null) {
    return "";
  }

  const seconds =
    Math.abs(diff);

  if (seconds < 60) {
    return "только что";
  }

  if (seconds < 3600) {
    const minutes =
      Math.floor(
        seconds / 60
      );

    return `${minutes} мин. назад`;
  }

  if (seconds < 86400) {
    const hours =
      Math.floor(
        seconds / 3600
      );

    return `${hours} ч. назад`;
  }

  if (seconds < 604800) {
    const days =
      Math.floor(
        seconds / 86400
      );

    return `${days} дн. назад`;
  }

  return formatDateRu(
    value
  );
}

// ============================================================
// DATE KEYS
// ============================================================

export function dateKey(
  value: Date | string | number
): string | null {
  const date =
    parseDate(value);

  if (!date) {
    return null;
  }

  const year =
    date
      .getUTCFullYear()
      .toString()
      .padStart(4, "0");

  const month =
    (
      date.getUTCMonth() + 1
    )
      .toString()
      .padStart(2, "0");

  const day =
    date
      .getUTCDate()
      .toString()
      .padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ============================================================
// MONTH KEY
// ============================================================

export function monthKey(
  value: Date | string | number
): string | null {
  const date =
    parseDate(value);

  if (!date) {
    return null;
  }

  const year =
    date
      .getUTCFullYear()
      .toString();

  const month =
    (
      date.getUTCMonth() + 1
    )
      .toString()
      .padStart(2, "0");

  return `${year}-${month}`;
}

// ============================================================
// SAFE DATE RANGE
// ============================================================

export function ensureRange(
  start?: Date | string | number,
  end?: Date | string | number
): DateRange {
  const current =
    new Date();

  const startDate =
    start !== undefined
      ? parseDate(start)
      : null;

  const endDate =
    end !== undefined
      ? parseDate(end)
      : null;

  return {
    start:
      startDate ??
      new Date(
        current.getTime()
      ),
    end:
      endDate ??
      new Date(
        current.getTime()
      ),
  };
}

// ============================================================
// END
// ============================================================
