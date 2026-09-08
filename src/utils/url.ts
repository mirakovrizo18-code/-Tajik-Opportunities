import { isValidId } from "./id";

export interface UrlParts {
  href: string;
  origin: string;
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
}

export interface QueryEntry {
  key: string;
  value: string;
}

export interface SafeUrlOptions {
  protocols?: string[];
  allowRelative?: boolean;
  allowLocalhost?: boolean;
  allowCredentials?: boolean;
  maxLength?: number;
}

const DEFAULT_PROTOCOLS = ["http:", "https:"];
const DEFAULT_MAX_LENGTH = 2048;

export function toUrl(
  value: string | URL,
  base?: string | URL
): URL | null {
  try {
    return value instanceof URL
      ? new URL(value.href)
      : new URL(value, base);
  } catch {
    return null;
  }
}

export function parseUrl(
  value: string | URL,
  base?: string | URL
): UrlParts | null {
  const url = toUrl(value, base);
  if (!url) return null;

  return {
    href: url.href,
    origin: url.origin,
    protocol: url.protocol,
    host: url.host,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
  };
}

export function isValidUrl(
  value: unknown,
  options: SafeUrlOptions = {}
): boolean {
  if (typeof value !== "string") return false;

  const maxLength = options.maxLength ?? DEFAULT_MAX_LENGTH;

  if (!value.trim() || value.length > maxLength) {
    return false;
  }

  const trimmed = value.trim();

  if (options.allowRelative && isSafeRelativeUrl(trimmed)) {
    return true;
  }

  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    return false;
  }

  const protocols = options.protocols ?? DEFAULT_PROTOCOLS;

  if (!protocols.includes(url.protocol)) {
    return false;
  }

  if (!options.allowCredentials && (url.username || url.password)) {
    return false;
  }

  if (!options.allowLocalhost && isLocalhost(url.hostname)) {
    return false;
  }

  return true;
}

export function isHttpUrl(value: unknown): value is string {
  return isValidUrl(value, {
    protocols: ["http:", "https:"],
  });
}

export function isHttpsUrl(value: unknown): value is string {
  return isValidUrl(value, {
    protocols: ["https:"],
  });
}

export function normalizeUrl(
  value: string,
  options: SafeUrlOptions = {}
): string | null {
  if (!isValidUrl(value, options)) {
    return null;
  }

  const url = toUrl(value.trim());

  if (!url) {
    return null;
  }

  url.hash = "";

  return url.href;
}

export function getOrigin(value: string): string | null {
  const url = toUrl(value);
  return url?.origin ?? null;
}

export function getHostname(value: string): string | null {
  const url = toUrl(value);
  return url?.hostname ?? null;
}

export function getPathname(value: string): string | null {
  const url = toUrl(value);
  return url?.pathname ?? null;
}

export function getSearch(value: string): string | null {
  const url = toUrl(value);
  return url?.search ?? null;
}

export function getHash(value: string): string | null {
  const url = toUrl(value);
  return url?.hash ?? null;
}

export function getQueryParams(
  value: string | URL
): URLSearchParams | null {
  const url = toUrl(value);
  return url ? new URLSearchParams(url.search) : null;
}

export function getQueryParam(
  value: string | URL,
  key: string
): string | null {
  const params = getQueryParams(value);
  return params?.get(key) ?? null;
}

export function getQueryParamsAll(
  value: string | URL,
  key: string
): string[] {
  const params = getQueryParams(value);
  return params?.getAll(key) ?? [];
}

export function hasQueryParam(
  value: string | URL,
  key: string
): boolean {
  const params = getQueryParams(value);
  return params?.has(key) ?? false;
}

export function setQueryParam(
  value: string,
  key: string,
  paramValue: string
): string | null {
  const url = toUrl(value);

  if (!url) return null;

  url.searchParams.set(key, paramValue);

  return url.href;
}

export function setQueryParams(
  value: string,
  params: Record<string, string | number | boolean | null | undefined>
): string | null {
  const url = toUrl(value);

  if (!url) return null;

  for (const [key, paramValue] of Object.entries(params)) {
    if (paramValue === null || paramValue === undefined) {
      url.searchParams.delete(key);
      continue;
    }

    url.searchParams.set(key, String(paramValue));
  }

  return url.href;
}

export function appendQueryParam(
  value: string,
  key: string,
  paramValue: string
): string | null {
  const url = toUrl(value);

  if (!url) return null;

  url.searchParams.append(key, paramValue);

  return url.href;
}

export function deleteQueryParam(
  value: string,
  key: string
): string | null {
  const url = toUrl(value);

  if (!url) return null;

  url.searchParams.delete(key);

  return url.href;
}

export function deleteQueryParams(
  value: string,
  keys: string[]
): string | null {
  const url = toUrl(value);

  if (!url) return null;

  for (const key of keys) {
    url.searchParams.delete(key);
  }

  return url.href;
}

export function clearQuery(value: string): string | null {
  const url = toUrl(value);

  if (!url) return null;

  url.search = "";

  return url.href;
}

export function clearHash(value: string): string | null {
  const url = toUrl(value);

  if (!url) return null;

  url.hash = "";

  return url.href;
}

export function addPathSegment(
  base: string,
  segment: string
): string | null {
  const url = toUrl(base);

  if (!url) return null;

  const cleanSegment = segment
    .trim()
    .replace(/^\/+|\/+$/g, "");

  if (!cleanSegment) {
    return url.href;
  }

  const encoded = encodeURIComponent(cleanSegment);

  url.pathname = `${url.pathname.replace(/\/+$/, "")}/${encoded}`;

  return url.href;
}

export function buildPath(
  ...segments: Array<string | number | null | undefined>
): string {
  return (
    "/" +
    segments
      .filter(
        (segment): segment is string | number =>
          segment !== null &&
          segment !== undefined &&
          String(segment).trim() !== ""
      )
      .map((segment) =>
        encodeURIComponent(String(segment).trim().replace(/^\/+|\/+$/g, ""))
      )
      .join("/")
  );
}

export function joinUrl(
  base: string,
  path: string
): string | null {
  const baseUrl = toUrl(base);

  if (!baseUrl) return null;

  const cleanPath = path.trim();

  if (!cleanPath) {
    return baseUrl.href;
  }

  if (/^https?:\/\//i.test(cleanPath)) {
    return normalizeUrl(cleanPath);
  }

  const normalizedPath = cleanPath.replace(/^\/+/, "");

  baseUrl.pathname = `${baseUrl.pathname.replace(/\/+$/, "")}/${normalizedPath}`;

  return baseUrl.href;
}

export function isSameOrigin(
  first: string,
  second: string
): boolean {
  const a = toUrl(first);
  const b = toUrl(second);

  if (!a || !b) return false;

  return a.origin === b.origin;
}

export function isSameHost(
  first: string,
  second: string
): boolean {
  const a = toUrl(first);
  const b = toUrl(second);

  if (!a || !b) return false;

  return a.hostname.toLowerCase() === b.hostname.toLowerCase();
}

export function isSamePath(
  first: string,
  second: string
): boolean {
  const a = toUrl(first);
  const b = toUrl(second);

  if (!a || !b) return false;

  return a.pathname === b.pathname;
}

export function isExternalUrl(
  value: string,
  currentOrigin: string
): boolean {
  const url = toUrl(value);

  if (!url) return false;

  const current = toUrl(currentOrigin);

  if (!current) return false;

  return url.origin !== current.origin;
}

export function isLocalhost(hostname: string): boolean {
  const host = hostname.toLowerCase().trim();

  return (
    host === "localhost" ||
    host === "localhost.localdomain" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "[::1]"
  );
}

export function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().trim();

  if (isLocalhost(host)) {
    return true;
  }

  if (
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".localhost")
  ) {
    return true;
  }

  if (
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  ) {
    return true;
  }

  return false;
}

export function isSafeRelativeUrl(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed) return false;

  if (
    trimmed.startsWith("//") ||
    trimmed.startsWith("\\\\") ||
    trimmed.includes("\r") ||
    trimmed.includes("\n")
  ) {
    return false;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return false;
  }

  return trimmed.startsWith("/") || trimmed.startsWith("./") || trimmed.startsWith("../");
}

export function sanitizeRedirectUrl(
  value: string,
  fallback = "/"
): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return fallback;
  }

  if (isSafeRelativeUrl(trimmed)) {
    return trimmed;
  }

  return fallback;
}

export function sanitizeReturnUrl(
  value: string | null | undefined,
  fallback = "/"
): string {
  if (!value) return fallback;

  return sanitizeRedirectUrl(value, fallback);
}

export function buildApiUrl(
  origin: string,
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>
): string | null {
  const url = toUrl(origin);

  if (!url) return null;

  url.pathname = path.startsWith("/") ? path : `/${path}`;

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.href;
}

export function buildPublicationUrl(
  origin: string,
  publicationId: string
): string | null {
  if (!isValidId(publicationId)) {
    return null;
  }

  return buildApiUrl(
    origin,
    `/publications/${encodeURIComponent(publicationId)}`
  );
}

export function buildProfileUrl(
  origin: string,
  profileId: string
): string | null {
  if (!isValidId(profileId)) {
    return null;
  }

  return buildApiUrl(
    origin,
    `/profile/${encodeURIComponent(profileId)}`
  );
}

export function buildAdminUrl(
  origin: string,
  path = ""
): string | null {
  const cleanPath = path.replace(/^\/+/, "");

  return buildApiUrl(
    origin,
    `/admin/${cleanPath}`
  );
}

export function toQueryString(
  params: Record<
    string,
    string | number | boolean | string[] | null | undefined
  >
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        search.append(key, String(item));
      }
    } else {
      search.set(key, String(value));
    }
  }

  const result = search.toString();

  return result ? `?${result}` : "";
}

export function parseQueryString(
  value: string
): QueryEntry[] {
  const normalized = value.startsWith("?")
    ? value.slice(1)
    : value;

  const params = new URLSearchParams(normalized);

  const entries: QueryEntry[] = [];

  for (const [key, queryValue] of params.entries()) {
    entries.push({
      key,
      value: queryValue,
    });
  }

  return entries;
}

export function sortQueryParams(
  value: string
): string | null {
  const url = toUrl(value);

  if (!url) return null;

  const entries = Array.from(url.searchParams.entries());

  entries.sort(([keyA, valueA], [keyB, valueB]) => {
    const keyCompare = keyA.localeCompare(keyB);

    if (keyCompare !== 0) {
      return keyCompare;
    }

    return valueA.localeCompare(valueB);
  });

  url.search = "";

  for (const [key, queryValue] of entries) {
    url.searchParams.append(key, queryValue);
  }

  return url.href;
}

export function removeTrackingParams(
  value: string
): string | null {
  const url = toUrl(value);

  if (!url) return null;

  const trackingPrefixes = [
    "utm_",
    "fbclid",
    "gclid",
    "dclid",
    "msclkid",
    "mc_cid",
    "mc_eid",
    "_ga",
  ];

  for (const key of Array.from(url.searchParams.keys())) {
    if (
      trackingPrefixes.some(
        (prefix) =>
          key === prefix || key.startsWith(prefix)
      )
    ) {
      url.searchParams.delete(key);
    }
  }

  return url.href;
}

export function getFileExtension(
  value: string
): string | null {
  const pathname = getPathname(value);

  if (!pathname) return null;

  const filename = pathname.split("/").pop() ?? "";
  const index = filename.lastIndexOf(".");

  if (index <= 0 || index === filename.length - 1) {
    return null;
  }

  return filename.slice(index + 1).toLowerCase();
}

export function getFilenameFromUrl(
  value: string
): string | null {
  const pathname = getPathname(value);

  if (!pathname) return null;

  const filename = pathname.split("/").pop();

  return filename ? decodeURIComponent(filename) : null;
}

export function isApiPath(
  pathname: string
): boolean {
  const normalized = pathname.replace(/^\/+/, "");

  return (
    normalized === "api" ||
    normalized.startsWith("api/")
  );
}

export function isAdminPath(
  pathname: string
): boolean {
  const normalized = pathname.replace(/^\/+/, "");

  return (
    normalized === "admin" ||
    normalized.startsWith("admin/")
  );
}

export function isPublicationPath(
  pathname: string
): boolean {
  return /^\/?publications(?:\/|$)/i.test(pathname);
}

export function isProfilePath(
  pathname: string
): boolean {
  return /^\/?profile(?:\/|$)/i.test(pathname);
}

export function isChatPath(
  pathname: string
): boolean {
  return /^\/?(?:chat|messages)(?:\/|$)/i.test(pathname);
}

export function isSafePath(
  pathname: string
): boolean {
  if (!pathname) return false;

  if (
    pathname.includes("\0") ||
    pathname.includes("\r") ||
    pathname.includes("\n")
  ) {
    return false;
  }

  if (pathname.includes("..")) {
    const segments = pathname.split("/");

    if (segments.includes("..")) {
      return false;
    }
  }

  return true;
}

export function normalizePath(
  pathname: string
): string {
  let result = pathname.trim();

  if (!result) return "/";

  result = result.replace(/\\/g, "/");
  result = result.replace(/\/{2,}/g, "/");

  if (!result.startsWith("/")) {
    result = `/${result}`;
  }

  if (result.length > 1) {
    result = result.replace(/\/+$/, "");
  }

  return result;
}

export function pathSegments(
  pathname: string
): string[] {
  return normalizePath(pathname)
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    });
}

export function matchPath(
  pathname: string,
  pattern: string
): boolean {
  const path = normalizePath(pathname);
  const target = normalizePath(pattern);

  if (target === path) {
    return true;
  }

  const patternSegments = pathSegments(target);
  const pathParts = pathSegments(path);

  if (patternSegments.length !== pathParts.length) {
    return false;
  }

  return patternSegments.every((segment, index) => {
    if (
      segment.startsWith(":") ||
      segment.startsWith("*")
    ) {
      return true;
    }

    return segment === pathParts[index];
  });
}

export function getPathParameter(
  pathname: string,
  pattern: string,
  parameter: string
): string | null {
  const pathParts = pathSegments(pathname);
  const patternParts = pathSegments(pattern);

  if (pathParts.length !== patternParts.length) {
    return null;
  }

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];

    if (patternPart === `:${parameter}`) {
      return pathParts[i] ?? null;
    }
  }

  return null;
}

export function getBaseUrl(request: Request): string {
  const url = new URL(request.url);
  return url.origin;
}

export function getRequestUrl(request: Request): URL {
  return new URL(request.url);
}

export function getRequestOrigin(request: Request): string {
  return new URL(request.url).origin;
}

export function getRequestPath(request: Request): string {
  return new URL(request.url).pathname;
}

export function getRequestQuery(
  request: Request
): URLSearchParams {
  return new URL(request.url).searchParams;
}

export function createAbsoluteUrl(
  request: Request,
  path: string,
  params?: Record<string, string | number | boolean>
): string {
  const url = new URL(path, request.url);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.href;
}

export function canonicalUrl(
  value: string
): string | null {
  const normalized = normalizeUrl(value, {
    protocols: ["http:", "https:"],
  });

  if (!normalized) return null;

  const withoutTracking = removeTrackingParams(normalized);

  if (!withoutTracking) return null;

  return sortQueryParams(withoutTracking);
}

export function isPotentialOpenRedirect(
  value: string
): boolean {
  const trimmed = value.trim();

  if (!trimmed) return false;

  if (
    trimmed.startsWith("//") ||
    trimmed.startsWith("\\\\")
  ) {
    return true;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return true;
  }

  try {
    const decoded = decodeURIComponent(trimmed);

    if (
      decoded.startsWith("//") ||
      decoded.startsWith("\\\\") ||
      /^[a-z][a-z0-9+.-]*:/i.test(decoded)
    ) {
      return true;
    }
  } catch {
    // Ignore malformed URI encoding.
  }

  return false;
}

export function safeExternalUrl(
  value: string,
  allowedHosts: string[] = []
): string | null {
  if (!isHttpUrl(value)) {
    return null;
  }

  const url = toUrl(value);

  if (!url) return null;

  if (allowedHosts.length === 0) {
    return url.href;
  }

  const hostname = url.hostname.toLowerCase();

  const allowed = allowedHosts.some((host) => {
    const normalized = host.toLowerCase().trim();

    return (
      hostname === normalized ||
      hostname.endsWith(`.${normalized}`)
    );
  });

  return allowed ? url.href : null;
}

export function encodePathSegment(
  value: string
): string {
  return encodeURIComponent(value);
}

export function decodePathSegment(
  value: string
): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

export function encodeQueryValue(
  value: string
): string {
  return encodeURIComponent(value);
}

export function decodeQueryValue(
  value: string
): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
    }
