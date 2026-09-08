const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const BASE64URL_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function assertHex(value: string): void {
  if (
    typeof value !== "string" ||
    value.length % 2 !== 0 ||
    !/^[0-9a-fA-F]*$/.test(value)
  ) {
    throw new Error("Invalid hexadecimal string.");
  }
}

export function bytesToHex(
  bytes: Uint8Array,
): string {
  let result = "";

  for (const byte of bytes) {
    result += byte
      .toString(16)
      .padStart(2, "0");
  }

  return result;
}

export function hexToBytes(
  hex: string,
): Uint8Array {
  assertHex(hex);

  const result = new Uint8Array(
    hex.length / 2,
  );

  for (
    let i = 0;
    i < hex.length;
    i += 2
  ) {
    result[i / 2] = parseInt(
      hex.slice(i, i + 2),
      16,
    );
  }

  return result;
}

export function stringToBytes(
  value: string,
): Uint8Array {
  return textEncoder.encode(
    value,
  );
}

export function bytesToString(
  bytes: Uint8Array,
): string {
  return textDecoder.decode(
    bytes,
  );
}

export function stringToHex(
  value: string,
): string {
  return bytesToHex(
    stringToBytes(value),
  );
}

export function hexToString(
  value: string,
): string {
  return bytesToString(
    hexToBytes(value),
  );
}

export function bytesToBase64(
  bytes: Uint8Array,
): string {
  let binary = "";

  const chunkSize = 0x8000;

  for (
    let i = 0;
    i < bytes.length;
    i += chunkSize
  ) {
    binary += String.fromCharCode(
      ...bytes.subarray(
        i,
        Math.min(
          i + chunkSize,
          bytes.length,
        ),
      ),
    );
  }

  return btoa(binary);
}

export function base64ToBytes(
  value: string,
): Uint8Array {
  const normalized =
    value.replace(/\s+/g, "");

  if (
    normalized.length % 4 === 1 ||
    !/^[A-Za-z0-9+/]*={0,2}$/.test(
      normalized,
    )
  ) {
    throw new Error(
      "Invalid Base64 string.",
    );
  }

  const binary = atob(normalized);
  const result = new Uint8Array(
    binary.length,
  );

  for (
    let i = 0;
    i < binary.length;
    i++
  ) {
    result[i] =
      binary.charCodeAt(i);
  }

  return result;
}

export function stringToBase64(
  value: string,
): string {
  return bytesToBase64(
    stringToBytes(value),
  );
}

export function base64ToString(
  value: string,
): string {
  return bytesToString(
    base64ToBytes(value),
  );
}

export function bytesToBase64Url(
  bytes: Uint8Array,
): string {
  return bytesToBase64(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function base64ToBytesUrl(
  value: string,
): Uint8Array {
  let normalized = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .replace(/\s+/g, "");

  while (
    normalized.length % 4 !== 0
  ) {
    normalized += "=";
  }

  return base64ToBytes(
    normalized,
  );
}

export function stringToBase64Url(
  value: string,
): string {
  return bytesToBase64Url(
    stringToBytes(value),
  );
}

export function base64UrlToString(
  value: string,
): string {
  return bytesToString(
    base64ToBytesUrl(value),
  );
}

export function hexToBase64(
  value: string,
): string {
  return bytesToBase64(
    hexToBytes(value),
  );
}

export function base64ToHex(
  value: string,
): string {
  return bytesToHex(
    base64ToBytes(value),
  );
}

export function hexToBase64Url(
  value: string,
): string {
  return bytesToBase64Url(
    hexToBytes(value),
  );
}

export function base64UrlToHex(
  value: string,
): string {
  return bytesToHex(
    base64ToBytesUrl(value),
  );
}

export function normalizeBase64(
  value: string,
): string {
  const bytes =
    base64ToBytes(value);

  return bytesToBase64(bytes);
}

export function normalizeBase64Url(
  value: string,
): string {
  const bytes =
    base64ToBytesUrl(value);

  return bytesToBase64Url(bytes);
}

export function isValidHex(
  value: string,
): boolean {
  return (
    typeof value === "string" &&
    value.length % 2 === 0 &&
    /^[0-9a-fA-F]*$/.test(value)
  );
}

export function isValidBase64(
  value: string,
): boolean {
  if (
    typeof value !== "string" ||
    value.length === 0
  ) {
    return false;
  }

  try {
    base64ToBytes(value);
    return true;
  } catch {
    return false;
  }
}

export function isValidBase64Url(
  value: string,
): boolean {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    !/^[A-Za-z0-9_-]*$/.test(value)
  ) {
    return false;
  }

  try {
    base64ToBytesUrl(value);
    return true;
  } catch {
    return false;
  }
}

export function encodeUriComponent(
  value: string,
): string {
  return encodeURIComponent(value);
}

export function decodeUriComponent(
  value: string,
): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function encodeUri(
  value: string,
): string {
  return encodeURI(value);
}

export function decodeUri(
  value: string,
): string {
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
}

export function encodeFormComponent(
  value: string,
): string {
  return encodeURIComponent(
    value,
  ).replace(/%20/g, "+");
}

export function decodeFormComponent(
  value: string,
): string {
  try {
    return decodeURIComponent(
      value.replace(/\+/g, " "),
    );
  } catch {
    return value;
  }
}

export function encodeUtf8Base64(
  value: string,
): string {
  return stringToBase64(value);
}

export function decodeUtf8Base64(
  value: string,
): string {
  return base64ToString(value);
}

export function encodeUtf8Base64Url(
  value: string,
): string {
  return stringToBase64Url(value);
}

export function decodeUtf8Base64Url(
  value: string,
): string {
  return base64UrlToString(value);
}

export function xorBytes(
  a: Uint8Array,
  b: Uint8Array,
): Uint8Array {
  if (a.length !== b.length) {
    throw new Error(
      "Byte arrays must have equal length.",
    );
  }

  const result = new Uint8Array(
    a.length,
  );

  for (
    let i = 0;
    i < a.length;
    i++
  ) {
    result[i] = a[i] ^ b[i];
  }

  return result;
}

export function concatBytes(
  ...arrays: Uint8Array[]
): Uint8Array {
  const total = arrays.reduce(
    (sum, array) =>
      sum + array.length,
    0,
  );

  const result = new Uint8Array(
    total,
  );

  let offset = 0;

  for (const array of arrays) {
    result.set(array, offset);
    offset += array.length;
  }

  return result;
}

export function sliceBytes(
  bytes: Uint8Array,
  start?: number,
  end?: number,
): Uint8Array {
  return bytes.slice(
    start,
    end,
  );
}

export function cloneBytes(
  bytes: Uint8Array,
): Uint8Array {
  return new Uint8Array(bytes);
}

export function equalBytes(
  a: Uint8Array,
  b: Uint8Array,
): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let difference = 0;

  for (
    let i = 0;
    i < a.length;
    i++
  ) {
    difference |= a[i] ^ b[i];
  }

  return difference === 0;
}

export function byteLength(
  value: string,
): number {
  return textEncoder.encode(
    value,
  ).length;
}

export function truncateBytes(
  value: string,
  maxBytes: number,
): string {
  if (
    maxBytes <= 0
  ) {
    return "";
  }

  const bytes =
    textEncoder.encode(value);

  if (
    bytes.length <= maxBytes
  ) {
    return value;
  }

  return textDecoder.decode(
    bytes.slice(0, maxBytes),
  );
}

export function toArrayBuffer(
  bytes: Uint8Array,
): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset +
      bytes.byteLength,
  ) as ArrayBuffer;
}

export function fromArrayBuffer(
  buffer: ArrayBuffer,
): Uint8Array {
  return new Uint8Array(buffer);
}

export function numberToBytes(
  value: number,
): Uint8Array {
  if (
    !Number.isSafeInteger(value)
  ) {
    throw new Error(
      "Value must be a safe integer.",
    );
  }

  const buffer = new ArrayBuffer(8);
  const view =
    new DataView(buffer);

  view.setBigInt64(
    0,
    BigInt(value),
    false,
  );

  return new Uint8Array(buffer);
}

export function bytesToNumber(
  bytes: Uint8Array,
): number {
  if (bytes.length !== 8) {
    throw new Error(
      "Expected exactly 8 bytes.",
    );
  }

  const view = new DataView(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength,
  );

  const value =
    view.getBigInt64(0, false);

  const number = Number(value);

  if (
    !Number.isSafeInteger(number)
  ) {
    throw new Error(
      "Decoded value exceeds JavaScript safe integer range.",
    );
  }

  return number;
}

export function bigintToBytes(
  value: bigint,
): Uint8Array {
  const buffer = new ArrayBuffer(8);
  const view =
    new DataView(buffer);

  view.setBigInt64(
    0,
    value,
    false,
  );

  return new Uint8Array(buffer);
}

export function bytesToBigint(
  bytes: Uint8Array,
): bigint {
  if (bytes.length !== 8) {
    throw new Error(
      "Expected exactly 8 bytes.",
    );
  }

  const view = new DataView(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength,
  );

  return view.getBigInt64(
    0,
    false,
  );
}

export function numberToHex(
  value: number,
): string {
  if (
    !Number.isSafeInteger(value)
  ) {
    throw new Error(
      "Value must be a safe integer.",
    );
  }

  return value
    .toString(16)
    .padStart(2, "0");
}

export function hexToNumber(
  value: string,
): number {
  if (!isValidHex(value)) {
    throw new Error(
      "Invalid hexadecimal value.",
    );
  }

  const number = Number.parseInt(
    value,
    16,
  );

  if (
    !Number.isSafeInteger(number)
  ) {
    throw new Error(
      "Hex value exceeds safe integer range.",
    );
  }

  return number;
}

export function binaryToBytes(
  value: string,
): Uint8Array {
  if (
    !/^[01]*$/.test(value) ||
    value.length % 8 !== 0
  ) {
    throw new Error(
      "Invalid binary string.",
    );
  }

  const result = new Uint8Array(
    value.length / 8,
  );

  for (
    let i = 0;
    i < value.length;
    i += 8
  ) {
    result[i / 8] =
      parseInt(
        value.slice(i, i + 8),
        2,
      );
  }

  return result;
}

export function bytesToBinary(
  bytes: Uint8Array,
): string {
  return Array.from(bytes)
    .map((byte) =>
      byte
        .toString(2)
        .padStart(8, "0"),
    )
    .join("");
}

export function numberToBinary(
  value: number,
): string {
  if (
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    throw new Error(
      "Value must be a non-negative safe integer.",
    );
  }

  return value.toString(2);
}

export function binaryToNumber(
  value: string,
): number {
  if (
    !/^[01]+$/.test(value)
  ) {
    throw new Error(
      "Invalid binary number.",
    );
  }

  const result =
    Number.parseInt(value, 2);

  if (
    !Number.isSafeInteger(result)
  ) {
    throw new Error(
      "Binary value exceeds safe integer range.",
    );
  }

  return result;
}

export function padBase64(
  value: string,
): string {
  const remainder =
    value.length % 4;

  if (remainder === 0) {
    return value;
  }

  return (
    value +
    "=".repeat(4 - remainder)
  );
}

export function removeBase64Padding(
  value: string,
): string {
  return value.replace(/=+$/g, "");
}

export function base64UrlToBase64(
  value: string,
): string {
  return padBase64(
    value
      .replace(/-/g, "+")
      .replace(/_/g, "/"),
  );
}

export function base64ToBase64Url(
  value: string,
): string {
  return removeBase64Padding(
    value
      .replace(/\+/g, "-")
      .replace(/\//g, "_"),
  );
}

export function isAscii(
  value: string,
): boolean {
  for (let i = 0; i < value.length; i++) {
    if (
      value.charCodeAt(i) > 0x7f
    ) {
      return false;
    }
  }

  return true;
}

export function isUtf8(
  value: Uint8Array,
): boolean {
  try {
    const decoded =
      textDecoder.decode(value);

    return (
      textEncoder
        .encode(decoded)
        .length === value.length
    );
  } catch {
    return false;
  }
}

export function hexPrefix(
  value: string,
  length = 8,
): string {
  return value.slice(
    0,
    Math.max(0, length),
  );
}

export function base64Prefix(
  value: string,
  length = 8,
): string {
  return value.slice(
    0,
    Math.max(0, length),
  );
}

export const ENCODING_ALPHABETS = {
  base64: BASE64_ALPHABET,
  base64url: BASE64URL_ALPHABET,
} as const;
