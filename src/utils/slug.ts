/* ============================================================
   TAJIK OPPORTUNITIES
   SLUG UTILITY
   ============================================================ */

function transliterate(value: string): string {
  const map: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "shch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",

    қ: "q",
    ғ: "gh",
    ҳ: "h",
    ҷ: "j",
    ӯ: "u",
    ӣ: "i",
    э: "e",
  };

  return value
    .split("")
    .map((char) => {
      const lower = char.toLowerCase();
      const converted = map[lower];

      if (!converted) {
        return char;
      }

      return char === lower
        ? converted
        : converted.toUpperCase();
    })
    .join("");
}

export function slugify(
  value: unknown,
  maxLength = 120,
): string {
  if (value === null || value === undefined) {
    return "";
  }

  const source = String(value).trim();

  if (!source) {
    return "";
  }

  const transliterated =
    transliterate(source);

  return transliterated
    .normalize("NFKD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    )
    .slice(0, maxLength)
    .replace(
      /-+$/g,
      "",
    );
}

export function createSlug(
  value: unknown,
  maxLength = 120,
): string {
  return slugify(value, maxLength);
}

export function normalizeSlug(
  value: unknown,
): string {
  return slugify(value);
}

export function isValidSlug(
  value: unknown,
): boolean {
  if (
    typeof value !== "string" ||
    value.length === 0
  ) {
    return false;
  }

  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
    value,
  );
}

export function isValidString(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

export function slugEquals(
  a: unknown,
  b: unknown,
): boolean {
  return (
    normalizeSlug(a) ===
    normalizeSlug(b)
  );
}

export function uniqueSlug(
  value: unknown,
  existing: Iterable<string>,
  maxLength = 120,
): string {
  const used = new Set(
    Array.from(existing).map(
      normalizeSlug,
    ),
  );

  const base =
    slugify(value, maxLength) ||
    "item";

  if (!used.has(base)) {
    return base;
  }

  let counter = 2;

  while (true) {
    const suffix = `-${counter}`;

    const allowedLength = Math.max(
      1,
      maxLength - suffix.length,
    );

    const candidate =
      `${base.slice(0, allowedLength)}${suffix}`;

    if (!used.has(candidate)) {
      return candidate;
    }

    counter++;
  }
}

export default slugify;
