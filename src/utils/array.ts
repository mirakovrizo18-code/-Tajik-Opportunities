export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isEmptyArray(value: unknown): boolean {
  return Array.isArray(value) && value.length === 0;
}

export function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (value === null || value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export function compact<T>(
  values: Array<T | null | undefined | false | "">
): T[] {
  return values.filter(Boolean) as T[];
}

export function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

export function uniqueBy<T>(
  values: T[],
  key: (value: T) => unknown
): T[] {
  const seen = new Set<unknown>();
  const result: T[] = [];

  for (const value of values) {
    const identifier = key(value);

    if (seen.has(identifier)) {
      continue;
    }

    seen.add(identifier);
    result.push(value);
  }

  return result;
}

export function groupBy<T>(
  values: T[],
  key: (value: T) => string
): Record<string, T[]> {
  const result: Record<string, T[]> = {};

  for (const value of values) {
    const group = key(value);

    if (!result[group]) {
      result[group] = [];
    }

    result[group].push(value);
  }

  return result;
}

export function indexBy<T>(
  values: T[],
  key: (value: T) => string
): Record<string, T> {
  const result: Record<string, T> = {};

  for (const value of values) {
    result[key(value)] = value;
  }

  return result;
}

export function chunk<T>(
  values: T[],
  size: number
): T[][] {
  if (!Number.isInteger(size) || size <= 0) {
    return [];
  }

  const result: T[][] = [];

  for (let i = 0; i < values.length; i += size) {
    result.push(values.slice(i, i + size));
  }

  return result;
}

export function take<T>(
  values: T[],
  count: number
): T[] {
  if (count <= 0) {
    return [];
  }

  return values.slice(0, count);
}

export function takeLast<T>(
  values: T[],
  count: number
): T[] {
  if (count <= 0) {
    return [];
  }

  return values.slice(-count);
}

export function skip<T>(
  values: T[],
  count: number
): T[] {
  if (count <= 0) {
    return [...values];
  }

  return values.slice(count);
}

export function first<T>(
  values: T[],
  fallback?: T
): T | undefined {
  return values.length > 0
    ? values[0]
    : fallback;
}

export function last<T>(
  values: T[],
  fallback?: T
): T | undefined {
  return values.length > 0
    ? values[values.length - 1]
    : fallback;
}

export function at<T>(
  values: T[],
  index: number,
  fallback?: T
): T | undefined {
  if (!Number.isInteger(index)) {
    return fallback;
  }

  const normalized =
    index < 0
      ? values.length + index
      : index;

  return normalized >= 0 &&
    normalized < values.length
    ? values[normalized]
    : fallback;
}

export function removeAt<T>(
  values: T[],
  index: number
): T[] {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= values.length
  ) {
    return [...values];
  }

  return [
    ...values.slice(0, index),
    ...values.slice(index + 1),
  ];
}

export function insertAt<T>(
  values: T[],
  index: number,
  ...items: T[]
): T[] {
  const result = [...values];

  const normalizedIndex = Math.max(
    0,
    Math.min(index, result.length)
  );

  result.splice(
    normalizedIndex,
    0,
    ...items
  );

  return result;
}

export function replaceAt<T>(
  values: T[],
  index: number,
  value: T
): T[] {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= values.length
  ) {
    return [...values];
  }

  const result = [...values];
  result[index] = value;

  return result;
}

export function move<T>(
  values: T[],
  from: number,
  to: number
): T[] {
  if (
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 0 ||
    from >= values.length
  ) {
    return [...values];
  }

  const result = [...values];

  const [item] = result.splice(from, 1);

  const target = Math.max(
    0,
    Math.min(to, result.length)
  );

  result.splice(target, 0, item);

  return result;
}

export function reverse<T>(
  values: T[]
): T[] {
  return [...values].reverse();
}

export function shuffle<T>(
  values: T[]
): T[] {
  const result = [...values];

  for (
    let i = result.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [result[i], result[j]] =
      [result[j], result[i]];
  }

  return result;
}

export function sortBy<T>(
  values: T[],
  key: (value: T) => unknown,
  direction: "asc" | "desc" = "asc"
): T[] {
  return [...values].sort((a, b) => {
    const firstValue = key(a);
    const secondValue = key(b);

    if (firstValue === secondValue) {
      return 0;
    }

    if (
      firstValue === null ||
      firstValue === undefined
    ) {
      return direction === "asc" ? -1 : 1;
    }

    if (
      secondValue === null ||
      secondValue === undefined
    ) {
      return direction === "asc" ? 1 : -1;
    }

    if (firstValue < secondValue) {
      return direction === "asc" ? -1 : 1;
    }

    return direction === "asc" ? 1 : -1;
  });
}

export function sortStrings(
  values: string[],
  direction: "asc" | "desc" = "asc"
): string[] {
  return [...values].sort((a, b) => {
    const result = a.localeCompare(
      b,
      undefined,
      {
        numeric: true,
        sensitivity: "base",
      }
    );

    return direction === "asc"
      ? result
      : -result;
  });
}

export function sortNumbers(
  values: number[],
  direction: "asc" | "desc" = "asc"
): number[] {
  return [...values].sort((a, b) =>
    direction === "asc"
      ? a - b
      : b - a
  );
}

export function min<T>(
  values: T[],
  selector?: (value: T) => number
): T | undefined {
  if (values.length === 0) {
    return undefined;
  }

  const getValue =
    selector ?? ((value: T) => value as unknown as number);

  let result = values[0];

  for (const value of values.slice(1)) {
    if (getValue(value) < getValue(result)) {
      result = value;
    }
  }

  return result;
}

export function max<T>(
  values: T[],
  selector?: (value: T) => number
): T | undefined {
  if (values.length === 0) {
    return undefined;
  }

  const getValue =
    selector ?? ((value: T) => value as unknown as number);

  let result = values[0];

  for (const value of values.slice(1)) {
    if (getValue(value) > getValue(result)) {
      result = value;
    }
  }

  return result;
}

export function sum(
  values: number[]
): number {
  return values.reduce(
    (total, value) => total + value,
    0
  );
}

export function average(
  values: number[]
): number {
  if (values.length === 0) {
    return 0;
  }

  return sum(values) / values.length;
}

export function countBy<T>(
  values: T[],
  predicate: (value: T) => boolean
): number {
  let count = 0;

  for (const value of values) {
    if (predicate(value)) {
      count++;
    }
  }

  return count;
}

export function every<T>(
  values: T[],
  predicate: (value: T, index: number) => boolean
): boolean {
  return values.every(predicate);
}

export function some<T>(
  values: T[],
  predicate: (value: T, index: number) => boolean
): boolean {
  return values.some(predicate);
}

export function none<T>(
  values: T[],
  predicate: (value: T, index: number) => boolean
): boolean {
  return !values.some(predicate);
}

export function findBy<T>(
  values: T[],
  predicate: (value: T, index: number) => boolean
): T | undefined {
  return values.find(predicate);
}

export function findIndexBy<T>(
  values: T[],
  predicate: (value: T, index: number) => boolean
): number {
  return values.findIndex(predicate);
}

export function partition<T>(
  values: T[],
  predicate: (value: T) => boolean
): [T[], T[]] {
  const matched: T[] = [];
  const unmatched: T[] = [];

  for (const value of values) {
    if (predicate(value)) {
      matched.push(value);
    } else {
      unmatched.push(value);
    }
  }

  return [matched, unmatched];
}

export function difference<T>(
  firstArray: T[],
  secondArray: T[]
): T[] {
  const second = new Set(secondArray);

  return firstArray.filter(
    (value) => !second.has(value)
  );
}

export function intersection<T>(
  firstArray: T[],
  secondArray: T[]
): T[] {
  const second = new Set(secondArray);

  return unique(
    firstArray.filter((value) =>
      second.has(value)
    )
  );
}

export function union<T>(
  ...arrays: T[][]
): T[] {
  return unique(
    arrays.flat()
  );
}

export function symmetricDifference<T>(
  firstArray: T[],
  secondArray: T[]
): T[] {
  return difference(
    union(firstArray, secondArray),
    intersection(firstArray, secondArray)
  );
}

export function contains<T>(
  values: T[],
  value: T
): boolean {
  return values.includes(value);
}

export function containsAny<T>(
  values: T[],
  candidates: T[]
): boolean {
  const set = new Set(values);

  return candidates.some(
    (value) => set.has(value)
  );
}

export function containsAll<T>(
  values: T[],
  candidates: T[]
): boolean {
  const set = new Set(values);

  return candidates.every(
    (value) => set.has(value)
  );
}

export function equals<T>(
  firstArray: T[],
  secondArray: T[]
): boolean {
  if (
    firstArray.length !==
    secondArray.length
  ) {
    return false;
  }

  return firstArray.every(
    (value, index) =>
      Object.is(
        value,
        secondArray[index]
      )
  );
}

export function equalsUnordered<T>(
  firstArray: T[],
  secondArray: T[]
): boolean {
  if (
    firstArray.length !==
    secondArray.length
  ) {
    return false;
  }

  const counts = new Map<T, number>();

  for (const value of firstArray) {
    counts.set(
      value,
      (counts.get(value) ?? 0) + 1
    );
  }

  for (const value of secondArray) {
    const count = counts.get(value);

    if (!count) {
      return false;
    }

    if (count === 1) {
      counts.delete(value);
    } else {
      counts.set(
        value,
        count - 1
      );
    }
  }

  return counts.size === 0;
}

export function range(
  start: number,
  end: number,
  step = 1
): number[] {
  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    !Number.isFinite(step) ||
    step === 0
  ) {
    return [];
  }

  const result: number[] = [];

  if (step > 0) {
    for (
      let value = start;
      value <= end;
      value += step
    ) {
      result.push(value);
    }
  } else {
    for (
      let value = start;
      value >= end;
      value += step
    ) {
      result.push(value);
    }
  }

  return result;
}

export function repeat<T>(
  value: T,
  count: number
): T[] {
  if (
    !Number.isInteger(count) ||
    count <= 0
  ) {
    return [];
  }

  return Array.from(
    { length: count },
    () => value
  );
}

export function zip<A, B>(
  firstArray: A[],
  secondArray: B[]
): Array<[A, B]> {
  const length = Math.min(
    firstArray.length,
    secondArray.length
  );

  const result: Array<[A, B]> = [];

  for (let i = 0; i < length; i++) {
    result.push([
      firstArray[i],
      secondArray[i],
    ]);
  }

  return result;
}

export function unzip<A, B>(
  values: Array<[A, B]>
): [A[], B[]] {
  const firstArray: A[] = [];
  const secondArray: B[] = [];

  for (const [firstValue, secondValue] of values) {
    firstArray.push(firstValue);
    secondArray.push(secondValue);
  }

  return [firstArray, secondArray];
}

export function flatten<T>(
  values: T[][]
): T[] {
  return values.flat();
}

export function flattenDeep(
  values: unknown[]
): unknown[] {
  const result: unknown[] = [];

  function visit(value: unknown): void {
    if (Array.isArray(value)) {
      for (const item of value) {
        visit(item);
      }
    } else {
      result.push(value);
    }
  }

  visit(values);

  return result;
}

export function rotate<T>(
  values: T[],
  positions: number
): T[] {
  if (values.length === 0) {
    return [];
  }

  const offset =
    ((positions % values.length) +
      values.length) %
    values.length;

  if (offset === 0) {
    return [...values];
  }

  return [
    ...values.slice(offset),
    ...values.slice(0, offset),
  ];
}

export function paginate<T>(
  values: T[],
  page: number,
  perPage: number
): {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
} {
  const safePage = Math.max(
    1,
    Math.floor(page)
  );

  const safePerPage = Math.max(
    1,
    Math.floor(perPage)
  );

  const total = values.length;

  const totalPages = Math.ceil(
    total / safePerPage
  );

  const offset =
    (safePage - 1) * safePerPage;

  return {
    items: values.slice(
      offset,
      offset + safePerPage
    ),
    page: safePage,
    perPage: safePerPage,
    total,
    totalPages,
  };
}

export function toArray<T>(
  iterable: Iterable<T>
): T[] {
  return Array.from(iterable);
}

export function fromArrayLike<T>(
  value: ArrayLike<T>
): T[] {
  return Array.from(value);
}

export function mapAsync<T, R>(
  values: T[],
  mapper: (
    value: T,
    index: number
  ) => Promise<R>
): Promise<R[]> {
  return Promise.all(
    values.map(mapper)
  );
}

export async function filterAsync<T>(
  values: T[],
  predicate: (
    value: T,
    index: number
  ) => Promise<boolean>
): Promise<T[]> {
  const checks = await Promise.all(
    values.map(predicate)
  );

  return values.filter(
    (_, index) => checks[index]
  );
}

export async function findAsync<T>(
  values: T[],
  predicate: (
    value: T,
    index: number
  ) => Promise<boolean>
): Promise<T | undefined> {
  for (
    let index = 0;
    index < values.length;
    index++
  ) {
    if (
      await predicate(
        values[index],
        index
      )
    ) {
      return values[index];
    }
  }

  return undefined;
}

export function toSet<T>(
  values: T[]
): Set<T> {
  return new Set(values);
}

export function toMap<K, V>(
  values: Array<[K, V]>
): Map<K, V> {
  return new Map(values);
}

export function valuesAt<T>(
  values: T[],
  indexes: number[]
): T[] {
  const result: T[] = [];

  for (const index of indexes) {
    const value = at(values, index);

    if (value !== undefined) {
      result.push(value);
    }
  }

  return result;
}

export function removeValue<T>(
  values: T[],
  value: T
): T[] {
  return values.filter(
    (item) => !Object.is(item, value)
  );
}

export function removeValues<T>(
  values: T[],
  items: T[]
): T[] {
  const excluded = new Set(items);

  return values.filter(
    (item) => !excluded.has(item)
  );
}

export function prepend<T>(
  values: T[],
  ...items: T[]
): T[] {
  return [...items, ...values];
}

export function append<T>(
  values: T[],
  ...items: T[]
): T[] {
  return [...values, ...items];
}

export function ensureUniquePush<T>(
  values: T[],
  value: T
): T[] {
  return values.includes(value)
    ? [...values]
    : [...values, value];
}

export function ensureUniqueUnshift<T>(
  values: T[],
  value: T
): T[] {
  return values.includes(value)
    ? [...values]
    : [value, ...values];
}

export function pairwise<T>(
  values: T[]
): Array<[T, T]> {
  const result: Array<[T, T]> = [];

  for (
    let index = 0;
    index < values.length - 1;
    index++
  ) {
    result.push([
      values[index],
      values[index + 1],
    ]);
  }

  return result;
}

export function adjacentDifferences(
  values: number[]
): number[] {
  const result: number[] = [];

  for (
    let index = 1;
    index < values.length;
    index++
  ) {
    result.push(
      values[index] -
      values[index - 1]
    );
  }

  return result;
}

export function median(
  values: number[]
): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = sortNumbers(values);

  const middle =
    Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (
      sorted[middle - 1] +
      sorted[middle]
    ) / 2;
  }

  return sorted[middle];
}

export function mode<T>(
  values: T[]
): T | undefined {
  if (values.length === 0) {
    return undefined;
  }

  const counts = new Map<T, number>();

  let result = values[0];
  let highest = 0;

  for (const value of values) {
    const count =
      (counts.get(value) ?? 0) + 1;

    counts.set(value, count);

    if (count > highest) {
      highest = count;
      result = value;
    }
  }

  return result;
  }
