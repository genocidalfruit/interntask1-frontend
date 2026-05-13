# Frontend

This is a React application built with Vite, Tailwind CSS, and React Router.

## Prerequisites

- Node.js (v18 or higher)
- npm

## Setup

### 1. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

The default `.env.example` contains:

```
VITE_API_URL=http://localhost:5000
```

- `VITE_API_URL`: The backend API URL (change if your backend runs on a different port)

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (default Vite port).

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Tech Stack

- React 19
- Vite
- Tailwind CSS 4
- React Router DOM
- TanStack Query
- Recharts