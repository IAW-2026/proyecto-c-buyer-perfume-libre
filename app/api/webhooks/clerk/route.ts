import { Webhook } from "svix";
import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { RolUsuario } from "@/lib/generated/prisma/enums";

export async function POST(req: Request) {
  const SIGNING_SECRET =
    process.env.SIGNING_SECRET || process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    console.error("Error: SIGNING_SECRET o CLERK_WEBHOOK_SECRET no está configurado.");
    return new Response("Error: Webhook secret no configurado", {
      status: 500,
    });
  }

  // Obtener los encabezados de Svix para validación criptográfica
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Faltan encabezados de Svix", {
      status: 400,
    });
  }

  // Obtener el payload crudo
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(SIGNING_SECRET);
  let evt: {
    type: string;
    data: {
      id: string;
      public_metadata?: {
        rol?: string;
      };
    };
  };

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as unknown as typeof evt;
  } catch (err) {
    console.error("Error al verificar webhook de Clerk:", err);
    return new Response("Error: Verificación fallida", {
      status: 400,
    });
  }

  const eventType = evt.type;

  try {
    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, public_metadata } = evt.data;
      const rol: RolUsuario =
        public_metadata?.rol === "ADMIN" ? RolUsuario.ADMIN : RolUsuario.USER;

      await prisma.usuario.upsert({
        where: { id },
        update: { rol },
        create: {
          id,
          rol,
        },
      });

      // Si es un nuevo usuario y no tiene rol asignado en publicMetadata, asignarle USER
      if (eventType === "user.created" && !public_metadata?.rol) {
        try {
          const client = await clerkClient();
          await client.users.updateUserMetadata(id, {
            publicMetadata: {
              rol: "USER",
            },
          });
        } catch (error) {
          console.error("Error al asignar metadata por defecto en Clerk:", error);
        }
      }
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data;
      if (id) {
        await prisma.usuario
          .delete({
            where: { id },
          })
          .catch(() => null);
      }
    }

    return new Response("Webhook procesado exitosamente", { status: 200 });
  } catch (error) {
    console.error("Error procesando evento de webhook:", error);
    return new Response("Error interno al procesar webhook", { status: 500 });
  }
}
