import { fileURLToPath } from "node:url";

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "@csstools/postcss-oklab-function": { preserve: true },
    "@csstools/postcss-color-mix-function": { preserve: true },
    [fileURLToPath(new URL("./postcss-color-mix-fallback.cjs", import.meta.url))]: {},
  },
};

export default config;
