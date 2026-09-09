// ============================================================
// 🇹🇯 TAJIK OPPORTUNITIES
// CRYPTO / SECURITY UTILITIES
// Version: 2026.09
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
  tagLength: number;
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

const textEncoder =
  new TextEncoder();

const textDecoder =
  new TextDecoder();

const MAX_RANDOM_BYTES = 65_536;

const DEFAULT_PBKDF2_ITERATIONS =
  100_000;

const MIN_PBKDF2_ITERATIONS =
  10_000;

const MAX_PBKDF2_ITERATIONS =
  10_000_000;

const AES_GCM_IV_BYTES = 12;

const AES_GCM_TAG_LENGTH = 128;

const DEFAULT_SALT_BYTES = 16;

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
      "Web Crypto API SubtleCrypto is unavailable.",
    );
  }

  return cryptoApi.subtle;
}

// ============================================================
// ARRAYBUFFER COMPATIBILITY
// ============================================================
//
// TypeScript 5.9 + Cloudflare Workers types can infer:
//
// Uint8Array<ArrayBufferLike>
//
// while Web Crypto expects:
//
// ArrayBufferView<ArrayBuffer>
//
// Поэтому данные перед Crypto API копируются в собственный
// ArrayBuffer. Это сохраняет runtime-поведение и убирает
// TS2345/TS2769.
// ============================================================

function copyToArrayBuffer(
  value: Uint8Array,
): ArrayBuffer {
  const buffer =
    new ArrayBuffer(
      value.byteLength,
    );

  new Uint8Array(
    buffer,
  ).set(value);

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

// ============================================================
// BYTE HELPERS
// ============================================================

export function concatBytes(
  ...values: Array<
    Uint8Array | ArrayBuffer
  >
): Uint8Array {
  let total = 0;

  for (const value of values) {
    total +=
      value instanceof Uint8Array
        ? value.byteLength
        : value.byteLength;
  }

  const result =
    new Uint8Array(total);

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
  const result =
    new Uint8Array(
      value.byteLength,
    );

  result.set(value);

  return result;
}

export function wipeBytes(
  value: Uint8Array,
): void {
  value.fill(0);
}

export function bytesLength(
  value: CryptoBinaryInput,
): number {
  return toUint8Array(
    value,
  ).byteLength;
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

function bytesToBase64UrlInternal(
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

// ============================================================
// BASE64 VALIDATION
// ============================================================

export function isValidBase64(
  value: unknown,
): value is string {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  if (
    value.length % 4 !== 0
  ) {
    return false;
  }

  return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=?)?$/.test(
    value,
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

  return /^[A-Za-z0-9_-]*$/.test(
    value,
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
  return bytesToBase64UrlInternal(
    randomBytes(length),
  );
}

// ============================================================
// NONCE / SALT / TOKEN
// ============================================================

export function randomNonce(
  length = AES_GCM_IV_BYTES,
): Uint8Array {
  return randomBytes(
    length,
  );
}

export function randomSalt(
  length = DEFAULT_SALT_BYTES,
): Uint8Array {
  return randomBytes(
    length,
  );
}

export function randomToken(
  length = 32,
): string {
  return randomBase64Url(
    length,
  );
}

// ============================================================
// UUID
// ============================================================

export function uuid(): string {
  return getCrypto().randomUUID();
}

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
  const result =
    await digest(
      algorithm,
      value,
    );

  const bytes =
    new Uint8Array(result);

  return {
    algorithm,
    hex: bytesToHex(bytes),
    base64:
      arrayBufferToBase64(result),
  };
}

export async function hashSha256(
  value: CryptoBinaryInput,
): Promise<HashResult> {
  return await hash(
    "SHA-256",
    value,
  );
}

export async function hashSha384(
  value: CryptoBinaryInput,
): Promise<HashResult> {
  return await hash(
    "SHA-384",
    value,
  );
}

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
  return arrayBufferToBase64(
    await sha256(value),
  );
}

export async function sha384Base64(
  value: CryptoBinaryInput,
): Promise<string> {
  return arrayBufferToBase64(
    await sha384(value),
  );
}

export async function sha512Base64(
  value: CryptoBinaryInput,
): Promise<string> {
  return arrayBufferToBase64(
    await sha512(value),
  );
}

export async function sha256Base64Url(
  value: CryptoBinaryInput,
): Promise<string> {
  return bytesToBase64UrlInternal(
    new Uint8Array(
      await sha256(value),
    ),
  );
}

export async function sha384Base64Url(
  value: CryptoBinaryInput,
): Promise<string> {
  return bytesToBase64UrlInternal(
    new Uint8Array(
      await sha384(value),
    ),
  );
}

export async function sha512Base64Url(
  value: CryptoBinaryInput,
): Promise<string> {
  return bytesToBase64UrlInternal(
    new Uint8Array(
      await sha512(value),
    ),
  );
}

// ============================================================
// HMAC
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
    [
      "sign",
      "verify",
    ],
  );
}

// ============================================================
// HMAC SHA-256
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
  return bytesToHex(
    new Uint8Array(
      await hmacSha256(
        key,
        value,
      ),
    ),
  );
}

export async function hmacSha256Base64(
  key: string,
  value: CryptoBinaryInput,
): Promise<string> {
  return arrayBufferToBase64(
    await hmacSha256(
      key,
      value,
    ),
  );
}

export async function hmacSha256Base64Url(
  key: string,
  value: CryptoBinaryInput,
): Promise<string> {
  return bytesToBase64UrlInternal(
    new Uint8Array(
      await hmacSha256(
        key,
        value,
      ),
    ),
  );
}

// ============================================================
// HMAC SHA-512
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
  return bytesToHex(
    new Uint8Array(
      await hmacSha512(
        key,
        value,
      ),
    ),
  );
}

export async function hmacSha512Base64Url(
  key: string,
  value: CryptoBinaryInput,
): Promise<string> {
  return bytesToBase64UrlInternal(
    new Uint8Array(
      await hmacSha512(
        key,
        value,
      ),
    ),
  );
}

// ============================================================
// PBKDF2 VALIDATION
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
    iterations >
    MAX_PBKDF2_ITERATIONS
  ) {
    throw new Error(
      "PBKDF2 iteration count is too high.",
    );
  }
}

// ============================================================
// PBKDF2 AES KEY
// ============================================================

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
// PBKDF2 RAW
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

  return new Uint8Array(
    bits,
  );
}

// ============================================================
// HKDF
// ============================================================

export async function deriveHkdfKey(
  secret: CryptoBinaryInput,
  salt: CryptoBinaryInput,
  info: CryptoBinaryInput = "",
  options: HkdfOptions = {},
): Promise<CryptoKey> {
  const hash =
    options.hash ??
    "SHA-256";

  const length =
    options.length ??
    256;

  if (
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
    rawKey instanceof Uint8Array
      ? cloneBytes(rawKey)
      : new Uint8Array(
          rawKey.slice(0),
        );

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
// AES KEY SIZE HELPERS
// ============================================================

export function isValidAesKeyLength(
  length: number,
): boolean {
  return (
    length === 16 ||
    length === 24 ||
    length === 32
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

  return randomBytes(
    length,
  );
}

// ============================================================
// ENCRYPT WITH AES KEY
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
// DECRYPT WITH AES KEY
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
// AES-GCM PASSWORD ENCRYPTION
// ============================================================

export async function encryptText(
  plaintext: string,
  password: string,
  salt = randomBase64Url(
    DEFAULT_SALT_BYTES,
  ),
): Promise<EncryptedDataWithSalt> {
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
  encrypted: EncryptedDataWithSalt,
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
// AES-GCM AAD
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
// ED25519 KEY EXPORT / IMPORT
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
// CONSTANT-TIME BYTE COMPARISON
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
// CONSTANT-TIME STRING COMPARISON
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
// BYTE / STRING HELPERS
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
  return bytesToBase64UrlInternal(
    value,
  );
}

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
// STRING ENCODING
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
  return bytesToBase64UrlInternal(
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
// HASHED IDS
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

  const cleanPrefix =
    prefix
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9_-]/g,
        "",
      ) || "id";

  const hash =
    await sha256Hex(value);

  return `${cleanPrefix}_${hash.slice(
    0,
    length,
  )}`;
}

// ============================================================
// SIGNED PAYLOAD HELPERS
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
// BINARY PACKING
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
  return base64UrlToBytes(value);
}

// ============================================================
// SECRET VALIDATION
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
// SECURE ID HELPERS
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
    ![
      96,
      104,
      112,
      120,
      128,
    ].includes(
      encrypted.tagLength,
    )
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

export function canGenerateRandomBytes(): boolean {
  try {
    if (
      !isCryptoAvailable()
    ) {
      return false;
    }

    const bytes =
      randomBytes(1);

    return bytes.length === 1;
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
// GENERIC KEY EXPORT
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
// END
// ============================================================
