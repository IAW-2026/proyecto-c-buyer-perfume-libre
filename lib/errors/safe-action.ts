import type { z, ZodType } from "zod";
import { requireUser, requireAdmin } from "@/lib/auth/guards";
import { rethrowIfNavigationError } from "./navigation-guard";
import { formatActionError } from "./error-handler";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "./action-result";

// ==========================================
// createPublicAction
// ==========================================

export function createPublicAction<
  TSchema extends ZodType,
  TOutput,
>(options: {
  schema: TSchema;
  handler: (input: z.output<TSchema>) => Promise<TOutput>;
}): (input: z.input<TSchema>) => Promise<ActionResult<TOutput>>;

export function createPublicAction<TOutput>(options: {
  handler: () => Promise<TOutput>;
}): () => Promise<ActionResult<TOutput>>;

export function createPublicAction<TInput, TOutput>(options: {
  schema?: ZodType<unknown, TInput>;
  handler: (input: TInput) => Promise<TOutput>;
}) {
  return async (input?: TInput): Promise<ActionResult<TOutput>> => {
    try {
      let validatedInput = input as TInput;
      if (options.schema) {
        const parsed = options.schema.safeParse(input);
        if (!parsed.success) {
          return actionError(formatActionError(parsed.error));
        }
        validatedInput = parsed.data as TInput;
      }
      const result = await options.handler(validatedInput);
      return actionSuccess(result);
    } catch (error) {
      rethrowIfNavigationError(error);
      const cid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "action-error";
      return actionError(formatActionError(error, cid));
    }
  };
}

// ==========================================
// createAuthAction
// ==========================================

export function createAuthAction<
  TSchema extends ZodType,
  TOutput,
>(options: {
  schema: TSchema;
  handler: (input: z.output<TSchema>, ctx: { userId: string }) => Promise<TOutput>;
}): (input: z.input<TSchema>) => Promise<ActionResult<TOutput>>;

export function createAuthAction<TOutput>(options: {
  handler: (input: void, ctx: { userId: string }) => Promise<TOutput>;
}): () => Promise<ActionResult<TOutput>>;

export function createAuthAction<TInput, TOutput>(options: {
  schema?: ZodType<unknown, TInput>;
  handler: (input: TInput, ctx: { userId: string }) => Promise<TOutput>;
}) {
  return async (input?: TInput): Promise<ActionResult<TOutput>> => {
    try {
      const userId = await requireUser();
      let validatedInput = input as TInput;
      if (options.schema) {
        const parsed = options.schema.safeParse(input);
        if (!parsed.success) {
          return actionError(formatActionError(parsed.error));
        }
        validatedInput = parsed.data as TInput;
      }
      const result = await options.handler(validatedInput, { userId });
      return actionSuccess(result);
    } catch (error) {
      rethrowIfNavigationError(error);
      const cid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "action-error";
      return actionError(formatActionError(error, cid));
    }
  };
}

// ==========================================
// createAdminAction
// ==========================================

export function createAdminAction<
  TSchema extends ZodType,
  TOutput,
>(options: {
  schema: TSchema;
  handler: (input: z.output<TSchema>, ctx: { userId: string }) => Promise<TOutput>;
}): (input: z.input<TSchema>) => Promise<ActionResult<TOutput>>;

export function createAdminAction<TOutput>(options: {
  handler: (input: void, ctx: { userId: string }) => Promise<TOutput>;
}): () => Promise<ActionResult<TOutput>>;

export function createAdminAction<TInput, TOutput>(options: {
  schema?: ZodType<unknown, TInput>;
  handler: (input: TInput, ctx: { userId: string }) => Promise<TOutput>;
}) {
  return async (input?: TInput): Promise<ActionResult<TOutput>> => {
    try {
      const userId = await requireAdmin();
      let validatedInput = input as TInput;
      if (options.schema) {
        const parsed = options.schema.safeParse(input);
        if (!parsed.success) {
          return actionError(formatActionError(parsed.error));
        }
        validatedInput = parsed.data as TInput;
      }
      const result = await options.handler(validatedInput, { userId });
      return actionSuccess(result);
    } catch (error) {
      rethrowIfNavigationError(error);
      const cid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "action-error";
      return actionError(formatActionError(error, cid));
    }
  };
}
