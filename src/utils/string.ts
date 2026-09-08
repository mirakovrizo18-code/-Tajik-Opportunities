// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// STRING UTILITIES
// Version: 2026.09
// ============================================================

/**
 * Безопасное преобразование значения в строку.
 */
export function toStringValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

/**
 * Удаляет пробелы в начале и конце.
 */
export function trim(value: unknown): string {
  return toStringValue(value).trim();
}

/**
 * Нормализует пробелы.
 */
export function normalizeWhitespace(value: unknown): string {
  return toStringValue(value)
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Нормализует переносы строк.
 */
export function normalizeLineBreaks(value: unknown): string {
  return toStringValue(value)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

/**
 * Удаляет управляющие символы.
 */
export function removeControlCharacters(value: unknown): string {
  return toStringValue(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

/**
 * Удаляет HTML-теги.
 */
export function stripHtml(value: unknown): string {
  return toStringValue(value)
    .replace(/<[^>]*>/g, "");
}

/**
 * Простая HTML escape-защита.
 */
export function escapeHtml(value: unknown): string {
  return toStringValue(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Удаляет HTML и нормализует текст.
 */
export function cleanText(value: unknown): string {
  return normalizeWhitespace(
    removeControlCharacters(
      stripHtml(value)
    )
  );
}

/**
 * Обрезает строку до указанной длины.
 */
export function truncate(
  value: unknown,
  maxLength: number,
  suffix = "..."
): string {
  const text = toStringValue(value);

  if (!Number.isInteger(maxLength) || maxLength <= 0) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  if (suffix.length >= maxLength) {
    return suffix.slice(0, maxLength);
  }

  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Обрезает строку без разрыва слова.
 */
export function truncateWords(
  value: unknown,
  maxLength: number,
  suffix = "..."
): string {
  const text = normalizeWhitespace(value);

  if (text.length <= maxLength) {
    return text;
  }

  if (suffix.length >= maxLength) {
    return suffix.slice(0, maxLength);
  }

  const available = maxLength - suffix.length;
  const partial = text.slice(0, available);
  const lastSpace = partial.lastIndexOf(" ");

  if (lastSpace <= 0) {
    return partial + suffix;
  }

  return partial.slice(0, lastSpace) + suffix;
}

/**
 * Делает первую букву заглавной.
 */
export function capitalize(value: unknown): string {
  const text = toStringValue(value);

  if (!text) return "";

  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}

/**
 * Делает первую букву каждого слова заглавной.
 */
export function capitalizeWords(value: unknown): string {
  return normalizeWhitespace(value)
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Приводит строку к нижнему регистру.
 */
export function lower(value: unknown): string {
  return toStringValue(value).toLocaleLowerCase();
}

/**
 * Приводит строку к верхнему регистру.
 */
export function upper(value: unknown): string {
  return toStringValue(value).toLocaleUpperCase();
}

/**
 * Сравнение без учета регистра.
 */
export function equalsIgnoreCase(
  a: unknown,
  b: unknown
): boolean {
  return lower(a).trim() === lower(b).trim();
}

/**
 * Проверяет наличие подстроки без учета регистра.
 */
export function includesIgnoreCase(
  value: unknown,
  search: unknown
): boolean {
  return lower(value).includes(lower(search));
}

/**
 * Удаляет все пробелы.
 */
export function removeSpaces(value: unknown): string {
  return toStringValue(value).replace(/\s+/g, "");
}

/**
 * Удаляет символы кроме букв, цифр, пробела, дефиса и подчёркивания.
 */
export function sanitizeBasic(value: unknown): string {
  return toStringValue(value)
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .trim();
}

/**
 * Создает slug.
 * Поддерживает Unicode, включая русский и таджикский текст.
 */
export function slugify(value: unknown): string {
  return toStringValue(value)
    .normalize("NFKC")
    .toLocaleLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Создает ASCII slug для технических URL.
 */
export function asciiSlug(value: unknown): string {
  return toStringValue(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Нормализует username.
 */
export function normalizeUsername(value: unknown): string {
  return toStringValue(value)
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9_.-]/g, "");
}

/**
 * Нормализует телефон.
 */
export function normalizePhone(value: unknown): string {
  const text = toStringValue(value).trim();

  if (!text) return "";

  const hasPlus = text.startsWith("+");
  const digits = text.replace(/\D/g, "");

  return hasPlus ? `+${digits}` : digits;
}

/**
 * Нормализует email.
 */
export function normalizeEmail(value: unknown): string {
  return toStringValue(value)
    .trim()
    .toLocaleLowerCase();
}

/**
 * Маскирует email.
 */
export function maskEmail(value: unknown): string {
  const email = normalizeEmail(value);
  const at = email.indexOf("@");

  if (at <= 0) {
    return "";
  }

  const local = email.slice(0, at);
  const domain = email.slice(at + 1);

  if (!domain) {
    return "";
  }

  if (local.length === 1) {
    return `*@${domain}`;
  }

  if (local.length === 2) {
    return `${local[0]}*@${domain}`;
  }

  return `${local[0]}${"*".repeat(Math.min(local.length - 2, 4))}${local.at(-1)}@${domain}`;
}

/**
 * Маскирует телефон.
 */
export function maskPhone(value: unknown): string {
  const phone = normalizePhone(value);

  if (!phone) return "";

  const digits = phone.replace(/\D/g, "");

  if (digits.length <= 4) {
    return "*".repeat(digits.length);
  }

  const visible = digits.slice(-4);
  return `${"*".repeat(digits.length - 4)}${visible}`;
}

/**
 * Возвращает количество Unicode-символов.
 */
export function length(value: unknown): number {
  return Array.from(toStringValue(value)).length;
}

/**
 * Проверяет пустую строку.
 */
export function isEmpty(value: unknown): boolean {
  return toStringValue(value).trim().length === 0;
}

/**
 * Проверяет непустую строку.
 */
export function isNotEmpty(value: unknown): boolean {
  return !isEmpty(value);
}

/**
 * Проверяет длину строки.
 */
export function hasLengthBetween(
  value: unknown,
  min: number,
  max: number
): boolean {
  const len = length(value);
  return len >= min && len <= max;
}

/**
 * Повторяет строку.
 */
export function repeat(
  value: unknown,
  count: number
): string {
  if (!Number.isInteger(count) || count < 0) {
    return "";
  }

  return toStringValue(value).repeat(count);
}

/**
 * Заменяет все совпадения строки.
 */
export function replaceAll(
  value: unknown,
  search: string,
  replacement: string
): string {
  return toStringValue(value).split(search).join(replacement);
}

/**
 * Удаляет повторяющиеся пробелы.
 */
export function collapseSpaces(value: unknown): string {
  return toStringValue(value)
    .replace(/[ \t]+/g, " ")
    .trim();
}

/**
 * Разбивает текст на строки.
 */
export function lines(value: unknown): string[] {
  return normalizeLineBreaks(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Разбивает CSV-подобную строку.
 */
export function splitList(value: unknown): string[] {
  return toStringValue(value)
    .split(/[,\n;|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Удаляет дубликаты из списка строк.
 */
export function uniqueStrings(
  values: unknown[]
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const text = trim(value);

    if (!text) continue;

    const key = text.toLocaleLowerCase();

    if (seen.has(key)) continue;

    seen.add(key);
    result.push(text);
  }

  return result;
}

/**
 * Извлекает первое предложение.
 */
export function firstSentence(value: unknown): string {
  const text = normalizeWhitespace(value);

  if (!text) return "";

  const match = text.match(/^(.+?[.!?…](?:\s|$))/);

  return match?.[1]?.trim() ?? text;
}

/**
 * Удаляет кавычки по краям.
 */
export function removeOuterQuotes(value: unknown): string {
  return toStringValue(value)
    .trim()
    .replace(
      /^(["'«»„“”‚‘’])([\s\S]*)(["'«»„“”‚‘’])$/,
      "$2"
    )
    .trim();
}

/**
 * Удаляет URL-протокол.
 */
export function removeProtocol(value: unknown): string {
  return toStringValue(value)
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "");
}

/**
 * Нормализует URL для отображения.
 */
export function displayUrl(value: unknown): string {
  return removeProtocol(value).replace(/\/+$/, "");
}

/**
 * Проверяет, является ли строка URL.
 */
export function isUrl(value: unknown): boolean {
  const text = trim(value);

  if (!text) return false;

  try {
    const url = new URL(text);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Проверяет email.
 */
export function isEmail(value: unknown): boolean {
  const email = normalizeEmail(value);

  if (!email || email.length > 254) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Проверяет телефон.
 */
export function isPhone(value: unknown): boolean {
  const phone = normalizePhone(value);
  const digits = phone.replace(/\D/g, "");

  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Проверяет username.
 */
export function isUsername(value: unknown): boolean {
  const username = normalizeUsername(value);

  return (
    username.length >= 3 &&
    username.length <= 32 &&
    /^[a-z0-9][a-z0-9_.-]*$/.test(username)
  );
}

/**
 * Проверяет slug.
 */
export function isSlug(value: unknown): boolean {
  const slug = trim(value);

  return (
    slug.length >= 1 &&
    slug.length <= 200 &&
    /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}_]+)*$/u.test(slug)
  );
}

/**
 * Проверяет наличие HTML.
 */
export function containsHtml(value: unknown): boolean {
  return /<[^>]+>/.test(toStringValue(value));
}

/**
 * Проверяет наличие URL.
 */
export function containsUrl(value: unknown): boolean {
  return /(?:https?:\/\/|www\.)[^\s]+/i.test(toStringValue(value));
}

/**
 * Проверяет наличие упоминаний @username.
 */
export function extractMentions(value: unknown): string[] {
  const text = toStringValue(value);
  const matches = text.match(/@[a-zA-Z0-9_.-]{3,32}/g) ?? [];

  return uniqueStrings(
    matches.map((item) => item.slice(1))
  );
}

/**
 * Извлекает хэштеги.
 */
export function extractHashtags(value: unknown): string[] {
  const text = toStringValue(value);
  const matches = text.match(/#[\p{L}\p{N}_-]{1,100}/gu) ?? [];

  return uniqueStrings(
    matches.map((item) => item.slice(1))
  );
}

/**
 * Превращает текст в безопасный preview.
 */
export function createPreview(
  value: unknown,
  maxLength = 180
): string {
  return truncateWords(
    cleanText(value),
    maxLength
  );
}

/**
 * Превращает текст в ключ поиска.
 */
export function searchKey(value: unknown): string {
  return cleanText(value)
    .toLocaleLowerCase()
    .normalize("NFKC");
}

/**
 * Нормализует поисковый запрос.
 */
export function normalizeSearchQuery(
  value: unknown,
  maxLength = 200
): string {
  return truncate(
    normalizeWhitespace(
      removeControlCharacters(value)
    ),
    maxLength,
    ""
  );
}

/**
 * Сравнивает строки по поисковому ключу.
 */
export function searchEquals(
  a: unknown,
  b: unknown
): boolean {
  return searchKey(a) === searchKey(b);
}

/**
 * Проверяет совпадение начала строки.
 */
export function startsWithIgnoreCase(
  value: unknown,
  prefix: unknown
): boolean {
  return lower(value).startsWith(lower(prefix));
}

/**
 * Проверяет совпадение конца строки.
 */
export function endsWithIgnoreCase(
  value: unknown,
  suffix: unknown
): boolean {
  return lower(value).endsWith(lower(suffix));
}

/**
 * Возвращает безопасное значение по умолчанию.
 */
export function fallbackString(
  value: unknown,
  fallback: string
): string {
  const text = trim(value);
  return text || fallback;
}

/**
 * Возвращает первое непустое значение.
 */
export function firstNonEmpty(
  ...values: unknown[]
): string {
  for (const value of values) {
    const text = trim(value);

    if (text) {
      return text;
    }
  }

  return "";
}

/**
 * Форматирует список строк.
 */
export function joinNonEmpty(
  values: unknown[],
  separator = ", "
): string {
  return values
    .map((value) => trim(value))
    .filter(Boolean)
    .join(separator);
}

/**
 * Безопасно добавляет строку в начало.
 */
export function prepend(
  prefix: unknown,
  value: unknown
): string {
  return `${toStringValue(prefix)}${toStringValue(value)}`;
}

/**
 * Безопасно добавляет строку в конец.
 */
export function append(
  value: unknown,
  suffix: unknown
): string {
  return `${toStringValue(value)}${toStringValue(suffix)}`;
}

/**
 * Удаляет заданный префикс.
 */
export function removePrefix(
  value: unknown,
  prefix: string
): string {
  const text = toStringValue(value);

  if (!text.startsWith(prefix)) {
    return text;
  }

  return text.slice(prefix.length);
}

/**
 * Удаляет заданный суффикс.
 */
export function removeSuffix(
  value: unknown,
  suffix: string
): string {
  const text = toStringValue(value);

  if (!text.endsWith(suffix)) {
    return text;
  }

  return text.slice(0, -suffix.length);
}

/**
 * Удаляет завершающие слэши.
 */
export function trimTrailingSlashes(value: unknown): string {
  return toStringValue(value).replace(/\/+$/, "");
}

/**
 * Удаляет начальные слэши.
 */
export function trimLeadingSlashes(value: unknown): string {
  return toStringValue(value).replace(/^\/+/, "");
}

/**
 * Нормализует путь.
 */
export function normalizePath(value: unknown): string {
  const path = toStringValue(value)
    .trim()
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/");

  if (!path) {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

/**
 * Проверяет безопасный технический ключ.
 */
export function isSafeKey(value: unknown): boolean {
  const key = trim(value);

  return (
    key.length >= 1 &&
    key.length <= 128 &&
    /^[a-zA-Z0-9_.:-]+$/.test(key)
  );
}

/**
 * Создает ключ cache/storage.
 */
export function createKey(
  namespace: string,
  ...parts: unknown[]
): string {
  const cleanNamespace = sanitizeBasic(namespace)
    .toLocaleLowerCase()
    .replace(/\s+/g, "_");

  const cleanParts = parts
    .map((part) =>
      sanitizeBasic(part)
        .toLocaleLowerCase()
        .replace(/\s+/g, "_")
    )
    .filter(Boolean);

  return [cleanNamespace, ...cleanParts].join(":");
}

/**
 * Проверяет, содержит ли текст запрещенные управляющие
 * последовательности, опасные для HTTP-заголовков.
 */
export function containsHeaderInjection(
  value: unknown
): boolean {
  return /[\r\n]/.test(toStringValue(value));
}

/**
 * Безопасное значение для HTTP-заголовка.
 */
export function sanitizeHeaderValue(
  value: unknown
): string {
  return toStringValue(value)
    .replace(/[\r\n]/g, "")
    .trim();
}

/**
 * Безопасное значение для Cookie.
 */
export function sanitizeCookieValue(
  value: unknown
): string {
  return toStringValue(value)
    .replace(/[\r\n;]/g, "")
    .trim();
}

/**
 * Создает текстовый fingerprint.
 * Не является криптографическим хэшем.
 */
export function simpleFingerprint(
  value: unknown
): string {
  const text = toStringValue(value);
  let hash = 5381;

  for (let i = 0; i < text.length; i++) {
    hash =
      ((hash << 5) + hash) ^
      text.charCodeAt(i);

    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}

/**
 * Нормализует локализованный текст.
 */
export function normalizeLocalizedText(
  value: unknown
): string {
  return normalizeWhitespace(
    removeControlCharacters(value)
  );
}

/**
 * Создает короткое отображаемое имя.
 */
export function displayName(
  ...values: unknown[]
): string {
  return firstNonEmpty(...values) || "Пользователь";
}

/**
 * Проверяет, содержит ли текст только Unicode-буквы,
 * цифры, пробелы и базовые знаки пунктуации.
 */
export function isPlainText(value: unknown): boolean {
  const text = toStringValue(value);

  if (!text) return true;

  return !/[<>`{}[\]\\]/.test(text);
}

/**
 * Безопасно обрабатывает текст пользовательского ввода.
 */
export function sanitizeUserText(
  value: unknown,
  maxLength = 10000
): string {
  return truncate(
    normalizeWhitespace(
      removeControlCharacters(
        stripHtml(value)
      )
    ),
    maxLength,
    ""
  );
      }
