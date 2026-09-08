import {
  bytesToHex,
  hexToBytes,
} from "./encoding";

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

const textEncoder =
  new TextEncoder();

const textDecoder =
  new TextDecoder();

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
  return getCrypto().subtle;
}

function toUint8Array(
  value:
    | string
    | ArrayBuffer
    | Uint8Array,
): Uint8Array {
  if (typeof value === "string") {
    return textEncoder.encode(value);
  }

  if (value instanceof Uint8Array) {
    return value;
  }

  return new Uint8Array(value);
}

function arrayBufferToBase64(
  value: ArrayBuffer | Uint8Array,
): string {
  const bytes =
    value instanceof Uint8Array
      ? value
      : new Uint8Array(value);

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

function base64ToBytes(
  value: string,
): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(
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

export function randomBytes(
  length = 32,
): Uint8Array {
  if (
    !Number.isInteger(length) ||
    length < 1 ||
    length > 65_536
  ) {
    throw new Error(
      "Invalid random byte length.",
    );
  }

  const bytes = new Uint8Array(
    length,
  );

  getCrypto().getRandomValues(
    bytes,
  );

  return bytes;
}

export function randomHex(
  length = 32,
): string {
  return bytesToHex(
    randomBytes(length),
  );
}

export function randomBase64(
  length = 32,
): string {
  return arrayBufferToBase64(
    randomBytes(length),
  );
}

export function randomBase64Url(
  length = 32,
): string {
  return randomBase64(length)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function sha256(
  value:
    | string
    | ArrayBuffer
    | Uint8Array,
): Promise<ArrayBuffer> {
  return await getSubtle().digest(
    "SHA-256",
    toUint8Array(value),
  );
}

export async function sha384(
  value:
    | string
    | ArrayBuffer
    | Uint8Array,
): Promise<ArrayBuffer> {
  return await getSubtle().digest(
    "SHA-384",
    toUint8Array(value),
  );
}

export async function sha512(
  value:
    | string
    | ArrayBuffer
    | Uint8Array,
): Promise<ArrayBuffer> {
  return await getSubtle().digest(
    "SHA-512",
    toUint8Array(value),
  );
}

export async function hashSha256(
  value:
    | string
    | ArrayBuffer
    | Uint8Array,
): Promise<HashResult> {
  const digest =
    await sha256(value);

  return {
    algorithm: "SHA-256",
    hex: bytesToHex(
      new Uint8Array(digest),
    ),
    base64:
      arrayBufferToBase64(digest),
  };
}

export async function hashSha512(
  value:
    | string
    | ArrayBuffer
    | Uint8Array,
): Promise<HashResult> {
  const digest =
    await sha512(value);

  return {
    algorithm: "SHA-512",
    hex: bytesToHex(
      new Uint8Array(digest),
    ),
    base64:
      arrayBufferToBase64(digest),
  };
}

export async function sha256Hex(
  value:
    | string
    | ArrayBuffer
    | Uint8Array,
): Promise<string> {
  const digest =
    await sha256(value);

  return bytesToHex(
    new Uint8Array(digest),
  );
}

export async function sha512Hex(
  value:
    | string
    | ArrayBuffer
    | Uint8Array,
): Promise<string> {
  const digest =
    await sha512(value);

  return bytesToHex(
    new Uint8Array(digest),
  );
}

export async function sha256Base64(
  value:
    | string
    | ArrayBuffer
    | Uint8Array,
): Promise<string> {
  const digest =
    await sha256(value);

  return arrayBufferToBase64(
    digest,
  );
}

export async function sha512Base64(
  value:
    | string
    | ArrayBuffer
    | Uint8Array,
): Promise<string> {
  const digest =
    await sha512(value);

  return arrayBufferToBase64(
    digest,
  );
}

export async function hmacSha256(
  key: string,
  value:
    | string
    | ArrayBuffer
    | Uint8Array,
): Promise<ArrayBuffer> {
  const cryptoKey =
    await getSubtle().importKey(
      "raw",
      textEncoder.encode(key),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["sign"],
    );

  return await getSubtle().sign(
    "HMAC",
    cryptoKey,
    toUint8Array(value),
  );
}

export async function hmacSha256Hex(
  key: string,
  value:
    | string
    | ArrayBuffer
    | Uint8Array,
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
  value:
    | string
    | ArrayBuffer
    | Uint8Array,
): Promise<string> {
  const result =
    await hmacSha256(
      key,
      value,
    );

  return arrayBufferToBase64(result)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function deriveKey(
  password: string,
  salt:
    | string
    | Uint8Array,
  iterations = 100_000,
): Promise<CryptoKey> {
  if (
    !Number.isInteger(iterations) ||
    iterations < 10_000
  ) {
    throw new Error(
      "PBKDF2 iteration count is too low.",
    );
  }

  const passwordKey =
    await getSubtle().importKey(
      "raw",
      textEncoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"],
    );

  const saltBytes =
    typeof salt === "string"
      ? textEncoder.encode(salt)
      : salt;

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
    ["encrypt", "decrypt"],
  );
}

export async function encryptText(
  plaintext: string,
  password: string,
  salt = randomBase64Url(16),
): Promise<EncryptedData & {
  salt: string;
}> {
  const iv = randomBytes(12);

  const key =
    await deriveKey(
      password,
      salt,
    );

  const encrypted =
    await getSubtle().encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      textEncoder.encode(
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

export async function decryptText(
  encrypted: EncryptedData & {
    salt: string;
  },
  password: string,
): Promise<string> {
  if (
    encrypted.version !== 1 ||
    encrypted.algorithm !==
      "AES-GCM"
  ) {
    throw new Error(
      "Unsupported encryption format.",
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

  const key =
    await deriveKey(
      password,
      encrypted.salt,
    );

  const decrypted =
    await getSubtle().decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      ciphertext,
    );

  return textDecoder.decode(
    decrypted,
  );
}

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
      ? rawKey
      : new Uint8Array(rawKey);

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
    bytes,
    {
      name: "AES-GCM",
    },
    false,
    usages,
  );
}

export async function generateAesKey(): Promise<CryptoKey> {
  return await getSubtle().generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  ) as CryptoKey;
}

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

export async function encryptWithKey(
  plaintext:
    | string
    | ArrayBuffer
    | Uint8Array,
  key: CryptoKey,
): Promise<EncryptedData> {
  const iv =
    randomBytes(12);

  const encrypted =
    await getSubtle().encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      toUint8Array(
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

export async function decryptWithKey(
  encrypted: EncryptedData,
  key: CryptoKey,
): Promise<Uint8Array> {
  if (
    encrypted.version !== 1 ||
    encrypted.algorithm !==
      "AES-GCM"
  ) {
    throw new Error(
      "Unsupported encryption format.",
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

  const decrypted =
    await getSubtle().decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      ciphertext,
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
  data:
    | string
    | ArrayBuffer
    | Uint8Array,
): Promise<string> {
  const signature =
    await getSubtle().sign(
      "Ed25519",
      privateKey,
      toUint8Array(data),
    );

  return arrayBufferToBase64(
    signature,
  );
}

export async function verifyEd25519(
  publicKey: CryptoKey,
  signatureBase64: string,
  data:
    | string
    | ArrayBuffer
    | Uint8Array,
): Promise<boolean> {
  try {
    return await getSubtle().verify(
      "Ed25519",
      publicKey,
      base64ToBytes(
        signatureBase64,
      ),
      toUint8Array(data),
    );
  } catch {
    return false;
  }
}

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
      : a;

  const right =
    typeof b === "string"
      ? textEncoder.encode(b)
      : b;

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

export function secureCompare(
  a: string,
  b: string,
): boolean {
  if (a.length !== b.length) {
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

export async function fingerprint(
  value:
    | string
    | ArrayBuffer
    | Uint8Array,
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

export function bytesFromHex(
  value: string,
): Uint8Array {
  return hexToBytes(value);
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
  return base64ToBytes(value);
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

export function isCryptoAvailable(): boolean {
  return (
    typeof globalThis.crypto !==
      "undefined" &&
    typeof globalThis.crypto
      .subtle !== "undefined"
  );
    }
