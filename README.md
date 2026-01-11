# SCORM Demo App

A modern, high-performance web application designed for client-side SCORM content playback and management.

---

## Table of Contents
- [1. Introduction (TL;DR)](#1-introduction-tldr)
- [2. Tech Stack](#2-tech-stack)
- [3. Key Features](#3-key-features)
- [4. Quick Start](#4-quick-start)
- [5. Project Structure](#5-project-structure)

---

## 1. Introduction (TL;DR)
The **SCORM Demo App** is a specialized platform for playing and managing SCORM-compliant e-learning content. Unlike traditional LMS platforms that rely heavily on server-side processing, this app uses a **client-side first** architecture. It extracts, parses, and serves SCORM packages directly in the browser, bypassing server payload limits and providing a fast, responsive user experience.

---

## 2. Tech Stack
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & CSS Modules (following Atomic Design)
- **State Management**: [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- **SCORM Runtime**: [scorm-again](https://github.com/cedu-fai-ucc/scorm-again)
- **Browser Storage**: IndexedDB (via custom `db.ts` utility)
- **Content Serving**: Service Workers for virtual file interception

---

## 3. Key Features
- **Pure Client-Side Processing**: ZIP packages are unzipped in the browser using `JSZip`, and manifests are parsed on-the-fly.
- **Support for Large Packages**: Bypasses the 4.5MB Vercel serverless limit, supporting packages up to **25MB** (and beyond) by processing everything locally.
- **Service Worker File Serving**: A custom Service Worker intercepts iframe requests to serve course assets directly from IndexedDB as if they were on a server.
- **SCORM Compliance**: Implements the Run-Time Environment (RTE) for SCORM 1.1, SCORM 1.2 and SCORM 2004 standards.
- **Persistence**: Remembers your uploaded courses and progress across sessions using local browser storage.

---

## 4. Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (Latest LTS)
- [pnpm](https://pnpm.io/) (Recommended)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd scorm-demo-app
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Project Structure

The project follows **Atomic Design** principles to ensure a highly modular, scalable, and maintainable codebase. Components are categorized into Atoms, Molecules, Organisms, and Templates.

```text
src/
├── app/                  # Next.js App Router (pages, actions, API)
├── components/           # UI Components (Atomic Design)
│   ├── atoms/            # Smallest units (Buttons, Icons)
│   ├── molecules/        # Groups of atoms (Uploader, Search bar)
│   ├── organisms/        # Complex sections (Player, Explorer)
│   ├── templates/        # Page-level layouts
│   └── providers/        # Context providers (Service Worker)
├── hooks/                # Custom React hooks
├── services/             # Business logic (SCORM processing)
├── store/                # Global state (Zustand)
├── utils/                # Helper utilities (DB operations)
└── types/                # TypeScript definitions
```
