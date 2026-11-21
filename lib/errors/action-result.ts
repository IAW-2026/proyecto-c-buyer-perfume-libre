export type ActionErrorPayload = {
  code: string;
  message: string;
  statusCode: number;
  fields?: Record<string, string[]>;
};

export type ActionResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; error: ActionErrorPayload; data?: never };

export function actionSuccess<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function actionError(error: ActionErrorPayload): ActionResult<never> {
  return { success: false, error };
}
