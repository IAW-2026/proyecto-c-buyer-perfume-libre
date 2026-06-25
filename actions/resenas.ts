"use server";

import { auth } from "@clerk/nextjs/server";

export async function enviarResenaProductoReal(
  productoId: string,
  ordenId: string,
  rating: number,
  comentario?: string,
  imagenes?: string[],
) {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    throw new Error("Debes iniciar sesión para dejar una reseña.");
  }

  const feedbackBaseUrl =
    process.env.FEEDBACK_API_URL ||
    "https://proyecto-c-feedback2-perfume-libre.vercel.app/api";

  const bodyData = {
    id_producto: productoId,
    id_orden: ordenId,
    puntuacion: rating,
    comentario: comentario || "",
    imagenes: imagenes || [],
  };

  const response = await fetch(`${feedbackBaseUrl}/resenas/producto`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bodyData),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Error de Feedback App (Producto):", result);
    throw new Error(
      result.mensaje || "Ocurrió un error al enviar la reseña del producto.",
    );
  }

  return result;
}

export async function enviarResenaVendedorReal(
  vendedorId: string,
  ordenId: string,
  rating: number,
  comentario?: string,
) {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    throw new Error("Debes iniciar sesión para valorar a un vendedor.");
  }

  const feedbackBaseUrl =
    process.env.FEEDBACK_API_URL ||
    "https://proyecto-c-feedback2-perfume-libre.vercel.app/api";

  const bodyData = {
    id_vendedor: vendedorId,
    id_orden: ordenId,
    puntuacion: rating,
    comentario: comentario || "",
  };

  const response = await fetch(`${feedbackBaseUrl}/resenas/vendedor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bodyData),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Error de Feedback App (Vendedor):", result);
    throw new Error(
      result.mensaje || "Ocurrió un error al calificar al vendedor.",
    );
  }

  return result;
}
