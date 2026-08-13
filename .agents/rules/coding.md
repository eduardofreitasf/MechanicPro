---
trigger: always_on
glob: "**/*"
description: Coding guidelines, technical standards, and quality practices for MechanicPro
---

# MechanicPro Coding Rules

## 1. Project Components & Boundaries
- **App Directory (`app/`)**: Tauri v2 desktop application. Includes React 19 UI, Vite build config, Zustand state management, and Tauri Rust core.
- **Website Directory (`website/`)**: Static landing page built with React + Vite.
- **Docs Directory (`docs/`)**: Technical report and user manuals written in LaTeX. Modify `.tex` files only; do not edit precompiled PDFs directly.

## 2. Coding Guidelines & Practices
- **Decoupled Logic & Services**: Components in `src/pages` or `src/components` must delegate database actions and business rules to the services layer (`src/services/`). Components should only call stores or services.
- **State Management**: React app state should be managed using Zustand stores (`useClientStore`, `useVehicleStore`, etc.). Stores handle loading states, errors, and invoke service functions.
- **Styling Discipline**: Do not use utility frameworks like Tailwind CSS unless explicitly requested. Use pure Vanilla CSS with custom CSS variables (established in `index.css` and component-level CSS files). Maintain the dark theme with neon blue (`#0ea5e9`) and amber (`#f59e0b`) accents.
- **Database Operations**: Perform SQLite queries using the Tauri SQL plugin. Avoid hardcoded SQL strings inside components; group database commands in the services layer.
- **Type Safety**: Strictly avoid `any` types in TypeScript. Use interfaces defined in `db.ts` or specific type configurations.

## 3. Function & Code Quality Standards
- **Function Complexity**: Keep functions small and focused (preferably under ~40 lines). Extract complex operations to utilities.
- **Early Returns**: Limit nesting and deep indentations (aim for a maximum of 2 levels) by returning early upon finding error or invalid states.
- **No Dangling Code**: Remove debug console logs, temporary prints, and resolve TODO comments before committing code or finishing a task.
- **Uniform Error Handling**: Wrap database transactions or async actions in `try/catch` blocks and expose friendly error messages to UI components.
