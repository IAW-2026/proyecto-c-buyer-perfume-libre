"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";

export function useOptimisticAuth(
  initialSignedIn: boolean,
  initialAdmin: boolean,
) {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [isSigningOut, setIsSigningOut] = useState(false);

  // Ajustar estado durante render si ya no está firmado (patrón recomendado de React)
  if (!isSignedIn && isSigningOut) {
    setIsSigningOut(false);
  }

  // Interceptar el click directo en "Cerrar sesión" en la fase de captura del DOM
  // para que foto y botones desaparezcan exactamente en el mismo instante
  useEffect(() => {
    const handleCaptureClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const button = target.closest(
        "button, [role='menuitem'], [role='button'], a",
      );
      if (!button) return;
      const text = button.textContent?.toLowerCase() || "";
      const className = button.className?.toString() || "";
      if (
        text.includes("cerrar sesión") ||
        text.includes("sign out") ||
        text.includes("log out") ||
        className.includes("signOut") ||
        button.getAttribute("data-localization-key") ===
          "userButton.action__signOut"
      ) {
        setIsSigningOut(true);
      }
    };

    window.addEventListener("click", handleCaptureClick, true);
    return () => {
      window.removeEventListener("click", handleCaptureClick, true);
    };
  }, []);

  // Si se está cerrando sesión, la UI conmuta de inmediato a false (desaparecen juntos foto y botones)
  const effectiveSigningOut = isSignedIn ? isSigningOut : false;
  const signedIn =
    !effectiveSigningOut &&
    (isAuthLoaded ? (isSignedIn ?? false) : initialSignedIn);

  const esAdmin = isUserLoaded
    ? user?.publicMetadata?.rol === "ADMIN"
    : initialSignedIn
      ? initialAdmin
      : undefined;

  // Refrescar el servidor en segundo plano sin congelar la UI
  const prevSignedIn = useRef(signedIn);

  useEffect(() => {
    if (isAuthLoaded && prevSignedIn.current !== signedIn) {
      prevSignedIn.current = signedIn;
      startTransition(() => {
        router.refresh();
      });
    }
  }, [isAuthLoaded, signedIn, router]);

  return {
    signedIn,
    esAdmin,
  };
}
