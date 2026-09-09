// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// CRYPTO / SECURITY UTILITIES
// Version: 2026.09
// ============================================================
//
// Архитектурные принципы:
// - Web Crypto API only
// - без Math.random() для security-sensitive операций
// - совместимость с Cloudflare Workers
// - совместимость с TypeScript 5.9+
// - сохранение существующего public API
// - безопасная работа с ArrayBuffer / Uint8Array
// - единые helper-функции для Web Crypto
//
// ============================================================

import {
  bytesToHex,
  hexToBytes,
} from "./encoding";

// ============================================================
// TYPES
// ============================================================

export type CryptoBinaryInput =
  | string
  | ArrayBuffer
  | Uint8Array;

export type HashAlgorithm =
  | "SHA-256"
  | "SHA-384"
  | "SHA-512";

export interface HashResult {
  algorithm: string;
  hex: string;
  base64: string;
}

export interface EncryptedData {
  version: 1;
  algorithm: "AES-GCM";
  iv: string;
  ciphertext: string;
}

export interface EncryptedDataWithSalt
  extends EncryptedData {
  salt: string;
}

export interface AeadEncryptedData {
  version: 1;
  algorithm: "AES-GCM";
  iv: string;
  ciphertext: string;
  tagLength: 128;
}

export interface DerivedKeyOptions {
  iterations?: number;
  keyLength?: number;
}

export interface HkdfOptions {
  hash?: "SHA-256" | "SHA-384" | "SHA-512";
  length?: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const DEFAULT_PBKDF2_ITERATIONS = 100_000;
const MIN_PBKDF2_ITERATIONS = 10_000;
const MAX_RANDOM_BYTES = 65_536;

const AES_GCM_IV_BYTES = 12;
const AES_GCM_TAG_LENGTH = 128;

const DEFAULT_SALT_BYTES = 16;

const BASE64_PATTERN =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=?)?$/;

const BASE64URL_PATTERN =
  /^[A-Za-z0-9_-]*$/;

const textEncoder =
  new TextEncoder();

const textDecoder =
  new TextDecoder();

// ============================================================
// CRYPTO ACCESS
// ============================================================

function getCrypto(): Crypto {
  if (
    typeof globalThis.crypto ===
    "undefined"
  ) {
    throw new Error(
      "Web Crypto API is unavailable.",
    );
  }

  return globalThis.crypto;
}

function getSubtle(): SubtleCrypto {
  const cryptoApi =
    getCrypto();

  if (
    typeof cryptoApi.subtle ===
    "undefined"
  ) {
    throw new Error(
      "Web Crypto SubtleCrypto API is unavailable.",
    );
  }

  return cryptoApi.subtle;
}

// ============================================================
// ARRAYBUFFER HELPERS
// ============================================================
//
// TypeScript 5.9 tightened Web Crypto's BufferSource
// definitions:
//
// Uint8Array<ArrayBufferLike>
//       !=
// ArrayBufferView<ArrayBuffer>
//
// Therefore all data sent directly into Web Crypto is
// converted to a freshly-owned ArrayBuffer.
//
// This keeps runtime behavior identical while fixing
// compile-time incompatibilities with Workers types.
// ============================================================

function copyToArrayBuffer(
  value: Uint8Array,
): ArrayBuffer {
  const buffer =
    new ArrayBuffer(
      value.byteLength,
    );

  new Uint8Array(buffer).set(
    value,
  );

  return buffer;
}

function toUint8Array(
  value: CryptoBinaryInput,
): Uint8Array {
  if (
    typeof value === "string"
  ) {
    return textEncoder.encode(
      value,
    );
  }

  if (
    value instanceof Uint8Array
  ) {
    const copy =
      new Uint8Array(
        value.byteLength,
      );

    copy.set(value);

    return copy;
  }

  return new Uint8Array(
    value.slice(0),
  );
}

function toCryptoBuffer(
  value: CryptoBinaryInput,
): ArrayBuffer {
  return copyToArrayBuffer(
    toUint8Array(value),
  );
}

function toCryptoBytes(
  value: ArrayBuffer | Uint8Array,
): ArrayBuffer {
  if (
    value instanceof Uint8Array
  ) {
    return copyToArrayBuffer(
      value,
    );
  }

  return value.slice(0);
}

// ============================================================
// ARRAY / BYTE UTILITIES
// ============================================================

export function concatBytes(
  ...values: Array<
    Uint8Array | ArrayBuffer
  >
): Uint8Array {
  let totalLength = 0;

  for (const value of values) {
    totalLength +=
      value instanceof Uint8Array
        ? value.byteLength
        : value.byteLength;
  }

  const result =
    new Uint8Array(
      totalLength,
    );

  let offset = 0;

  for (const value of values) {
    const bytes =
      value instanceof Uint8Array
        ? value
        : new Uint8Array(value);

    result.set(
      bytes,
      offset,
    );

    offset +=
      bytes.byteLength;
  }

  return result;
}

export function cloneBytes(
  value: Uint8Array,
): Uint8Array {
  const copy =
    new Uint8Array(
      value.byteLength,
    );

  copy.set(value);

  return copy;
}

export function wipeBytes(
  value: Uint8Array,
): void {
  value.fill(0);
}

export function bytesLength(
  value: CryptoBinaryInput,
): number {
  return toUint8Array(value)
    .byteLength;
}

// ============================================================
// BASE64
// ============================================================

function arrayBufferToBase64(
  value:
    | ArrayBuffer
    | Uint8Array,
): string {
  const bytes =
    value instanceof Uint8Array
      ? value
      : new Uint8Array(value);

  let binary = "";

  const chunkSize =
    0x8000;

  for (
    let i = 0;
    i < bytes.length;
    i += chunkSize
  ) {
    const chunk =
      bytes.subarray(
        i,
        Math.min(
          i + chunkSize,
          bytes.length,
        ),
      );

    binary +=
      String.fromCharCode(
        ...chunk,
      );
  }

  return btoa(binary);
}

function base64ToBytes(
  value: string,
): Uint8Array {
  if (
    typeof value !== "string"
  ) {
    throw new Error(
      "Base64 value must be a string.",
    );
  }

  if (
    !isValidBase64(value)
  ) {
    throw new Error(
      "Invalid Base64 value.",
    );
  }

  const binary =
    atob(value);

  const bytes =
    new Uint8Array(
      binary.length,
    );

  for (
    let i = 0;
    i < binary.length;
    i++
  ) {
    bytes[i] =
      binary.charCodeAt(i);
  }

  return bytes;
}

function base64UrlToBytes(
  value: string,
): Uint8Array {
  if (
    typeof value !== "string"
  ) {
    throw new Error(
      "Base64URL value must be a string.",
    );
  }

  if (
    !isValidBase64Url(value)
  ) {
    throw new Error(
      "Invalid Base64URL value.",
    );
  }

  let normalized =
    value
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  while (
    normalized.length % 4 !== 0
  ) {
    normalized += "=";
  }

  return base64ToBytes(
    normalized,
  );
}

function bytesToBase64Url(
  value:
    | ArrayBuffer
    | Uint8Array,
): string {
  return arrayBufferToBase64(
    value,
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function isValidBase64(
  value: unknown,
): value is string {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  return (
    value.length % 4 === 0 &&
    BASE64_PATTERN.test(value)
  );
}

export function isValidBase64Url(
  value: unknown,
): value is string {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  return BASE64URL_PATTERN.test(
    value,
  );
}

export function bytesToBase64(
  value: Uint8Array,
): string {
  return arrayBufferToBase64(
    value,
  );
}

export function base64ToUint8Array(
  value: string,
): Uint8Array {
  return base64ToBytes(
    value,
  );
}

export function bytesToBase64Url(
  value: Uint8Array,
): string {
  return bytesToBase64Url(
    value,
  );
}

// ============================================================
// TEXT / BASE64 HELPERS
// ============================================================

export function stringToBase64(
  value: string,
): string {
  return arrayBufferToBase64(
    textEncoder.encode(value),
  );
}

export function base64ToString(
  value: string,
): string {
  return textDecoder.decode(
    base64ToBytes(value),
  );
}

export function stringToBase64Url(
  value: string,
): string {
  return bytesToBase64Url(
    textEncoder.encode(value),
  );
}

export function base64UrlToString(
  value: string,
): string {
  return textDecoder.decode(
    base64UrlToBytes(value),
  );
}

// ============================================================
// RANDOM BYTES
// ============================================================

export function randomBytes(
  length = 32,
): Uint8Array {
  if (
    !Number.isInteger(length) ||
    length < 1 ||
    length > MAX_RANDOM_BYTES
  ) {
    throw new Error(
      "Invalid random byte length.",
    );
  }

  const bytes =
    new Uint8Array(length);

  getCrypto().getRandomValues(
    bytes,
  );

  return bytes;
}

// ============================================================
// RANDOM HEX
// ============================================================

export function randomHex(
  length = 32,
): string {
  if (
    !Number.isInteger(length) ||
    length < 1 ||
    length > MAX_RANDOM_BYTES
  ) {
    throw new Error(
      "Invalid random hex length.",
    );
  }

  return bytesToHex(
    randomBytes(length),
  );
}

// ============================================================
// RANDOM BASE64
// ============================================================

export function randomBase64(
  length = 32,
): string {
  return arrayBufferToBase64(
    randomBytes(length),
  );
}

// ============================================================
// RANDOM BASE64URL
// ============================================================

export function randomBase64Url(
  length = 32,
): string {
  return bytesToBase64Url(
    randomBytes(length),
  );
}

// ============================================================
// SECURITY RANDOM HELPERS
// ============================================================

export function randomNonce(
  length = AES_GCM_IV_BYTES,
): Uint8Array {
  return randomBytes(length);
}

export function randomSalt(
  length = DEFAULT_SALT_BYTES,
): Uint8Array {
  return randomBytes(length);
}

export function randomToken(
  byteLength = 32,
): string {
  return randomBase64Url(
    byteLength,
  );
}

// ============================================================
// UUID
// ============================================================

export function uuid(): string {
  return getCrypto().randomUUID();
}

// Compatibility alias.

export function randomUUID(): string {
  return uuid();
}

// ============================================================
// GENERIC HASH
// ============================================================

export async function digest(
  algorithm: HashAlgorithm,
  value: CryptoBinaryInput,
): Promise<ArrayBuffer> {
  return await getSubtle().digest(
    algorithm,
    toCryptoBuffer(value),
  );
}

// ============================================================
// SHA-256
// ============================================================

export async function sha256(
  value: CryptoBinaryInput,
): Promise<ArrayBuffer> {
  return await digest(
    "SHA-256",
    value,
  );
}

// ============================================================
// SHA-384
// ============================================================

export async function sha384(
  value: CryptoBinaryInput,
): Promise<ArrayBuffer> {
  return await digest(
    "SHA-384",
    value,
  );
}

// ============================================================
// SHA-512
// ============================================================

export async function sha512(
  value: CryptoBinaryInput,
): Promise<ArrayBuffer> {
  return await digest(
    "SHA-512",
    value,
  );
}

// ============================================================
// HASH RESULT
// ============================================================

export async function hash(
  algorithm: HashAlgorithm,
  value: CryptoBinaryInput,
): Promise<HashResult> {
  const digestResult =
    await digest(
      algorithm,
      value,
    );

  const bytes =
    new Uint8Array(
      digestResult,
    );

  return {
    algorithm,
    hex: bytesToHex(bytes),
    base64:
      arrayBufferToBase64(
        digestResult,
      ),
  };
}

// ============================================================
// SHA-256 RESULT
// ============================================================

export async function hashSha256(
  value: CryptoBinaryInput,
): Promise<HashResult> {
  return await hash(
    "SHA-256",
    value,
  );
}

// ============================================================
// SHA-384 RESULT
// ============================================================

export async function hashSha384(
  value: CryptoBinaryInput,
): Promise<HashResult> {
  return await hash(
    "SHA-384",
    value,
  );
}

// ============================================================
// SHA-512 RESULT
// ============================================================

export async function hashSha512(
  value: CryptoBinaryInput,
): Promise<HashResult> {
  return await hash(
    "SHA-512",
    value,
  );
}

// ============================================================
// HEX HASH HELPERS
// ============================================================

export async function sha256Hex(
  value: CryptoBinaryInput,
): Promise<string> {
  const result =
    await sha256(value);

  return bytesToHex(
    new Uint8Array(result),
  );
}

export async function sha384Hex(
  value: CryptoBinaryInput,
): Promise<string> {
  const result =
    await sha384(value);

  return bytesToHex(
    new Uint8Array(result),
  );
}

export async function sha512Hex(
  value: CryptoBinaryInput,
): Promise<string> {
  const result =
    await sha512(value);

  return bytesToHex(
    new Uint8Array(result),
  );
}

// ============================================================
// BASE64 HASH HELPERS
// ============================================================

export async function sha256Base64(
  value: CryptoBinaryInput,
): Promise<string> {
  const result =
    await sha256(value);

  return arrayBufferToBase64(
    result,
  );
}

export async function sha384Base64(
  value: CryptoBinaryInput,
): Promise<string> {
  const result =
    await sha384(value);

  return arrayBufferToBase64(
    result,
  );
}

export async function sha512Base64(
  value: CryptoBinaryInput,
): Promise<string> {
  const result =
    await sha512(value);

  return arrayBufferToBase64(
    result,
  );
}

export async function sha256Base64Url(
  value: CryptoBinaryInput,
): Promise<string> {
  const result =
    await sha256(value);

  return bytesToBase64Url(
    new Uint8Array(result),
  );
}

export async function sha384Base64Url(
  value: CryptoBinaryInput,
): Promise<string> {
  const result =
    await sha384(value);

  return bytesToBase64Url(
    new Uint8Array(result),
  );
}

export async function sha512Base64Url(
  value: CryptoBinaryInput,
): Promise<string> {
  const result =
    await sha512(value);

  return bytesToBase64Url(
    new Uint8Array(result),
  );
}

// ============================================================
// HMAC KEY HELPERS
// ============================================================

async function importHmacKey(
  key: CryptoBinaryInput,
  hashAlgorithm:
    | "SHA-256"
    | "SHA-384"
    | "SHA-512",
): Promise<CryptoKey> {
  return await getSubtle().importKey(
    "raw",
    toCryptoBuffer(key),
    {
      name: "HMAC",
      hash: hashAlgorithm,
    },
    false,
    ["sign", "verify"],
  );
}

// ============================================================
// HMAC-SHA256
// ============================================================

export async function hmacSha256(
  key: string,
  value: CryptoBinaryInput,
): Promise<ArrayBuffer> {
  const cryptoKey =
    await importHmacKey(
      key,
      "SHA-256",
    );

  return await getSubtle().sign(
    "HMAC",
    cryptoKey,
    toCryptoBuffer(value),
  );
}

export async function hmacSha256Hex(
  key: string,
  value: CryptoBinaryInput,
): Promise<string> {
  const result =
    await hmacSha256(
      key,
      value,
    );

  return bytesToHex(
    new Uint8Array(result),
  );
}

export async function hmacSha256Base64Url(
  key: string,
  value: CryptoBinaryInput,
): Promise<string> {
  const result =
    await hmacSha256(
      key,
      value,
    );

  return bytesToBase64Url(
    new Uint8Array(result),
  );
}

export async function hmacSha256Base64(
  key: string,
  value: CryptoBinaryInput,
): Promise<string> {
  const result =
    await hmacSha256(
      key,
      value,
    );

  return arrayBufferToBase64(
    result,
  );
}

// ============================================================
// HMAC-SHA512
// ============================================================

export async function hmacSha512(
  key: string,
  value: CryptoBinaryInput,
): Promise<ArrayBuffer> {
  const cryptoKey =
    await importHmacKey(
      key,
      "SHA-512",
    );

  return await getSubtle().sign(
    "HMAC",
    cryptoKey,
    toCryptoBuffer(value),
  );
}

export async function hmacSha512Hex(
  key: string,
  value: CryptoBinaryInput,
): Promise<string> {
  const result =
    await hmacSha512(
      key,
      value,
    );

  return bytesToHex(
    new Uint8Array(result),
  );
}

export async function hmacSha512Base64Url(
  key: string,
  value: CryptoBinaryInput,
): Promise<string> {
  const result =
    await hmacSha512(
      key,
      value,
    );

  return bytesToBase64Url(
    new Uint8Array(result),
  );
}

// ============================================================
// PBKDF2
// ============================================================

function validatePbkdf2Iterations(
  iterations: number,
): void {
  if (
    !Number.isInteger(iterations) ||
    iterations <
      MIN_PBKDF2_ITERATIONS
  ) {
    throw new Error(
      "PBKDF2 iteration count is too low.",
    );
  }

  if (
    iterations > 10_000_000
  ) {
    throw new Error(
      "PBKDF2 iteration count is too high.",
    );
  }
}

export async function deriveKey(
  password: string,
  salt:
    | string
    | Uint8Array,
  iterations =
    DEFAULT_PBKDF2_ITERATIONS,
): Promise<CryptoKey> {
  validatePbkdf2Iterations(
    iterations,
  );

  const passwordKey =
    await getSubtle().importKey(
      "raw",
      toCryptoBuffer(password),
      "PBKDF2",
      false,
      ["deriveKey"],
    );

  const saltBytes =
    typeof salt === "string"
      ? toCryptoBuffer(salt)
      : toCryptoBuffer(salt);

  return await getSubtle().deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations,
      hash: "SHA-256",
    },
    passwordKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    [
      "encrypt",
      "decrypt",
    ],
  );
}

// ============================================================
// PBKDF2 RAW BYTES
// ============================================================

export async function deriveKeyBytes(
  password: string,
  salt:
    | string
    | Uint8Array,
  iterations =
    DEFAULT_PBKDF2_ITERATIONS,
  length = 32,
): Promise<Uint8Array> {
  validatePbkdf2Iterations(
    iterations,
  );

  if (
    !Number.isInteger(length) ||
    length < 16 ||
    length > 64
  ) {
    throw new Error(
      "Invalid derived key length.",
    );
  }

  const passwordKey =
    await getSubtle().importKey(
      "raw",
      toCryptoBuffer(password),
      "PBKDF2",
      false,
      ["deriveBits"],
    );

  const saltBytes =
    typeof salt === "string"
      ? toCryptoBuffer(salt)
      : toCryptoBuffer(salt);

  const bits =
    await getSubtle().deriveBits(
      {
        name: "PBKDF2",
        salt: saltBytes,
        iterations,
        hash: "SHA-256",
      },
      passwordKey,
      length * 8,
    );

  return new Uint8Array(bits);
}

// ============================================================
// HKDF
// ============================================================

export async function deriveHkdfKey(
  secret: CryptoBinaryInput,
  salt: CryptoBinaryInput,
  info: CryptoBinaryInput = "",
  options:
    | HkdfOptions = {},
): Promise<CryptoKey> {
  const hash =
    options.hash ??
    "SHA-256";

  const length =
    options.length ??
    256;

  if (
    !Number.isInteger(length) ||
    length !== 128 &&
    length !== 192 &&
    length !== 256
  ) {
    throw new Error(
      "HKDF AES key length must be 128, 192, or 256 bits.",
    );
  }

  const secretKey =
    await getSubtle().importKey(
      "raw",
      toCryptoBuffer(secret),
      "HKDF",
      false,
      ["deriveKey"],
    );

  return await getSubtle().deriveKey(
    {
      name: "HKDF",
      hash,
      salt:
        toCryptoBuffer(salt),
      info:
        toCryptoBuffer(info),
    },
    secretKey,
    {
      name: "AES-GCM",
      length,
    },
    false,
    [
      "encrypt",
      "decrypt",
    ],
  );
}

// ============================================================
// AES KEY IMPORT
// ============================================================

export async function importAesKey(
  rawKey:
    | Uint8Array
    | ArrayBuffer,
  usages: KeyUsage[] = [
    "encrypt",
    "decrypt",
  ],
): Promise<CryptoKey> {
  const bytes =
    toUint8Array(rawKey);

  if (
    bytes.length !== 16 &&
    bytes.length !== 24 &&
    bytes.length !== 32
  ) {
    throw new Error(
      "AES key must be 128, 192, or 256 bits.",
    );
  }

  return await getSubtle().importKey(
    "raw",
    copyToArrayBuffer(bytes),
    {
      name: "AES-GCM",
    },
    false,
    usages,
  );
}

// ============================================================
// AES KEY GENERATION
// ============================================================

export async function generateAesKey(): Promise<CryptoKey> {
  return await getSubtle().generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    [
      "encrypt",
      "decrypt",
    ],
  ) as CryptoKey;
}

// ============================================================
// AES KEY EXPORT
// ============================================================

export async function exportKeyBase64(
  key: CryptoKey,
): Promise<string> {
  const raw =
    await getSubtle().exportKey(
      "raw",
      key,
    );

  return arrayBufferToBase64(
    raw,
  );
}

export async function importAesKeyBase64(
  value: string,
): Promise<CryptoKey> {
  return await importAesKey(
    base64ToBytes(value),
  );
}

// ============================================================
// AES-GCM ENCRYPT WITH CRYPTO KEY
// ============================================================

export async function encryptWithKey(
  plaintext: CryptoBinaryInput,
  key: CryptoKey,
): Promise<EncryptedData> {
  const iv =
    randomBytes(
      AES_GCM_IV_BYTES,
    );

  const encrypted =
    await getSubtle().encrypt(
      {
        name: "AES-GCM",
        iv:
          copyToArrayBuffer(iv),
        tagLength:
          AES_GCM_TAG_LENGTH,
      },
      key,
      toCryptoBuffer(
        plaintext,
      ),
    );

  return {
    version: 1,
    algorithm: "AES-GCM",
    iv:
      arrayBufferToBase64(iv),
    ciphertext:
      arrayBufferToBase64(
        encrypted,
      ),
  };
}

// ============================================================
// AES-GCM DECRYPT WITH CRYPTO KEY
// ============================================================

export async function decryptWithKey(
  encrypted: EncryptedData,
  key: CryptoKey,
): Promise<Uint8Array> {
  validateEncryptedData(
    encrypted,
  );

  const iv =
    base64ToBytes(
      encrypted.iv,
    );

  const ciphertext =
    base64ToBytes(
      encrypted.ciphertext,
    );

  if (
    iv.length !==
    AES_GCM_IV_BYTES
  ) {
    throw new Error(
      "Invalid AES-GCM IV length.",
    );
  }

  const decrypted =
    await getSubtle().decrypt(
      {
        name: "AES-GCM",
        iv:
          copyToArrayBuffer(iv),
        tagLength:
          AES_GCM_TAG_LENGTH,
      },
      key,
      copyToArrayBuffer(
        ciphertext,
      ),
    );

  return new Uint8Array(
    decrypted,
  );
}

export async function decryptWithKeyToText(
  encrypted: EncryptedData,
  key: CryptoKey,
): Promise<string> {
  const decrypted =
    await decryptWithKey(
      encrypted,
      key,
    );

  return textDecoder.decode(
    decrypted,
  );
}

// ============================================================
// AES-GCM WITH AUTHENTICATED ADDITIONAL DATA
// ============================================================

export async function encryptWithKeyAead(
  plaintext: CryptoBinaryInput,
  key: CryptoKey,
  additionalData?: CryptoBinaryInput,
): Promise<AeadEncryptedData> {
  const iv =
    randomBytes(
      AES_GCM_IV_BYTES,
    );

  const params: AesGcmParams =
    {
      name: "AES-GCM",
      iv:
        copyToArrayBuffer(iv),
      tagLength:
        AES_GCM_TAG_LENGTH,
    };

  if (
    additionalData !==
    undefined
  ) {
    params.additionalData =
      toCryptoBuffer(
        additionalData,
      );
  }

  const encrypted =
    await getSubtle().encrypt(
      params,
      key,
      toCryptoBuffer(
        plaintext,
      ),
    );

  return {
    version: 1,
    algorithm: "AES-GCM",
    iv:
      arrayBufferToBase64(iv),
    ciphertext:
      arrayBufferToBase64(
        encrypted,
      ),
    tagLength:
      AES_GCM_TAG_LENGTH,
  };
}

export async function decryptWithKeyAead(
  encrypted: AeadEncryptedData,
  key: CryptoKey,
  additionalData?: CryptoBinaryInput,
): Promise<Uint8Array> {
  validateAeadEncryptedData(
    encrypted,
  );

  const iv =
    base64ToBytes(
      encrypted.iv,
    );

  const ciphertext =
    base64ToBytes(
      encrypted.ciphertext,
    );

  const params: AesGcmParams =
    {
      name: "AES-GCM",
      iv:
        copyToArrayBuffer(iv),
      tagLength:
        encrypted.tagLength,
    };

  if (
    additionalData !==
    undefined
  ) {
    params.additionalData =
      toCryptoBuffer(
        additionalData,
      );
  }

  const decrypted =
    await getSubtle().decrypt(
      params,
      key,
      copyToArrayBuffer(
        ciphertext,
      ),
    );

  return new Uint8Array(
    decrypted,
  );
}

// ============================================================
// AES-GCM PASSWORD ENCRYPTION
// ============================================================

export async function encryptText(
  plaintext: string,
  password: string,
  salt = randomBase64Url(
    DEFAULT_SALT_BYTES,
  ),
): Promise<
  EncryptedData & {
    salt: string;
  }
> {
  const iv =
    randomBytes(
      AES_GCM_IV_BYTES,
    );

  const key =
    await deriveKey(
      password,
      salt,
    );

  const encrypted =
    await getSubtle().encrypt(
      {
        name: "AES-GCM",
        iv:
          copyToArrayBuffer(iv),
        tagLength:
          AES_GCM_TAG_LENGTH,
      },
      key,
      toCryptoBuffer(
        plaintext,
      ),
    );

  return {
    version: 1,
    algorithm: "AES-GCM",
    iv:
      arrayBufferToBase64(iv),
    ciphertext:
      arrayBufferToBase64(
        encrypted,
      ),
    salt,
  };
}

// ============================================================
// AES-GCM PASSWORD DECRYPTION
// ============================================================

export async function decryptText(
  encrypted: EncryptedData & {
    salt: string;
  },
  password: string,
): Promise<string> {
  validateEncryptedData(
    encrypted,
  );

  if (
    typeof encrypted.salt !==
    "string" ||
    encrypted.salt.length === 0
  ) {
    throw new Error(
      "Encryption salt is missing.",
    );
  }

  const iv =
    base64ToBytes(
      encrypted.iv,
    );

  const ciphertext =
    base64ToBytes(
      encrypted.ciphertext,
    );

  if (
    iv.length !==
    AES_GCM_IV_BYTES
  ) {
    throw new Error(
      "Invalid AES-GCM IV length.",
    );
  }

  const key =
    await deriveKey(
      password,
      encrypted.salt,
    );

  const decrypted =
    await getSubtle().decrypt(
      {
        name: "AES-GCM",
        iv:
          copyToArrayBuffer(iv),
        tagLength:
          AES_GCM_TAG_LENGTH,
      },
      key,
      copyToArrayBuffer(
        ciphertext,
      ),
    );

  return textDecoder.decode(
    decrypted,
  );
}

// ============================================================
// ED25519
// ============================================================

export async function generateEd25519KeyPair(): Promise<CryptoKeyPair> {
  return await getSubtle().generateKey(
    {
      name: "Ed25519",
    },
    true,
    [
      "sign",
      "verify",
    ],
  ) as CryptoKeyPair;
}

export async function signEd25519(
  privateKey: CryptoKey,
  data: CryptoBinaryInput,
): Promise<string> {
  const signature =
    await getSubtle().sign(
      "Ed25519",
      privateKey,
      toCryptoBuffer(data),
    );

  return arrayBufferToBase64(
    signature,
  );
}

export async function verifyEd25519(
  publicKey: CryptoKey,
  signatureBase64: string,
  data: CryptoBinaryInput,
): Promise<boolean> {
  try {
    if (
      !isValidBase64(
        signatureBase64,
      )
    ) {
      return false;
    }

    return await getSubtle().verify(
      "Ed25519",
      publicKey,
      copyToArrayBuffer(
        base64ToBytes(
          signatureBase64,
        ),
      ),
      toCryptoBuffer(data),
    );
  } catch {
    return false;
  }
}

// ============================================================
// ED25519 KEY EXPORT
// ============================================================

export async function exportPublicKeyBase64(
  key: CryptoKey,
): Promise<string> {
  const spki =
    await getSubtle().exportKey(
      "spki",
      key,
    );

  return arrayBufferToBase64(
    spki,
  );
}

export async function exportPrivateKeyBase64(
  key: CryptoKey,
): Promise<string> {
  const pkcs8 =
    await getSubtle().exportKey(
      "pkcs8",
      key,
    );

  return arrayBufferToBase64(
    pkcs8,
  );
}

export async function importEd25519PublicKey(
  value: string,
): Promise<CryptoKey> {
  return await getSubtle().importKey(
    "spki",
    copyToArrayBuffer(
      base64ToBytes(value),
    ),
    {
      name: "Ed25519",
    },
    true,
    ["verify"],
  );
}

export async function importEd25519PrivateKey(
  value: string,
): Promise<CryptoKey> {
  return await getSubtle().importKey(
    "pkcs8",
    copyToArrayBuffer(
      base64ToBytes(value),
    ),
    {
      name: "Ed25519",
    },
    true,
    ["sign"],
  );
}

// ============================================================
// CONSTANT-TIME COMPARISON
// ============================================================

export async function constantTimeEqual(
  a:
    | string
    | Uint8Array,
  b:
    | string
    | Uint8Array,
): Promise<boolean> {
  const left =
    typeof a === "string"
      ? textEncoder.encode(a)
      : cloneBytes(a);

  const right =
    typeof b === "string"
      ? textEncoder.encode(b)
      : cloneBytes(b);

  if (
    left.length !==
    right.length
  ) {
    return false;
  }

  let difference = 0;

  for (
    let i = 0;
    i < left.length;
    i++
  ) {
    difference |=
      left[i] ^ right[i];
  }

  return difference === 0;
}

// ============================================================
// SYNCHRONOUS SECURE STRING COMPARISON
// ============================================================

export function secureCompare(
  a: string,
  b: string,
): boolean {
  if (
    a.length !== b.length
  ) {
    return false;
  }

  let result = 0;

  for (
    let i = 0;
    i < a.length;
    i++
  ) {
    result |=
      a.charCodeAt(i) ^
      b.charCodeAt(i);
  }

  return result === 0;
}

// ============================================================
// FINGERPRINTS
// ============================================================

export async function fingerprint(
  value: CryptoBinaryInput,
): Promise<string> {
  return await sha256Hex(
    value,
  );
}

export async function fingerprintParts(
  ...parts: string[]
): Promise<string> {
  return await sha256Hex(
    parts.join("|"),
  );
}

export async function fingerprintPartsBase64Url(
  ...parts: string[]
): Promise<string> {
  return await sha256Base64Url(
    parts.join("|"),
  );
}

// ============================================================
// HEX / BYTE HELPERS
// ============================================================

export function bytesFromHex(
  value: string,
): Uint8Array {
  return hexToBytes(value);
}

export function bytesToHexString(
  value: Uint8Array,
): string {
  return bytesToHex(value);
}

export function stringToBytes(
  value: string,
): Uint8Array {
  return textEncoder.encode(
    value,
  );
}

export function bytesToString(
  value: Uint8Array,
): string {
  return textDecoder.decode(
    value,
  );
}

// ============================================================
// HEX CONVERSION ALIASES
// ============================================================

export function hexToUint8Array(
  value: string,
): Uint8Array {
  return hexToBytes(value);
}

export function uint8ArrayToHex(
  value: Uint8Array,
): string {
  return bytesToHex(value);
}

// ============================================================
// PUBLIC KEY / KEY MATERIAL HELPERS
// ============================================================

export async function exportKey(
  format:
    | "raw"
    | "spki"
    | "pkcs8"
    | "jwk",
  key: CryptoKey,
): Promise<
  ArrayBuffer | JsonWebKey
> {
  return await getSubtle().exportKey(
    format,
    key,
  );
}

export async function importRawAesKey(
  value: CryptoBinaryInput,
  usages: KeyUsage[] = [
    "encrypt",
    "decrypt",
  ],
): Promise<CryptoKey> {
  return await importAesKey(
    toUint8Array(value),
    usages,
  );
}

// ============================================================
// AES KEY SIZE HELPERS
// ============================================================

export function isValidAesKeyLength(
  bytes: number,
): boolean {
  return (
    bytes === 16 ||
    bytes === 24 ||
    bytes === 32
  );
}

export function generateAesKeyBytes(
  length = 32,
): Uint8Array {
  if (
    !isValidAesKeyLength(
      length,
    )
  ) {
    throw new Error(
      "AES key must be 128, 192, or 256 bits.",
    );
  }

  return randomBytes(length);
}

// ============================================================
// ENCRYPTION VALIDATION
// ============================================================

function validateEncryptedData(
  encrypted: EncryptedData,
): void {
  if (
    !encrypted ||
    encrypted.version !== 1 ||
    encrypted.algorithm !==
      "AES-GCM"
  ) {
    throw new Error(
      "Unsupported encryption format.",
    );
  }

  if (
    !isValidBase64(
      encrypted.iv,
    )
  ) {
    throw new Error(
      "Invalid encrypted IV.",
    );
  }

  if (
    !isValidBase64(
      encrypted.ciphertext,
    )
  ) {
    throw new Error(
      "Invalid encrypted ciphertext.",
    );
  }
}

function validateAeadEncryptedData(
  encrypted: AeadEncryptedData,
): void {
  validateEncryptedData(
    encrypted,
  );

  if (
    encrypted.tagLength !==
      128 &&
    encrypted.tagLength !==
      96 &&
    encrypted.tagLength !==
      104 &&
    encrypted.tagLength !==
      112 &&
    encrypted.tagLength !==
      120
  ) {
    throw new Error(
      "Invalid AES-GCM authentication tag length.",
    );
  }
}

// ============================================================
// CRYPTO AVAILABILITY
// ============================================================

export function isCryptoAvailable(): boolean {
  return (
    typeof globalThis.crypto !==
      "undefined" &&
    typeof globalThis.crypto
      .subtle !==
      "undefined"
  );
}

export function isEd25519Available(): boolean {
  return isCryptoAvailable();
}

// ============================================================
// CRYPTO RANDOM HEALTH CHECK
// ============================================================

export function canGenerateRandomBytes(): boolean {
  try {
    if (
      !isCryptoAvailable()
    ) {
      return false;
    }

    const bytes =
      randomBytes(1);

    return (
      bytes.length === 1
    );
  } catch {
    return false;
  }
}

// ============================================================
// HASH ALGORITHM HELPERS
// ============================================================

export function isHashAlgorithm(
  value: unknown,
): value is HashAlgorithm {
  return (
    value === "SHA-256" ||
    value === "SHA-384" ||
    value === "SHA-512"
  );
}

export function hashOutputBytes(
  algorithm: HashAlgorithm,
): number {
  switch (algorithm) {
    case "SHA-256":
      return 32;

    case "SHA-384":
      return 48;

    case "SHA-512":
      return 64;

    default:
      throw new Error(
        "Unsupported hash algorithm.",
      );
  }
}

// ============================================================
// DETERMINISTIC IDENTIFIER HELPERS
// ============================================================

export async function hashedId(
  value: CryptoBinaryInput,
  prefix = "id",
): Promise<string> {
  const cleanPrefix =
    prefix
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9_-]/g,
        "",
      ) || "id";

  return `${cleanPrefix}_${await sha256Hex(
    value,
  )}`;
}

export async function hashedIdShort(
  value: CryptoBinaryInput,
  prefix = "id",
  length = 16,
): Promise<string> {
  if (
    !Number.isInteger(length) ||
    length < 4 ||
    length > 128
  ) {
    throw new Error(
      "Invalid hashed ID length.",
    );
  }

  const full =
    await sha256Hex(value);

  const cleanPrefix =
    prefix
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9_-]/g,
        "",
      ) || "id";

  return `${cleanPrefix}_${full.slice(
    0,
    length,
  )}`;
}

// ============================================================
// REQUEST SIGNATURE HELPERS
// ============================================================

export async function signPayload(
  secret: string,
  payload: CryptoBinaryInput,
): Promise<string> {
  return await hmacSha256Base64Url(
    secret,
    payload,
  );
}

export async function verifyPayloadSignature(
  secret: string,
  payload: CryptoBinaryInput,
  signature: string,
): Promise<boolean> {
  try {
    const expected =
      await signPayload(
        secret,
        payload,
      );

    return secureCompare(
      expected,
      signature,
    );
  } catch {
    return false;
  }
}

// ============================================================
// DATA PACKING HELPERS
// ============================================================

export function encodeBinary(
  value: CryptoBinaryInput,
): string {
  return bytesToBase64Url(
    toUint8Array(value),
  );
}

export function decodeBinary(
  value: string,
): Uint8Array {
  return base64UrlToBytes(
    value,
  );
}

// ============================================================
// SAFE PASSWORD VALIDATION
// ============================================================

export function isReasonableSecret(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    value.length >= 8 &&
    value.length <= 4096
  );
}

// ============================================================
// HASHED SECRET HELPERS
// ============================================================

export async function hashSecret(
  secret: string,
): Promise<string> {
  if (
    !isReasonableSecret(secret)
  ) {
    throw new Error(
      "Invalid secret.",
    );
  }

  return await sha256Base64Url(
    secret,
  );
}

export async function hashSecretSha512(
  secret: string,
): Promise<string> {
  if (
    !isReasonableSecret(secret)
  ) {
    throw new Error(
      "Invalid secret.",
    );
  }

  return await sha512Base64Url(
    secret,
  );
}

// ============================================================
// URL-SAFE RANDOM IDENTIFIER
// ============================================================

export function createSecureId(
  byteLength = 24,
): string {
  return randomBase64Url(
    byteLength,
  );
}

export function createSecureToken(
  byteLength = 32,
): string {
  return randomBase64Url(
    byteLength,
  );
}

export function createSecureNonce(
  byteLength = 12,
): string {
  return randomBase64Url(
    byteLength,
  );
}

// ============================================================
// END
// ============================================================
