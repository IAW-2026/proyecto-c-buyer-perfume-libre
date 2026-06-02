"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { sincronizarUsuario } from "@/actions/usuario";

export function UsuarioSync() {
  const { isSignedIn, isLoaded } = useAuth();
  const usuarioSincronizado = useRef(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && !usuarioSincronizado.current) {
      sincronizarUsuario()
        .then(() => {
          usuarioSincronizado.current = true;
          console.log("Usuario sincronizado correctamente");
        })
        .catch(console.error);
    }
  }, [isLoaded, isSignedIn]);

  return null;
}
