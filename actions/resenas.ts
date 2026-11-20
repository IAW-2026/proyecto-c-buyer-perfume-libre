"use server";

import { auth } from "@clerk/nextjs/server";
import { feedbackClient } from "@/lib/integrations/feedback-client";

export async function enviarResenaProductoReal(
  productoId: string,
  ordenId: string,
  rating: number,
  comentario?: string,
  imagenes?: string[],
) {
  const { userId, getToken } = await auth();
  const token = await getToken();

  if (!token) {
    throw new Error("Debes iniciar sesión para dejar una reseña.");
  }

  return feedbackClient.crearResenaProducto(
    {
      id_producto: productoId,
      id_orden: ordenId,
      id_usuario: userId ?? undefined,
      puntuacion: rating,
      comentario: comentario || "",
      imagenes: imagenes || [],
    },
    token,
  );
}

export async function enviarResenaVendedorReal(
  vendedorId: string,
  ordenId: string,
  rating: number,
  comentario?: string,
) {
  const { getToken, userId } = await auth();
  const token = await getToken();

  if (!token) {
    throw new Error("Debes iniciar sesión para valorar a un vendedor.");
  }

  return feedbackClient.crearResenaVendedor(
    {
      id_vendedor: vendedorId,
      id_orden: ordenId,
      id_usuario: userId ?? undefined,
      puntuacion: rating,
      comentario: comentario || "",
    },
    token,
  );
}
