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

### 📚 Documentación Técnica Adicional

Para revisar detalles avanzados sobre la arquitectura de carpetas, configuraciones locales de instalación, políticas de Git Flow y convenciones de commits, consulte el siguiente archivo:
👉 **[Ver Documentación Técnica y Stack Tecnológico](./DOCUMENTACION.md)**

---

_Enunciado completo: <https://iaw-2026.github.io/proyecto/>_
