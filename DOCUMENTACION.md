[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/8-wwxMvS)

# buyer

Aplicación **Buyer** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — comisión `Perfume libre`.

## Responsabilidades principales:

**Exploración:** Interfaz para buscar y filtrar el catálogo de perfumes (consumiendo la API de la Seller App).

**Conversión:** Gestión del carrito de compras y proceso de checkout seguro.

**Gestión post-venta:** Visualización del historial de órdenes y estado de envíos.

**Perfil:** Gestión de direcciones de envío del comprador.

## Instalación de la app

correr `npm install` para instalar las dependencias

## Scripts Principales

- `npm run dev`: Inicia el servidor de desarrollo en `http://localhost:3000`.
- `npm run build`: Compila la aplicación para producción.
- `npm test`: Ejecuta la suite de pruebas unitarias de manejo de errores y Safe Actions.
- `npm run seed`: Ejecuta el pipeline completo de sembrado (usuarios, direcciones, órdenes, carritos, favoritos, reseñas y resúmenes IA).
- `npm run seed:resenas`: Ejecuta únicamente el sembrado de reseñas de productos y vendedores y genera los resúmenes de IA.
- `npm run seed:reset`: Limpia de forma segura los datos de prueba en la base de datos respetando las restricciones referenciales.

## Estructura del Proyecto

Se utiliza una arquitectura limpia basada en **Next.js App Router** con separación estricta de responsabilidades:

```text
/proyecto-c-buyer-perfume-libre
  /actions      --> Server Actions protegidas con wrappers seguros (safe-action.ts)
  /app          --> Rutas, páginas y API Route Handlers (App Router)
    /api        --> Endpoints REST (cron de resúmenes, roles, webhooks)
  /components   --> Componentes de React modulares (UI, home, producto, compras, etc.)
    /ui         --> Componentes base de shadcn/ui
  /lib          --> Lógica de dominio, utilidades y clientes singleton (Prisma, API)
    /errors     --> Manejador centralizado de errores tipados, Correlation ID y tests
  /prisma       --> Esquema relacional de PostgreSQL, migraciones y seeds
    /seeds      --> Pipeline secuencial de datos de prueba y corpus rioplatense
  /schema       --> Esquemas y contratos de validación de datos con Zod
  /doc          --> Documentación técnica y especificaciones arquitectónicas
```

## Stack Tecnológico

- **Framework:** Next.js 16.2.4 (App Router, Turbopack, React 19)
- **Base de Datos:** PostgreSQL en la nube (Neon Serverless) con **Prisma ORM** y adaptador `@prisma/adapter-neon`
- **Inteligencia Artificial:** **Groq** (`openai/gpt-oss-120b`) a través de **Vercel AI SDK**
- **Autenticación & Roles:** **Clerk**
- **Pasarela de Pagos:** **Mercado Pago Checkout Bricks** (Modo Sandbox)
- **UI & Estilos:** Tailwind CSS + **shadcn/ui** + Lucide React
- **Validación de Esquemas:** Zod
- **Testing:** Node Test Runner nativo con ejecución mediante Jiti

## Flujo de Desarrollo (Git Flow)

Para garantizar un historial de versiones limpio y profesional, el proyecto sigue la metodología **Git Flow**:

- **`main`**: Rama de producción (solo código estable).
- **`develop`**: Rama de integración donde se consolidan las nuevas funcionalidades.
- **`feature/*`**: Ramas temporales para el desarrollo de nuevas características.
- **`release/*`**: Preparación de un nuevo release (correcciones menores antes de pushear a main)
- **`hotfix/*`**: Fix urgente en produccion.

### Política de Commits (Conventional Commits)

Para mantener la claridad y trazabilidad en el historial de versiones, este proyecto utiliza el estándar de **Conventional Commits**. Cada mensaje de commit debe estructurarse con uno de los siguientes prefijos para indicar su propósito:

- **`feat:`** Nueva funcionalidad en la aplicación.
- **`fix:`** Corrección de un error o bug.
- **`chore:`** Tareas de mantenimiento, configuración o actualización de dependencias.
- **`docs:`** Creación o actualización de documentación (README, diagramas, etc.).
- **`refactor:`** Reestructuración del código que no altera su comportamiento funcional.
- **`test:`** Adición o corrección de pruebas automatizadas.
- **`style:`** Cambios de formato (identación, comillas, etc.) que no afectan la lógica.

### Estrategia de Integración

Para preservar la trazabilidad y el historial visual del desarrollo, todas las integraciones locales de ramas temporales (`feature/*`, `fix/*`) hacia la rama `develop` deben forzar la creación de un commit de fusión explícito.

Se debe utilizar siempre el flag `--no-ff` (No Fast-Forward) para evitar que el historial se aplane:

```bash
git merge --no-ff feature/nombre-de-la-rama
```

### Decisiones de Arquitectura: Sincronización de Usuarios

Para sincronizar los usuarios de Clerk con nuestra db, optamos por un observer del lado del cliente en lugar de Webhooks para facilitar el desarollo de la aplicacion y no tener que configurar tuneles para comunicarnos con clerk

### Modificar Rol de Usuario (Backdoor)

Asegúrese de haber **iniciado sesión previamente** en la aplicación. Luego, simplemente navegue a las siguientes rutas:

- **Hacerse Administrador (Acceso al Panel de Control):**
  `/api/roles/actualizar?secret=IAW&rol=ADMIN`
- **Volver a ser un Usuario Normal:**
  `/api/roles/actualizar?secret=IAW&rol=USER`

Al visitar estos enlaces, el sistema actualizará los permisos de su cuenta en la base de datos y lo redirigirá automáticamente al Dashboard de Administración (en caso de ser `ADMIN`) o a la página principal (en caso de ser `USER`).

---

Enunciado completo: <https://iaw-2026.github.io/proyecto/>

Repositorio del proyecto: https://github.com/IAW-2026/proyecto-c-buyer-perfume-libre/
