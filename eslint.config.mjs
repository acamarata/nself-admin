import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        requestIdleCallback: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        navigator: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        FormData: "readonly",
        Blob: "readonly",
        FileReader: "readonly",
        performance: "readonly",
        AbortController: "readonly",
        AbortSignal: "readonly",
        EventSource: "readonly",
        WebSocket: "readonly",
        Response: "readonly",
        Request: "readonly",
        Headers: "readonly",
        Buffer: "readonly",
        process: "readonly",
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        NodeJS: "readonly",
        CustomEvent: "readonly",
        HTMLInputElement: "readonly",
        Event: "readonly",
        alert: "readonly",
        confirm: "readonly",
        ReadableStream: "readonly",
        TextEncoder: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      // TypeScript handles these better
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-redeclare": "off", // TypeScript handles this

      // Warnings for code quality
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_"
      }],
      "@typescript-eslint/no-explicit-any": "off",

      // Relaxed rules for this codebase patterns
      "no-empty": "warn",
      "no-case-declarations": "warn",
      "no-control-regex": "off", // Used for ANSI escape sequence handling
      "no-useless-escape": "warn",
      "no-useless-catch": "warn",

      // Disable missing react-hooks rules (not configured in flat config)
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/rules-of-hooks": "off",
    },
  },
  {
    ignores: ["node_modules/**", ".next/**", "dist/**", "*.config.*"],
  },
];
