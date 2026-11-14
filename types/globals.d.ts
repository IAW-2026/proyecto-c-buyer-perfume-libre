export {};

export type Rol = "ADMIN" | "USER";

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      rol?: Rol;
    };
  }

  interface UserPublicMetadata {
    rol?: Rol;
  }
}
