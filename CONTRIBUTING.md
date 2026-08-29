# Contributing to Alertbox Webapp

Thanks for your interest in contributing to Alertbox! Whether you're fixing a bug, adding a new payment integration, or improving accessibility, we appreciate your help.

---

## Code of Conduct

Please be respectful, collaborative, and constructive when opening issues or pull requests.

---

## Development Workflow

### 1. Fork & Branch

```bash
# Clone your fork
git clone https://github.com/<your-username>/alertbox-org-webapp.git
cd alertbox-org-webapp

# Create a feature branch
git checkout -b feature/my-cool-feature
```

### 2. Code Standards & Guidelines

- **Package Manager**: Use `bun`. Please don't commit `package-lock.json` or `yarn.lock`.
- **TypeScript**: All types and interfaces belong in `src/types/*.types.ts` and should be exported through `src/types/index.ts`. No `any` casts unless strictly required with justification.
- **Components & Styling**:
  - Use Tailwind CSS utility classes.
  - Follow the existing dark/light mode tokens in `src/styles/globals.css`.
  - For images, always use `next/image` with proper `width`/`height` or `fill`.
  - Ensure WebGL effects respect user battery and `prefers-reduced-motion`.
- **Zero AI Slop**: Keep code clean and self-documenting. Avoid redundant boilerplate comments explaining obvious code.

### 3. Pre-Commit Checklist

Before opening a pull request, make sure your branch passes all checks locally:

```bash
# 1. Linting (must pass with 0 errors and 0 warnings)
bun run lint

# 2. Typechecking
bun x tsc --noEmit

# 3. Unit Tests
bun test

# 4. Production Build
bun run build
```

---

## Submitting a Pull Request

1. Push your branch to GitHub:
   ```bash
   git push origin feature/my-cool-feature
   ```
2. Open a Pull Request against `main`.
3. Provide a clear description of what changed, why, and any screenshots if you modified UI components.
4. Ensure the GitHub Actions CI pipeline passes.

---

## Reporting Bugs & Requesting Features

- Open an issue on GitHub with a clear title and reproduction steps.
- Include browser/OS versions and console logs if applicable.
