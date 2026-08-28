# To-Do List Application

An interactive, client-side To-Do List web application built with vanilla TypeScript and a state-driven architecture. Demonstrates unidirectional state flow, event delegation, DOM manipulation, and automatic `window.localStorage` persistence.

---

## ✨ Features

- **Full CRUD Operations**:
  - **Create**: Add tasks via input field, "Add" button, or by pressing `Enter`.
  - **Read**: Dynamic rendering from an in-memory `tasks` array (single source of truth).
  - **Update**: Checkbox completion toggling and inline text editing (double-click text or click ✏️ icon; `Enter` to save, `Escape` to cancel).
  - **Delete**: Individual task deletion via trash action button.
- **Data Persistence**: Automatic serialization to and hydration from `window.localStorage` with safe error-handling fallbacks.
- **Advanced Filtering & Search**:
  - Filter tabs: **All**, **Active**, and **Completed** with real-time counter badges.
  - Real-time keyword search across task descriptions.
  - Filtering operates non-destructively without mutating the underlying tasks array.
- **Batch Actions & Progress Tracking**:
  - Dynamic items-left counter (`X items left`).
  - "Clear completed" and "Toggle all" batch operations.
  - Interactive percentage-based progress bar.
- **Event Delegation**: Single event listener attached to the parent list container for click, double-click, and keyboard actions.
- **Keyboard Shortcuts**:
  - Press `/` from anywhere on the page to quickly focus the task input.
  - Press `Enter` to save inline edits; `Escape` to cancel.

---

## 🛠️ Tech Stack

- **TypeScript / Vanilla JavaScript**: Type-safe logic and state management.
- **Tailwind CSS v4**: Modern, responsive dark-mode UI.
- **Vite**: Rapid development environment and static asset bundler.
- **GitHub Actions**: Automated CI/CD pipeline for GitHub Pages deployment.

---

## 📁 Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions workflow for GitHub Pages
├── src/
│   ├── index.css           # Global Tailwind CSS stylesheet
│   └── main.ts             # State management, event delegation & DOM rendering
├── index.html              # Main HTML markup & semantic structure
├── package.json            # Scripts & project dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build and relative base configuration
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Installation & Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

### Building for Production

To create an optimized production build in the `dist/` directory:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 🌐 Deployment (GitHub Pages)

This repository includes a pre-configured GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and publishes the app to GitHub Pages on every push to `main` or `master`.

### Enabling GitHub Pages in your repository:
1. Navigate to your repository on GitHub.
2. Go to **Settings** → **Pages** (under the *Code and automation* section).
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. Push your commits to `main` (or trigger the workflow manually from the **Actions** tab).

---

## 📄 License

This project is open source and available under the [Apache-2.0 License](LICENSE).
