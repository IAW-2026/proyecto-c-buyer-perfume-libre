"use client";

import { useSyncExternalStore, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";

// --- STORE GLOBAL COMPARTIDO (Singleton en memoria + sincronizado con sessionStorage) ---
let isSignedOutGlobally =
  typeof window !== "undefined"
    ? sessionStorage.getItem("clerk_signed_out") === "true"
    : false;

const listeners = new Set<() => void>();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

export function setGlobalSignedOut(value: boolean) {
  if (isSignedOutGlobally === value) return;
  isSignedOutGlobally = value;
  if (typeof window !== "undefined") {
    if (value) {
      sessionStorage.setItem("clerk_signed_out", "true");
    } else {
      sessionStorage.removeItem("clerk_signed_out");
    }
  }
  notifyListeners();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot() {
  return isSignedOutGlobally;
}

function getServerSnapshot() {
  return false;
}

// Handler global único a nivel de ventana para capturar el clic de cierre de sesión
let isWindowListenerAttached = false;
let globalClerkInstance: ReturnType<typeof useClerk> | null = null;
let globalRouterInstance: ReturnType<typeof useRouter> | null = null;

function setupGlobalWindowListener(
  clerk: ReturnType<typeof useClerk>,
  router: ReturnType<typeof useRouter>,
) {
  globalClerkInstance = clerk;
  globalRouterInstance = router;

  if (isWindowListenerAttached || typeof window === "undefined") return;
  isWindowListenerAttached = true;

  window.addEventListener("click", (e: MouseEvent) => {
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
      // 1. Conmutar el estado instantáneamente en toda la aplicación (0 ms)
      setGlobalSignedOut(true);

      // 2. Invocar signOut() de Clerk de forma segura
      if (
        globalClerkInstance &&
        typeof globalClerkInstance.signOut === "function"
      ) {
        globalClerkInstance
          .signOut()
          .then(() => {
            if (globalRouterInstance) {
              globalRouterInstance.refresh();
            }
          })
          .catch(() => {});
      }
    }
  });
}

export function useOptimisticAuth(
  initialSignedIn: boolean,
  initialAdmin: boolean,
) {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const clerk = useClerk();
  const router = useRouter();

  // Suscripción al estado de cierre de sesión global
  const hasSignedOut = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Registrar el listener global único
  useEffect(() => {
    setupGlobalWindowListener(clerk, router);
  }, [clerk, router]);

  // Si Clerk confirma inicio de sesión activo, reseteamos el bloqueo de sign out
  const prevSignedIn = useRef(isSignedIn);
  useEffect(() => {
    if (isAuthLoaded) {
      if (!prevSignedIn.current && isSignedIn) {
        setGlobalSignedOut(false);
      }
      prevSignedIn.current = isSignedIn;
    }
  }, [isAuthLoaded, isSignedIn]);

  // signedIn es estrictamente false si hasSignedOut es true
  // Esto previene al 100% que datos cacheados del servidor o retardos de Clerk vuelvan a pintar los botones
  const signedIn =
    !hasSignedOut && (isAuthLoaded ? (isSignedIn ?? false) : initialSignedIn);

  const esAdmin = isUserLoaded
    ? user?.publicMetadata?.rol === "ADMIN"
    : initialSignedIn
      ? initialAdmin
      : undefined;

  return {
    signedIn,
    esAdmin,
    user,
  };
}
