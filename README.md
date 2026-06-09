# MechanicPro

A desktop management system for mechanic shops, built to streamline operations, manage clients, vehicles, and services effectively.

## 🚀 Features

- **Dashboard**: Overview of key statistics, with quick actions to create clients and vehicles.
- **Client & Vehicle Management**: Easily add, edit, and keep track of clients and their respective vehicles.
- **Service Orders**: Create, track, and re-order service orders. Includes history checking.
- **Data Export & Import**: Seamlessly export and import data using CSV format for backups and external reporting.
- **Document Generation**: Download service details and invoices directly from the application.

## 🛠️ Technology Stack

This application is built with modern web and desktop technologies:

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Desktop Environment**: [Tauri v2](https://tauri.app/)
- **Database**: Tauri SQL Plugin for local storage

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust](https://www.rust-lang.org/tools/install) (required for Tauri)
- Cargo and necessary system dependencies for Tauri (check the [Tauri prerequisites guide](https://tauri.app/v1/guides/getting-started/prerequisites)).

## 💻 Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/eduardofreitasf/MechanicPro.git
   cd MechanicPro
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run in development mode:**

   ```bash
   npm run tauri dev
   ```

   This will start the Vite dev server and open the Tauri desktop window.

4. **Build for production:**
   ```bash
   npm run tauri build
   ```
   The compiled binaries will be available in `src-tauri/target/release`.

## 📝 Changelog

Check the [CHANGELOG.md](./CHANGELOG.md) to see the history of changes and new feature releases.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the issues page.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
