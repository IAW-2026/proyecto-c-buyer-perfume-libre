/**
 * Cliente HTTP centralizado y resiliente.
 * Resuelve timeouts configurables, correlación/logging, reintentos exponenciales con jitter
 * para operaciones idempotentes y clasificación de errores tipados.
 */

import crypto from "crypto";
import { z } from "zod";

export class HttpClientError extends Error {
  readonly service: string;
  readonly operation: string;
  readonly correlationId: string;
  readonly status?: number;
  readonly statusText?: string;
  readonly responseBody?: unknown;

  constructor({
    message,
    service,
    operation,
    correlationId,
    status,
    statusText,
    responseBody,
    cause,
  }: {
    message: string;
    service: string;
    operation: string;
    correlationId: string;
    status?: number;
    statusText?: string;
    responseBody?: unknown;
    cause?: unknown;
  }) {
    super(message);
    this.name = "HttpClientError";
    this.service = service;
    this.operation = operation;
    this.correlationId = correlationId;
    this.status = status;
    this.statusText = statusText;
    this.responseBody = responseBody;
    if (cause) this.cause = cause;
  }
}

export class HttpTimeoutError extends HttpClientError {
  constructor(params: ConstructorParameters<typeof HttpClientError>[0]) {
    super(params);
    this.name = "HttpTimeoutError";
  }
}

export class HttpNotFoundError extends HttpClientError {
  constructor(params: ConstructorParameters<typeof HttpClientError>[0]) {
    super(params);
    this.name = "HttpNotFoundError";
  }
}

export class HttpUnauthorizedError extends HttpClientError {
  constructor(params: ConstructorParameters<typeof HttpClientError>[0]) {
    super(params);
    this.name = "HttpUnauthorizedError";
  }
}

export class HttpRateLimitError extends HttpClientError {
  readonly retryAfterSeconds?: number;

  constructor(
    params: ConstructorParameters<typeof HttpClientError>[0] & {
      retryAfterSeconds?: number;
    },
  ) {
    super(params);
    this.name = "HttpRateLimitError";
    this.retryAfterSeconds = params.retryAfterSeconds;
  }
}

export class HttpServiceUnavailableError extends HttpClientError {
  constructor(params: ConstructorParameters<typeof HttpClientError>[0]) {
    super(params);
    this.name = "HttpServiceUnavailableError";
  }
}

export class HttpResponseValidationError extends HttpClientError {
  readonly validationErrors: z.ZodIssue[];

  constructor(
    params: ConstructorParameters<typeof HttpClientError>[0] & {
      validationErrors: z.ZodIssue[];
    },
  ) {
    super(params);
    this.name = "HttpResponseValidationError";
    this.validationErrors = params.validationErrors;
  }
}

export interface HttpRequestOptions<T = unknown> {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: HeadersInit;
  body?: unknown;
  service: string;
  operation: string;
  timeoutMs?: number;
  correlationId?: string;
  schema?: z.ZodType<T>;
  retry?: {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    idempotent?: boolean;
  };
  signal?: AbortSignal;
}

const DEFAULT_TIMEOUT_MS = 8000;
const RETRIABLE_STATUS_CODES = new Set([429, 502, 503, 504]);
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calcularDelayConJitter(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number,
): number {
  const exponencial = baseDelayMs * Math.pow(2, attempt);
  const capped = Math.min(maxDelayMs, exponencial);
  const jitter = Math.floor(Math.random() * 100);
  return capped + jitter;
}

export async function httpClient<T = unknown>(
  options: HttpRequestOptions<T>,
): Promise<T> {
  const {
    url,
    method = "GET",
    service,
    operation,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    correlationId = crypto.randomUUID(),
    schema,
    retry = {},
    signal: externalSignal,
  } = options;

  const esIdempotente =
    SAFE_METHODS.has(method.toUpperCase()) || retry.idempotent === true;
  const maxRetries = esIdempotente ? (retry.maxRetries ?? 2) : 0;
  const baseDelayMs = retry.baseDelayMs ?? 300;
  const maxDelayMs = retry.maxDelayMs ?? 2500;

  let attempt = 0;

  while (attempt <= maxRetries) {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort(
        new Error(
          `Timeout de ${timeoutMs}ms excedido para ${service}:${operation}`,
        ),
      );
    }, timeoutMs);

    const onExternalAbort = () => {
      abortController.abort(externalSignal?.reason);
    };

    if (externalSignal) {
      if (externalSignal.aborted) {
        clearTimeout(timeoutId);
        abortController.abort(externalSignal.reason);
      } else {
        externalSignal.addEventListener("abort", onExternalAbort, {
          once: true,
        });
      }
    }

    try {
      const headers = new Headers(options.headers);
      headers.set("x-correlation-id", correlationId);
      headers.set("x-request-id", correlationId);

      const requestInit: RequestInit = {
        method,
        headers,
        signal: abortController.signal,
        cache: "no-store",
      };

      if (options.body !== undefined && options.body !== null) {
        if (
          typeof options.body === "string" ||
          options.body instanceof FormData ||
          options.body instanceof URLSearchParams ||
          options.body instanceof Blob
        ) {
          requestInit.body = options.body;
        } else {
          headers.set("Content-Type", "application/json");
          requestInit.body = JSON.stringify(options.body);
        }
      }

      const response = await fetch(url, requestInit);

      // Si la respuesta no es OK, evaluamos reintentos o arrojamos error tipado
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        let responseBody: unknown = text;
        try {
          if (text) responseBody = JSON.parse(text);
        } catch {
          // cuerpo en texto plano
        }

        const isRetriableStatus = RETRIABLE_STATUS_CODES.has(response.status);

        if (esIdempotente && isRetriableStatus && attempt < maxRetries) {
          let waitTime = calcularDelayConJitter(
            attempt,
            baseDelayMs,
            maxDelayMs,
          );

          if (response.status === 429) {
            const retryAfterHeader = response.headers.get("Retry-After");
            if (retryAfterHeader) {
              const seconds = parseInt(retryAfterHeader, 10);
              if (!isNaN(seconds) && seconds > 0) {
                waitTime = Math.min(seconds * 1000, maxDelayMs);
              }
            }
          }

          console.warn(
            `⚠️ [HttpClient] Reintento ${attempt + 1}/${maxRetries} para ${service}:${operation} tras HTTP ${response.status}. Esperando ${waitTime}ms... (cid: ${correlationId})`,
          );

          attempt++;
          await sleep(waitTime);
          continue;
        }

        const baseErrorParams = {
          service,
          operation,
          correlationId,
          status: response.status,
          statusText: response.statusText,
          responseBody,
        };

        if (response.status === 404) {
          throw new HttpNotFoundError({
            ...baseErrorParams,
            message: `Recurso no encontrado en ${service} (${operation}): ${url}`,
          });
        }

        if (response.status === 401 || response.status === 403) {
          throw new HttpUnauthorizedError({
            ...baseErrorParams,
            message: `No autorizado para ${service} (${operation}): ${url}`,
          });
        }

        if (response.status === 429) {
          const retryAfterSec = parseInt(
            response.headers.get("Retry-After") || "",
            10,
          );
          throw new HttpRateLimitError({
            ...baseErrorParams,
            message: `Límite de tasa excedido en ${service} (${operation})`,
            retryAfterSeconds: isNaN(retryAfterSec) ? undefined : retryAfterSec,
          });
        }

        if (
          response.status === 502 ||
          response.status === 503 ||
          response.status === 504
        ) {
          throw new HttpServiceUnavailableError({
            ...baseErrorParams,
            message: `Servicio ${service} no disponible temporalmente (${response.status} en ${operation})`,
          });
        }

        throw new HttpClientError({
          ...baseErrorParams,
          message: `Error HTTP ${response.status} al consultar ${service} (${operation})`,
        });
      }

      // Si la respuesta fue 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      const text = await response.text();
      let data: unknown = null;
      if (text && text.trim().length > 0) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }

      // Validación con Zod si se proporcionó un esquema
      if (schema) {
        const validation = schema.safeParse(data);
        if (!validation.success) {
          throw new HttpResponseValidationError({
            service,
            operation,
            correlationId,
            status: response.status,
            statusText: response.statusText,
            responseBody: data,
            validationErrors: validation.error.issues,
            message: `Respuesta de ${service}:${operation} no coincide con el esquema esperado`,
          });
        }
        return validation.data;
      }

      return data as T;
    } catch (error: unknown) {
      if (error instanceof HttpClientError) {
        throw error;
      }

      const isAbortError =
        (error instanceof Error && error.name === "AbortError") ||
        abortController.signal.aborted;

      if (isAbortError) {
        throw new HttpTimeoutError({
          service,
          operation,
          correlationId,
          message: `Tiempo de espera agotado (${timeoutMs}ms) al comunicarse con ${service}:${operation}`,
          cause: error,
        });
      }

      // Fallo de red (conexión rechazada, DNS, etc.)
      if (esIdempotente && attempt < maxRetries) {
        const waitTime = calcularDelayConJitter(
          attempt,
          baseDelayMs,
          maxDelayMs,
        );
        console.warn(
          `⚠️ [HttpClient] Reintento ${attempt + 1}/${maxRetries} por fallo de red en ${service}:${operation}. Esperando ${waitTime}ms... (cid: ${correlationId})`,
        );
        attempt++;
        await sleep(waitTime);
        continue;
      }

      throw new HttpClientError({
        service,
        operation,
        correlationId,
        message: `Fallo de red al conectar con ${service} (${operation}): ${
          error instanceof Error ? error.message : String(error)
        }`,
        cause: error,
      });
    } finally {
      clearTimeout(timeoutId);
      if (externalSignal) {
        externalSignal.removeEventListener("abort", onExternalAbort);
      }
    }
  }

  throw new HttpClientError({
    service,
    operation,
    correlationId,
    message: `Intentos máximos (${maxRetries}) agotados para ${service}:${operation}`,
  });
}
