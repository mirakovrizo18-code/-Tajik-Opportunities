import {
  asciiSlug,
  slugify,
  normalizeUsername,
  isValidSlug,
} from "./string";

export interface SlugOptions {
  maxLength?: number;
  separator?: string;
  lowercase?: boolean;
  transliterate?: boolean;
}

export interface SlugParts {
  value: string;
  base: string;
  suffix: string | null;
}

const DEFAULT_MAX_LENGTH = 120;

function normalizeSeparator(
  separator: string | undefined,
): string {
  if (!separator) {
    return "-";
  }

  return separator
    .trim()
    .slice(0, 1)
    .replace(
      /[^a-zA-Z0-9_-]/g,
      "-",
    );
}

function trimSeparator(
  value: string,
  separator: string,
): string {
  const escaped =
    separator.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );

  return value
    .replace(
      new RegExp(
        `^${escaped}+`,
        "g",
      ),
      "",
    )
    .replace(
      new RegExp(
        `${escaped}+$`,
        "g",
      ),
      "",
    );
}

function limitSlug(
  value: string,
  maxLength: number,
): string {
  if (
    value.length <= maxLength
  ) {
    return value;
  }

  return value
    .slice(0, maxLength)
    .replace(/[-_]+$/g, "");
}

export function createSlug(
  value: unknown,
  options: SlugOptions = {},
): string {
  const maxLength = Math.max(
    1,
    Math.floor(
      options.maxLength ??
        DEFAULT_MAX_LENGTH,
    ),
  );

  const separator =
    normalizeSeparator(
      options.separator,
    );

  let result =
    options.transliterate === false
      ? slugify(value)
      : asciiSlug(value);

  if (separator !== "-") {
    result = result
      .replace(/[-_]+/g, separator);
  }

  if (
    options.lowercase !== false
  ) {
    result = result.toLowerCase();
  }

  result = trimSeparator(
    result,
    separator,
  );

  return limitSlug(
    result,
    maxLength,
  );
}

export function createUniqueSlug(
  value: unknown,
  existingSlugs: readonly string[],
  options: SlugOptions = {},
): string {
  const base = createSlug(
    value,
    options,
  );

  if (!base) {
    return "item";
  }

  const used = new Set(
    existingSlugs.map(
      (slug) => slug.toLowerCase(),
    ),
  );

  if (!used.has(base.toLowerCase())) {
    return base;
  }

  const separator =
    normalizeSeparator(
      options.separator,
    );

  let counter = 2;

  while (true) {
    const suffix =
      `${separator}${counter}`;

    const maxLength =
      Math.max(
        1,
        Math.floor(
          options.maxLength ??
            DEFAULT_MAX_LENGTH,
        ),
      );

    const candidate =
      `${base.slice(
        0,
        Math.max(
          1,
          maxLength -
            suffix.length,
        ),
      )}${suffix}`;

    if (
      !used.has(
        candidate.toLowerCase(),
      )
    ) {
      return candidate;
    }

    counter++;

    if (counter > 1_000_000) {
      throw new Error(
        "Unable to generate a unique slug.",
      );
    }
  }
}

export function isSlug(
  value: unknown,
  maxLength = DEFAULT_MAX_LENGTH,
): value is string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > maxLength
  ) {
    return false;
  }

  return isValidSlug(value);
}

export function normalizeSlug(
  value: unknown,
  options: SlugOptions = {},
): string {
  return createSlug(
    String(value ?? ""),
    options,
  );
}

export function slugFromTitle(
  title: string,
): string {
  return createSlug(title, {
    maxLength: 120,
    separator: "-",
    lowercase: true,
    transliterate: true,
  });
}

export function slugFromPublicationTitle(
  title: string,
): string {
  return createSlug(title, {
    maxLength: 150,
    separator: "-",
    lowercase: true,
    transliterate: true,
  });
}

export function slugFromCategoryName(
  name: string,
): string {
  return createSlug(name, {
    maxLength: 80,
    separator: "-",
    lowercase: true,
    transliterate: true,
  });
}

export function slugFromUsername(
  username: string,
): string {
  return normalizeUsername(
    username,
  );
}

export function slugFromName(
  name: string,
): string {
  return createSlug(name, {
    maxLength: 100,
    separator: "-",
    lowercase: true,
    transliterate: true,
  });
}

export function appendSlugSuffix(
  slug: string,
  suffix: string | number,
  separator = "-",
): string {
  const base =
    normalizeSlug(slug);

  const cleanSuffix =
    String(suffix)
      .trim()
      .replace(
        /[^a-zA-Z0-9а-яА-ЯёЁ_-]/g,
        "",
      );

  if (!cleanSuffix) {
    return base;
  }

  return `${base}${separator}${cleanSuffix}`;
}

export function slugParts(
  slug: string,
  separator = "-",
): SlugParts {
  const value =
    normalizeSlug(slug, {
      separator,
    });

  const index =
    value.lastIndexOf(separator);

  if (
    index <= 0 ||
    index >=
      value.length - separator.length
  ) {
    return {
      value,
      base: value,
      suffix: null,
    };
  }

  const suffix =
    value.slice(
      index + separator.length,
    );

  if (
    !/^\d+$/.test(suffix)
  ) {
    return {
      value,
      base: value,
      suffix: null,
    };
  }

  return {
    value,
    base: value.slice(0, index),
    suffix,
  };
}

export function getSlugBase(
  slug: string,
): string {
  return slugParts(slug).base;
}

export function getSlugSuffix(
  slug: string,
): string | null {
  return slugParts(slug).suffix;
}

export function hasSlugSuffix(
  slug: string,
): boolean {
  return (
    getSlugSuffix(slug) !== null
  );
}

export function incrementSlug(
  slug: string,
): string {
  const parts =
    slugParts(slug);

  if (!parts.suffix) {
    return appendSlugSuffix(
      parts.value,
      2,
    );
  }

  const number =
    Number(parts.suffix);

  if (
    !Number.isSafeInteger(number)
  ) {
    return appendSlugSuffix(
      parts.value,
      2,
    );
  }

  return appendSlugSuffix(
    parts.base,
    number + 1,
  );
}

export function compareSlugs(
  a: string,
  b: string,
): boolean {
  return (
    normalizeSlug(a) ===
    normalizeSlug(b)
  );
}

export function slugEquals(
  a: unknown,
  b: unknown,
): boolean {
  return (
    createSlug(a) ===
    createSlug(b)
  );
}

export function sanitizeSlug(
  value: string,
  maxLength = DEFAULT_MAX_LENGTH,
): string {
  return createSlug(value, {
    maxLength,
    separator: "-",
    lowercase: true,
    transliterate: true,
  });
}

export function slugifyList(
  values: readonly string[],
  options: SlugOptions = {},
): string[] {
  return values
    .map((value) =>
      createSlug(
        value,
        options,
      ),
    )
    .filter(Boolean);
}

export function uniqueSlugs(
  values: readonly string[],
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const slug =
      normalizeSlug(value);

    const key =
      slug.toLowerCase();

    if (!slug || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(slug);
  }

  return result;
}

export function buildSlugMap(
  values: readonly string[],
): Record<string, string> {
  const result: Record<
    string,
    string
  > = {};

  const used: string[] = [];

  for (const value of values) {
    const slug =
      createUniqueSlug(
        value,
        used,
      );

    result[value] = slug;
    used.push(slug);
  }

  return result;
}

export function buildSlugPath(
  ...parts: Array<
    string | number | null | undefined
  >
): string {
  return parts
    .filter(
      (
        value,
      ) =>
        value !==
          null &&
        value !==
          undefined &&
        String(value).trim() !==
          "",
    )
    .map((value) =>
      createSlug(value),
    )
    .filter(Boolean)
    .join("/");
}

export function isSafeSlugSegment(
  value: string,
): boolean {
  if (
    !value ||
    value.length > 200
  ) {
    return false;
  }

  if (
    value.includes("/") ||
    value.includes("\\") ||
    value.includes("..") ||
    value.includes("%")
  ) {
    return false;
  }

  return /^[a-zA-Z0-9а-яА-ЯёЁ_-]+$/.test(
    value,
  );
}

export function normalizeSlugSegment(
  value: string,
): string {
  const result =
    createSlug(value, {
      maxLength: 200,
      separator: "-",
    });

  if (
    !isSafeSlugSegment(result)
  ) {
    throw new Error(
      "Invalid slug segment.",
    );
  }

  return result;
}

export function buildPublicationSlug(
  id: string | number,
  title?: string,
): string {
  const cleanId =
    String(id)
      .trim()
      .replace(
        /[^a-zA-Z0-9_-]/g,
        "",
      );

  if (!cleanId) {
    throw new Error(
      "Publication ID is required.",
    );
  }

  if (!title) {
    return cleanId;
  }

  const titleSlug =
    slugFromPublicationTitle(
      title,
    );

  return titleSlug
    ? `${titleSlug}-${cleanId}`
    : cleanId;
}

export function extractIdFromSlug(
  slug: string,
): string | null {
  const clean =
    normalizeSlug(slug);

  const match =
    clean.match(
      /(?:^|-)([a-zA-Z0-9_]{4,})$/,
    );

  return match?.[1] ?? null;
}

export function slugToSearchText(
  slug: string,
): string {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugToTitle(
  slug: string,
): string {
  const text =
    slugToSearchText(slug);

  if (!text) {
    return "";
  }

  return text
    .split(" ")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
      }
