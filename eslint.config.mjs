import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "react-hooks": nextVitals[0].plugins["react-hooks"],
    },
    rules: {
      "react-hooks/refs": "error",
      "react-hooks/set-state-in-effect": "error",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/**",
    "lint_results.json",
  ]),
]);

export default eslintConfig;
