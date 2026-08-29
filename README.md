# Alertbox Webapp

The official frontend for [Alertbox.org](https://alertbox.org) and [TipTo.Me](https://tip-to.me) — a modern, privacy-first livestream tipping overlay and creator profile platform.

---

## Overview

Alertbox gives streamers and creators a clean way to receive tips and donations directly to their own accounts (Buy Me a Coffee, Ko-fi, Stripe, FeelFreePay, Streamlabs) while displaying instant, custom animated overlays on OBS / Streamlabs Desktop.

### Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- **Runtime & Package Manager**: [Bun](https://bun.sh)
- **UI & Animation**: [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com), [Motion](https://motion.dev)
- **Graphics & Shaders**: WebGL, Three.js, OGL (interactive light pillars, aurora, prism)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: `@phosphor-icons/react`, `@thesvg/react`
- **Localization**: Built-in multi-language support (English & Thai)

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.2+) installed on your machine
- Backend API running locally or set via environment variables

### Installation

```bash
# Clone the repository
git clone https://github.com/Ponlponl123-Labs/alertbox-org-webapp.git
cd alertbox-org-webapp

# Install dependencies
bun install
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_ENDPOINT=http://localhost:3000
```

### Development

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Building for Production

```bash
# Lint checks
bun run lint

# Typecheck
bun x tsc --noEmit

# Run unit tests
bun test

# Build production bundle
bun run build
```

---

## Project Structure

```
alertbox-org-webapp/
├── public/                 # Static assets, logos, and audio files
├── src/
│   ├── app/                # Next.js App Router (pages, layouts, routes)
│   │   ├── [username]/     # Public creator tip & profile page (@username)
│   │   ├── app/            # Creator dashboard, connections & settings
│   │   ├── index/          # Landing page modular sections
│   │   └── ...             # Static & marketing pages (about, pricing, donate)
│   ├── components/         # Shared UI components & WebGL shaders
│   ├── consts/             # App constants, regex rules, payment providers
│   ├── contexts/           # React context providers (User auth, theme)
│   ├── data/langs/         # i18n translation dictionaries (en.json, th.json)
│   ├── hooks/              # Custom React hooks & Zustand store modules
│   ├── lib/                # Pure utility functions, color math, API helpers
│   ├── styles/             # Global CSS and design tokens
│   └── types/              # Declarative TypeScript types & interfaces
└── .github/workflows/      # GitHub Actions CI pipeline
```

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
