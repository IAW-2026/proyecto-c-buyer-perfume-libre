[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/8-wwxMvS)

# Buyer App — Perfume Libre (Comisión C)

## 1. Link al Deploy de Producción

🚀 **URL del proyecto en producción:** [https://perfume-libre-buyer.vercel.app/]

---

## 2. Listado de Usuarios Disponibles para Pruebas

Para la evaluación del sistema, se crearon las siguientes cuentas de prueba de forma nativa en Clerk:

### 👤 Perfil Comprador (Buyer)

- **Email:** `buyer+clerk_test@iaw.com`
- **Contraseña:** `iawuser#`

### ⚙️ Perfil Administrador (Admin)

- **Email:** `admin+clerk_test@iaw.com`
- **Contraseña:** `iawuser#`

---

## 3. Instrucciones para Evaluar la Aplicación

1. **Iniciar Sesión:** Haga clic en el botón "Ingresar" del Header y utilice las credenciales provistas arriba según el caso de uso que desee testear.
2. **Flujo de Compra (Buyer):** Explore el catálogo de perfumes, aplique filtros por marcas o precios, agregue productos al carrito, gestione sus direcciones de envío en su perfil y complete la pasarela de checkout para generar una orden de compra.
3. **Flujo de Reseñas Verificadas y Resumen de IA:** Una vez que una orden es entregada, el comprador puede calificar tanto el producto como la atención del vendedor desde el detalle de su compra (`/compras/[id]`). En la página de producto (`/producto/[id]`), podrá ver las calificaciones calculadas en tiempo real desde la base de datos y la tarjeta dorada de **Resumen con Inteligencia Artificial**, sintetizando las opiniones de la comunidad sin demoras en el render.
4. **Flujo de Gestión (Admin):** Al iniciar sesión como administrador, aparecerá el botón "Admin" en el Header. Desde allí podrá acceder al Panel de Control para visualizar las métricas clave (ganancias, órdenes, usuarios) y la evolución gráfica de las ventas de la tienda.
5. **Modificación de Roles Dinámica (Backdoor):** Si ya inició sesión con cualquier cuenta y desea alterar su rol manualmente, visite:
   - Hacerse Administrador: `/api/roles/actualizar?secret=IAW&rol=ADMIN`
   - Volver a ser Usuario Normal: `/api/roles/actualizar?secret=IAW&rol=USER`
6. **Pipeline de Sembrado de Datos (Seeds):**
   Para poblar la base de datos con un conjunto representativo y realista (1.200 usuarios, órdenes estacionales, direcciones, favoritos, carritos, más de 800 reseñas y resúmenes de IA):
   - Ejecutar el pipeline completo: `npm run seed`
   - Ejecutar únicamente el sembrado de reseñas e IA: `npm run seed:resenas`
   - Scripts individuales: `npm run seed:reset`, `npm run seed:usuarios`, `npm run seed:direcciones`, `npm run seed:ordenes`, `npm run seed:carritos`
7. **Pruebas Automatizadas:**
   - Ejecutar suite de pruebas unitarias: `npm test`

---

## 4. Descripción del Proyecto

El objetivo principal de la **Buyer App** es brindar una experiencia integral, fluida y transparente dentro del marketplace C2C de _Perfume Libre_.

La aplicación cubre el ciclo de vida completo del comprador:
- **Exploración y Decisión:** Catálogo completo de fragancias enriquecido con calificaciones dinámicas calculadas desde la base de datos y **resúmenes de opiniones generados por Inteligencia Artificial** para reducir la fatiga de decisión.
- **Conversión y Checkout:** Gestión reactiva del carrito de compras y favoritos con actualizaciones optimistas, cálculo logístico según el destino y pasarela de pago segura con Mercado Pago Checkout Bricks.
- **Experiencia Posventa y Comunidad:** Trazabilidad de estados de envío y un sistema de **reseñas verificadas**, donde los compradores califican la autenticidad y características del perfume y el servicio del vendedor únicamente tras la entrega de su orden.

---

## 5. Notas y Comentarios para la Corrección

- **Arquitectura de Server Actions Seguras (`createSafeAction`):** Todas las mutaciones del servidor están protegidas por wrappers de orden superior (`createSafeAction`, `createAuthAction`, `createAdminAction`). Esta capa centraliza:
  - Validación de entradas con esquemas Zod (`safeParse`).
  - Inyección estricta del contexto de autenticación y autorización (`userId`, rol `ADMIN`).
  - Normalización de errores de dominio tipados (`NotFoundError`, `ValidationError`, `ForbiddenError`, `ConflictError`).
  - Sanitización de errores 500 para el cliente y registro estructurado en el servidor con Correlation ID.
  - Propagación transparente de errores nativos de navegación de Next.js (`redirect()` y `notFound()`).
- **Sistema de Reseñas Verificadas (C2C):**
  - Las opiniones (`ResenaProducto` y `ResenaVendedor`) están estrictamente restringidas a órdenes en estado `ENTREGADO`.
  - Integridad garantizada mediante restricciones compuestas `@@unique([usuarioId, ordenCompraId, productoId])` y `@@unique([usuarioId, ordenCompraId, vendedorId])` que previenen valoraciones duplicadas o fraudulentas.
  - Las calificaciones mostradas en el catálogo y fichas de producto se calculan de manera agregada (`_avg`, `_count`) directamente en PostgreSQL, mostrando el estado vacío transparente ("Sin calificaciones") si un producto aún no fue valorado.
- **Procesamiento de IA Desacoplado y Reactivo (Groq):**
  - **Latencia cero en SSR:** La función `obtenerResumenYResenas` en la página de producto es de solo lectura contra la base de datos, eliminando por completo los bloqueos de 3 a 6 segundos causados por llamadas sincrónicas a LLMs.
  - **Generación en segundo plano:** La inferencia con Groq (`openai/gpt-oss-120b`) se ejecuta de manera asíncrona ("fire-and-forget") únicamente cuando se acumulan **5 reseñas nuevas** desde el último resumen procesado.
  - **Protección Thundering Herd:** El sistema incluye deduplicación en memoria para que múltiples visitas concurrentes a un mismo perfume no disparen llamadas redundantes a la API de IA.
  - **Mantenimiento programado:** Cuenta con un endpoint Route Handler protegido (`/api/cron/resumenes`) para procesar resúmenes pendientes mediante tareas programadas (Cron).
- **Sembrado de Datos Realista y Corpus Rioplatense:**
  - Se incorporó un dataset validado (`resenas-textos.json`) con comentarios contextualizados para los 32 perfumes del catálogo (mencionando sus notas reales, duración y proyección), opiniones genéricas y feedback de vendedores en español rioplatense.
  - Aplica una curva de distribución de estrellas auténtica de e-commerce (65% 5★, 20% 4★, 8% 3★, etc.), 20% de calificaciones sin texto escrito y fechas coherentes posteriores a la entrega de la orden.
  - Precomputa los resúmenes de IA para los 32 perfumes, permitiendo evaluar la funcionalidad inmediatamente tras el clonado sin requerir una API Key activa de Groq.
- **Implementación de Componentes Optimistas (Optimistic Updates):** Con el objetivo de maximizar la fluidez de la experiencia de usuario (UX), se implementó el hook `useOptimistic` de React en interacciones clave de la interfaz, como la gestión del carrito y la selección de favoritos. El sistema asume que la operación en el servidor será exitosa para actualizar la interfaz en microsegundos, revirtiendo el estado de forma automática únicamente si la Server Action llega a fallar.
- **Seguridad en Server Components:** El panel de administración y las Server Actions críticas comprueban la identidad y rol del usuario de forma directa en el servidor usando Clerk `auth()`. Si un usuario común intenta acceder a las vistas administrativas, el flujo intercepta la petición y lo redirige de inmediato.
- **Sincronización de Usuarios:** Para sincronizar las cuentas de Clerk con nuestra base de datos, optamos por implementar un observador optimizado del lado del cliente. Esto simplifica la arquitectura local evitando la necesidad de configurar túneles (como Ngrok) para Webhooks tradicionales durante la etapa de desarrollo.

---

## 6. Pasarela de pagos

El sistema integra la pasarela de pagos **Mercado Pago Checkout Bricks** operando estrictamente en Modo Sandbox / Pruebas.

Para probar los distintos escenarios del flujo de pago (aprobación, rechazo, saldo en cuenta), utilice exclusivamente los siguientes datos provistos por Mercado Pago:

### 💳 Simular Pago con Tarjeta de Crédito/Débito

En el formulario del Checkout Brick, complete los campos con la siguiente información. El estado del pago (Aprobado o Rechazado) dependerá exclusivamente del Nombre del Titular que ingrese.

- **Número de Tarjeta:** `5031 7557 3453 0604` (Crédito) / `5287 3383 1025 3304` (Débito)
- **Vencimiento:** `11/30`
- **CVV:** `123`
- **DNI:** `12345678`

Para probar diferentes resultados de pago, complete el estado deseado en el nombre del titular de la tarjeta:

- ✅ Para simular un pago **APROBADO**: Ingrese `APRO`
- ❌ Para simular un pago **RECHAZADO**: Ingrese `OTHE` o `CALL`

> **Nota importante:** Para el campo de email del formulario, no utilizar el correo `test@testuser.com` porque la plataforma suele rebotarlo. Se recomienda usar el correo por defecto del template (ej. `ejemplo@gmail.com`) que procesa sin problemas.

### 📱 Simular Pago con Cuenta de Mercado Pago (Wallet)

Si desea probar la redirección y el pago utilizando saldo en cuenta, debe iniciar sesión en el popup de Mercado Pago utilizando esta cuenta de Comprador de prueba (Test User):

- **Usuario:** `TESTUSER8636519672451605384`
- **Contraseña:** `loFequAoQA`
- **Código de verificación (email):** `564498`

> **Nota:** El popup de login pide DNI, Email o Nro telefónico, pero ingresando el **Usuario** provisto arriba permite iniciar sesión. Se recomienda realizar esta prueba en **Modo Incógnito** para evitar conflictos de sesión con tu cuenta personal real de Mercado Pago.

### 🎫 Pagos en Efectivo (Rapipago / Pago Fácil)

Si se selecciona Rapipago o Pago Fácil, el sistema generará correctamente el ticket de pago y la orden quedará en estado `PENDIENTE`. Esta funcionalidad está en fase experimental; la orden quedará pendiente por 2 días y, de no detectarse el pago simulado, el Cron Job la eliminará automáticamente de la base de datos para liberar stock.

---

### 📚 Documentación Técnica Adicional

Para revisar detalles avanzados sobre la arquitectura de carpetas, configuraciones locales de instalación, políticas de Git Flow y convenciones de commits, consulte el siguiente archivo:
👉 **[Ver Documentación Técnica y Stack Tecnológico](./DOCUMENTACION.md)**

---

_Enunciado completo: <https://iaw-2026.github.io/proyecto/>_
