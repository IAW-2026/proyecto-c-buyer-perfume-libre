export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly isOperational: boolean;

  constructor(
    message: string,
    code = "INTERNAL_SERVER_ERROR",
    statusCode = 500,
    isOperational = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Debes iniciar sesión para realizar esta acción") {
    super(message, "UNAUTHORIZED", 401, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "No tienes permisos suficientes para realizar esta acción") {
    super(message, "FORBIDDEN", 403, true);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Recurso", id?: string) {
    const message = id ? `${resource} con ID '${id}' no encontrado` : `${resource} no encontrado`;
    super(message, "NOT_FOUND", 404, true);
  }
}

export class ValidationError extends AppError {
  readonly fields?: Record<string, string[]>;

  constructor(
    message = "Los datos enviados son inválidos",
    fields?: Record<string, string[]>,
  ) {
    super(message, "VALIDATION_ERROR", 400, true);
    this.fields = fields;
  }
}

export class ConflictError extends AppError {
  constructor(message = "El recurso ya existe o genera un conflicto") {
    super(message, "CONFLICT", 409, true);
  }
}

export class ExternalServiceError extends AppError {
  readonly serviceName: string;

  constructor(serviceName: string, message?: string) {
    super(
      message || `Error al comunicarse con el servicio externo '${serviceName}'`,
      "EXTERNAL_SERVICE_ERROR",
      503,
      true,
    );
    this.serviceName = serviceName;
  }
}
