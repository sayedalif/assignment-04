
# Minimal Library Management System

A modern, minimal library management system built with **React**, **TypeScript**, **Vite**, **Redux Toolkit**, and **shadcn/ui**. This project demonstrates a full-featured frontend for managing books, borrowing, and summaries, with a clean and responsive UI.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How to Run Locally](#how-to-run-locally)
- [Code Logic & Integration](#code-logic--integration)
- [API Proxy](#api-proxy)
- [Customization](#customization)
- [Contributing](#contributing)

---

## Features
- 📚 View all books, add new books, and see book details
- 🔄 Borrow books and view borrow summaries
- 🧩 Modular code structure with reusable UI components (shadcn/ui)
- ⚡ Fast development with Vite and TypeScript
- 🗃️ State management using Redux Toolkit and RTK Query
- 🎨 Styled with Tailwind CSS

## Tech Stack
- **React 19** + **TypeScript**
- **Vite** (for fast dev/build)
- **Redux Toolkit** & **RTK Query**
- **shadcn/ui** (Radix UI + Tailwind CSS)
- **React Router v7**
- **Zod** (form validation)
- **Lucide React** (icons)

## Project Structure

```
Minimal Library Management System/
├── public/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── store.ts
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── redux/
│   ├── routes/
│   ├── types/
│   └── components/
│       └── ui/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── ...
```

- **src/pages/**: Main pages (Books, AddBook, BookDetails, BorrowSummary, Navbar, Footer)
- **src/components/ui/**: Reusable UI components (shadcn/ui)
- **src/redux/**: Redux Toolkit store and API slices
- **src/routes/**: App routes (React Router v7)
- **src/types/**: TypeScript types
- **src/hooks/**: Custom hooks for Redux
- **src/lib/**: Utility functions

## How to Run Locally

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** or **bun**

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd "Minimal Library Management System"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or, if you use bun:
   bun install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production
```bash
npm run build
# or
bun run build
```

### Preview Production Build
```bash
npm run preview
# or
bun run preview
```

---

## Code Logic & Integration

### 1. **Entry Point & App Structure**
- **`src/main.tsx`**: Bootstraps the React app, wraps it with Redux Provider and React Router.
- **`src/App.tsx`**: Main layout, includes Navbar, Footer, and renders page content via `<Outlet />`.

### 2. **Routing**
- **`src/routes/routes.tsx`**: Defines all routes using React Router v7. Nested routes allow for main layout and child pages:
  - `/books` — All books
  - `/create-book` — Add a new book
  - `/books/:id` — Book details
  - `/borrow-summary` — Borrow summary

### 3. **State Management**
- **`src/store.ts`**: Configures Redux store with RTK Query API slice.
- **`src/redux/api/baseApi.ts`**: RTK Query API slice for all backend interactions (CRUD for books, borrow, etc). Handles caching, invalidation, and async logic.
- **`src/hooks/hooks.ts`**: Typed hooks for Redux (`useAppDispatch`, `useAppSelector`).

### 4. **Pages**
- **`src/pages/Books.tsx`**: Lists all books, allows editing, deleting, and borrowing. Uses RTK Query hooks for data fetching and mutations.
- **`src/pages/AddBook.tsx`**: Form to add a new book. Uses `react-hook-form` with Zod validation and shadcn/ui components.
- **`src/pages/BookDetails.tsx`**: Shows detailed info for a single book, with options to reserve or add to wishlist.
- **`src/pages/BorrowSummary.tsx`**: Displays a summary of borrowed books.
- **`src/pages/Navbar.tsx` & `src/pages/Footer.tsx`**: Navigation and footer components.

### 5. **UI Components**
- **`src/components/ui/`**: All UI elements (Button, Card, Table, Dialog, etc) are from shadcn/ui, built on Radix UI and styled with Tailwind CSS.

### 6. **Types & Utilities**
- **`src/types/types.ts`**: TypeScript interfaces for Book and related entities.
- **`src/lib/utils.ts`**: Utility functions (e.g., class name merging for Tailwind).

### 7. **Styling**
- **`src/index.css`**: Imports Tailwind CSS and custom styles.
- **Tailwind config**: Used for utility-first styling and theme customization.

### 8. **API Proxy**
- **`vite.config.ts`**: Proxies `/api` requests to the backend server. Update the `target` if your backend URL changes.

---