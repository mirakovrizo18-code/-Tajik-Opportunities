// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// PUBLICATION UTILITIES
// Version: 2026.09.09 POWER PRODUCTION
// ============================================================

/**
 * Нормализует публичный номер публикации.
 *
 * Публичный номер используется в URL:
 *
 * /1
 * /2
 * /99
 * /100
 *
 * Внутренний immutable publication ID при этом
 * должен храниться отдельно.
 */

export function normalizePublicNumber(
  value: string | number | null | undefined
): number | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const text =
    String(value).trim();

  if (!text) {
    return null;
  }

  // Только положительные целые числа.
  if (!/^\d+$/.test(text)) {
    return null;
  }

  const number =
    Number(text);

  if (
    !Number.isSafeInteger(number) ||
    number <= 0
  ) {
    return null;
  }

  return number;
}

/**
 * Проверяет корректность публичного номера.
 */
export function isValidPublicNumber(
  value: string | number | null | undefined
): boolean {
  return (
    normalizePublicNumber(value) !== null
  );
}

/**
 * Преобразует публичный номер в URL.
 */
export function publicationPath(
  value: string | number
): string {
  const number =
    normalizePublicNumber(value);

  if (number === null) {
    throw new Error(
      "Invalid publication number"
    );
  }

  return `/${number}`;
}

/**
 * Создаёт абсолютную ссылку на публикацию.
 */
export function publicationUrl(
  origin: string,
  value: string | number
): string {
  const cleanOrigin =
    origin.replace(/\/+$/, "");

  return `${cleanOrigin}${publicationPath(value)}`;
}

/**
 * Проверяет, является ли pathname
 * публичной страницей публикации.
 *
 * Примеры:
 *
 * /1      -> true
 * /99     -> true
 * /1000   -> true
 * /api    -> false
 * /admin  -> false
 * /hello  -> false
 */
export function isPublicationPath(
  pathname: string
): boolean {
  return /^\/\d+$/.test(
    pathname.trim()
  );
}

/**
 * Извлекает номер публикации из pathname.
 */
export function getPublicationNumberFromPath(
  pathname: string
): number | null {
  const value =
    pathname.match(
      /^\/(\d+)$/
    )?.[1];

  return normalizePublicNumber(
    value
  );
}

/**
 * Нормализует номер для базы данных.
 *
 * Используется перед INSERT/UPDATE.
 */
export function normalizePublicationNumberForDb(
  value: string | number
): number {
  const number =
    normalizePublicNumber(value);

  if (number === null) {
    throw new Error(
      "Invalid publication number"
    );
  }

  return number;
}

/**
 * Возвращает следующий публичный номер.
 *
 * Важно:
 * это только вычисление кандидата.
 *
 * Реальное назначение номера должно выполняться
 * транзакционно/под защитой от гонки в backend.
 */
export function nextPublicationNumber(
  currentMaximum: string | number | null | undefined
): number {
  const current =
    normalizePublicNumber(
      currentMaximum
    );

  if (current === null) {
    return 1;
  }

  if (
    current >= Number.MAX_SAFE_INTEGER
  ) {
    throw new Error(
      "Publication number limit reached"
    );
  }

  return current + 1;
}

/**
 * Сравнение двух публичных номеров.
 */
export function comparePublicationNumbers(
  a: string | number,
  b: string | number
): number {
  const first =
    normalizePublicNumber(a);

  const second =
    normalizePublicNumber(b);

  if (
    first === null ||
    second === null
  ) {
    throw new Error(
      "Invalid publication number"
    );
  }

  if (first < second) {
    return -1;
  }

  if (first > second) {
    return 1;
  }

  return 0;
}

/**
 * Проверяет, находится ли номер
 * в заданном диапазоне.
 */
export function isPublicationNumberInRange(
  value: string | number,
  min: string | number,
  max: string | number
): boolean {
  const current =
    normalizePublicNumber(value);

  const minimum =
    normalizePublicNumber(min);

  const maximum =
    normalizePublicNumber(max);

  if (
    current === null ||
    minimum === null ||
    maximum === null
  ) {
    return false;
  }

  return (
    current >= minimum &&
    current <= maximum
  );
}

/**
 * Форматирует номер публикации
 * для отображения пользователю.
 */
export function formatPublicationNumber(
  value: string | number
): string {
  const number =
    normalizePublicNumber(value);

  if (number === null) {
    return "";
  }

  return `#${number}`;
}

/**
 * Возвращает короткий публичный идентификатор.
 *
 * Например:
 *
 * #125
 */
export function publicPublicationLabel(
  value: string | number
): string {
  return formatPublicationNumber(
    value
  );
}

/**
 * Проверяет корректность publication ID.
 *
 * Internal ID может быть UUID,
 * строковым идентификатором или другим
 * безопасным серверным идентификатором.
 */
export function isValidPublicationId(
  value: string | null | undefined
): boolean {
  if (
    value === null ||
    value === undefined
  ) {
    return false;
  }

  const text =
    value.trim();

  if (!text) {
    return false;
  }

  if (text.length > 200) {
    return false;
  }

  // Запрещаем управляющие символы.
  if (
    /[\u0000-\u001F\u007F]/.test(text)
  ) {
    return false;
  }

  return true;
}

/**
 * Безопасно нормализует publication ID.
 */
export function normalizePublicationId(
  value: string | null | undefined
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const text =
    value.trim();

  if (
    !isValidPublicationId(text)
  ) {
    return null;
  }

  return text;
}

/**
 * Определяет, является ли значение
 * потенциально публичным номером.
 */
export function looksLikePublicationNumber(
  value: string
): boolean {
  return /^\d+$/.test(
    value.trim()
  );
}

/**
 * Преобразует URL публикации
 * в публичный номер.
 */
export function extractPublicationNumberFromUrl(
  value: string
): number | null {
  try {
    const url =
      new URL(value);

    return getPublicationNumberFromPath(
      url.pathname
    );
  } catch {
    return null;
  }
}

/**
 * Нормализует ссылку публикации.
 */
export function normalizePublicationUrl(
  origin: string,
  value: string | number
): string {
  return publicationUrl(
    origin,
    value
  );
}

/**
 * Проверяет, принадлежит ли pathname
 * конкретной публикации.
 */
export function matchesPublicationPath(
  pathname: string,
  publicationNumber: string | number
): boolean {
  const current =
    getPublicationNumberFromPath(
      pathname
    );

  const expected =
    normalizePublicNumber(
      publicationNumber
    );

  if (
    current === null ||
    expected === null
  ) {
    return false;
  }

  return current === expected;
}

/**
 * Диапазон публичных номеров.
 */
export interface PublicationNumberRange {
  from: number;
  to: number;
}

/**
 * Создаёт диапазон номеров.
 */
export function createPublicationNumberRange(
  from: string | number,
  to: string | number
): PublicationNumberRange {
  const first =
    normalizePublicNumber(from);

  const last =
    normalizePublicNumber(to);

  if (
    first === null ||
    last === null
  ) {
    throw new Error(
      "Invalid publication number range"
    );
  }

  if (first > last) {
    throw new Error(
      "Publication range start cannot be greater than end"
    );
  }

  return {
    from: first,
    to: last,
  };
}

/**
 * Проверяет диапазон.
 */
export function isValidPublicationRange(
  from: string | number,
  to: string | number
): boolean {
  try {
    createPublicationNumberRange(
      from,
      to
    );

    return true;
  } catch {
    return false;
  }
}

/**
 * Создаёт массив последовательных
 * публичных номеров.
 *
 * Использовать только для небольших
 * диапазонов.
 */
export function generatePublicationNumbers(
  from: string | number,
  to: string | number
): number[] {
  const range =
    createPublicationNumberRange(
      from,
      to
    );

  const size =
    range.to - range.from + 1;

  if (size > 10000) {
    throw new Error(
      "Publication number range is too large"
    );
  }

  const result: number[] = [];

  for (
    let number = range.from;
    number <= range.to;
    number++
  ) {
    result.push(number);
  }

  return result;
}

/**
 * Возвращает URL следующей публикации.
 */
export function nextPublicationUrl(
  origin: string,
  current: string | number
): string {
  const number =
    normalizePublicNumber(
      current
    );

  if (number === null) {
    throw new Error(
      "Invalid publication number"
    );
  }

  return publicationUrl(
    origin,
    number + 1
  );
}

/**
 * Возвращает URL предыдущей публикации.
 */
export function previousPublicationUrl(
  origin: string,
  current: string | number
): string | null {
  const number =
    normalizePublicNumber(
      current
    );

  if (
    number === null ||
    number <= 1
  ) {
    return null;
  }

  return publicationUrl(
    origin,
    number - 1
  );
}

/**
 * Информация о публичном URL публикации.
 */
export interface PublicationUrlInfo {
  number: number;
  path: string;
  url: string;
}

/**
 * Создаёт структурированную информацию
 * о ссылке публикации.
 */
export function getPublicationUrlInfo(
  origin: string,
  value: string | number
): PublicationUrlInfo {
  const number =
    normalizePublicNumber(
      value
    );

  if (number === null) {
    throw new Error(
      "Invalid publication number"
    );
  }

  return {
    number,
    path: publicationPath(number),
    url: publicationUrl(
      origin,
      number
    ),
  };
}

/**
 * Нормализует slug публикации.
 *
 * Slug не заменяет public post_number.
 */
export function normalizePublicationSlug(
  value: string | null | undefined
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const slug =
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(
        /[^a-z0-9а-яё\-]+/gi,
        ""
      )
      .replace(
        /-+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );

  if (!slug) {
    return null;
  }

  return slug.slice(
    0,
    180
  );
}

/**
 * Безопасный title для публикации.
 */
export function normalizePublicationTitle(
  value: string | null | undefined,
  maxLength = 300
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return value
    .replace(
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
      ""
    )
    .trim()
    .slice(
      0,
      Math.max(1, maxLength)
    );
}

/**
 * Безопасный текст публикации.
 */
export function normalizePublicationText(
  value: string | null | undefined,
  maxLength = 50000
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return value
    .replace(
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
      ""
    )
    .trim()
    .slice(
      0,
      Math.max(1, maxLength)
    );
}

/**
 * Проверка наличия контента.
 */
export function hasPublicationContent(
  title: string | null | undefined,
  text: string | null | undefined
): boolean {
  return Boolean(
    normalizePublicationTitle(
      title
    ) ||
    normalizePublicationText(
      text
    )
  );
}

/**
 * Публикация может иметь media,
 * ссылки и другие данные даже без текста.
 */
export function hasAnyPublicationContent(
  content: {
    title?: string | null;
    text?: string | null;
    images?: unknown[];
    videos?: unknown[];
    documents?: unknown[];
    links?: unknown[];
  }
): boolean {
  if (
    hasPublicationContent(
      content.title,
      content.text
    )
  ) {
    return true;
  }

  if (
    Array.isArray(content.images) &&
    content.images.length > 0
  ) {
    return true;
  }

  if (
    Array.isArray(content.videos) &&
    content.videos.length > 0
  ) {
    return true;
  }

  if (
    Array.isArray(content.documents) &&
    content.documents.length > 0
  ) {
    return true;
  }

  if (
    Array.isArray(content.links) &&
    content.links.length > 0
  ) {
    return true;
  }

  return false;
}

/**
 * Проверка публичного номера перед URL routing.
 */
export function assertPublicationNumber(
  value: string | number
): number {
  const number =
    normalizePublicNumber(
      value
    );

  if (number === null) {
    throw new Error(
      "Invalid publication number"
    );
  }

  return number;
}

/**
 * Возвращает SQL-friendly значение
 * публичного номера.
 */
export function publicationNumberParam(
  value: string | number
): number {
  return assertPublicationNumber(
    value
  );
}
