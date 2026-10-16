// Guardrail: catches used-but-undefined identifiers (e.g. a missing icon import
// that only throws when the control is clicked). Run with `npm run lint`.
import globals from "globals";
import react from "eslint-plugin-react";

export default [
  { ignores: ["dist/**", "node_modules/**", "src/main.js"] },
  {
    files: ["src/**/*.{js,jsx}", "scripts/**/*.mjs", "tests/**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { react },
    rules: { "no-undef": "error", "react/jsx-no-undef": "error" },
  },
];
