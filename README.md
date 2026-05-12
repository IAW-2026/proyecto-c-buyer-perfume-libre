[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/8-wwxMvS)

# buyer

Aplicación **Buyer** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — comisión `Perfume libre`.

## Descripción del Proyecto

El objetivo de la **Buyer App** es brindar una experiencia fluida de exploración, selección y compra de fragancias a los usuarios.

## Responsabilidades principales:

**Exploración:** Interfaz para buscar y filtrar el catálogo de perfumes (consumiendo la API de la Seller App).

**Conversión:** Gestión del carrito de compras y proceso de checkout seguro.

**Gestión post-venta:** Visualización del historial de órdenes y estado de envíos.

**Perfil:** Gestión de direcciones de envío del comprador.

## Instalación de la app

correr `npm install` para instalar las dependencias

## Comando para ejecutar la aplicación

En la terminal ejecutar`npm run dev`

En http://localhost:3000 se vera la app

## Estructura del Proyecto

Se utiliza una arquitectura basada en **Next.js App Router** con una organización de archivos orientada a la mantenibilidad y el testing:

```text
/proyecto-c-buyer-perfume-libre
  /app          --> Rutas y páginas (App Router)
  	/api 		--> Endpoints de las APIs REST
  /components   --> Componentes de React
    /ui         --> Componentes base de shadcn/ui
  /lib          --> Lógica compartida y utilidades
  /actions      --> Server actions
  /drizzle  	--> Capa de datos
  /schema		--> Validaciones con Zod
  /e2e          --> Pruebas de extremo a extremo (Playwright)

Nota: Se utiliza el patrón de colocation para tests unitarios (los archivos .test.ts residen junto a la lógica que prueban).
```

## Stack Tecnológico

- **Framework:** Next.js 16.2.4 (App Router)
- **Base de Datos:** PostgreSQL + **Prisma ORM**
- **UI & Estilos:** Tailwind CSS + **shadcn/ui**
- **Autenticación:** Clerk
- **Validación:** Zod
- **Validación:** Vercel

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

---

Enunciado completo: <https://iaw-2026.github.io/proyecto/>

Repositorio del proyecto: https://github.com/IAW-2026/proyecto-c-buyer-perfume-libre/
