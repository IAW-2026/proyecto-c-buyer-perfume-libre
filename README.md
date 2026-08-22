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
3. **Flujo de Gestión (Admin):** Al iniciar sesión como administrador, aparecerá el botón "Admin" en el Header. Desde allí podrá acceder al Panel de Control para visualizar las métricas clave (ganancias, órdenes, usuarios) y la evolución gráfica de las ventas de la tienda.
4. **Modificación de Roles Dinámica (Backdoor):** Si ya inició sesión con cualquier cuenta y desea alterar su rol manualmente, visite:
   - Hacerse Administrador: `/api/roles/actualizar?secret=IAW&rol=ADMIN`
   - Volver a ser Usuario Normal: `/api/roles/actualizar?secret=IAW&rol=USER`
5. **Sembrado de datos**
   para simular datos de pruebas se utiliza el siguiente script:
   `npx prisma db seed`
   si se quiere especificar la cantidad de usuarios y/o ordenes a crear utilizar el siguiente comando:
   `npx prisma db seed -- --usuarios=x --ordenes=y`

---

## 4. Descripción del Proyecto

El objetivo principal de la **Buyer App** es brindar una experiencia fluida, rápida y segura de exploración, selección y compra de fragancias para los usuarios finales dentro del ecosistema de _Perfume Libre_.

La interfaz se encarga de centralizar de manera eficiente la conversión del negocio mediante una robusta gestión de carritos de compras, cálculo dinámico de costos de envío y procesamiento controlado de estados de pago.

Asimismo, el sistema incluye módulos dedicados a la experiencia posventa, permitiendo el seguimiento histórico de las órdenes de compra y la administración simplificada de múltiples direcciones físicas de entrega asociadas a cada comprador.

---

## 5. Notas y Comentarios para la Corrección

- **Datos Precargados:** La base de datos cuenta con un set completo de datos iniciales que incluye múltiples marcas (`Dior`, `Chanel`, `Versace`, etc.), variedad de tamaños de envases y precios realistas.
- **Sincronización de Usuarios:** Para sincronizar las cuentas de Clerk con nuestra base de datos, optamos por implementar un observador optimizado del lado del cliente. Esto simplifica la arquitectura local evitando la necesidad de configurar túneles (como Ngrok) para Webhooks tradicionales durante la etapa de desarrollo.
- **Alcance de la Interfaz Visual (UI):** Para esta instancia de entrega (Etapa 2), el foco del desarrollo estuvo direccionado rigurosamente hacia la solidez de la arquitectura, el modelado de la base de datos, la sincronización de estados y la lógica del negocio (checkout y roles). Los componentes visuales se estructuraron de manera funcional utilizando los componentes base de Shadcn, priorizando la usabilidad y la correcta visualización de datos por sobre el refinamiento estético o animaciones complejas de UI.
- **Implementación de Componentes Optimistas (Optimistic Updates):** Con el objetivo de maximizar la fluidez de la experiencia de usuario (UX), se implementó el hook `useOptimistic` de React en interacciones clave de la interfaz, como la gestión del carrito y la selección de favoritos. El sistema asume que la operación en el servidor será exitosa para actualizar la interfaz en microsegundos, revirtiendo el estado de forma automática únicamente si la Server Action llega a fallar.
- **Seguridad en Server Components:** El panel de administración y las Server Actions críticas comprueban la identidad y rol del usuario de forma directa en el servidor usando Clerk `auth()`. Si un usuario común intenta acceder a las vistas administrativas, el flujo intercepta la petición y lo redirige de inmediato.

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
