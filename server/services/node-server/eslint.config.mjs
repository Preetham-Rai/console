// import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  //   js.configs.recommended,
  //   ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    rules: {
      "no-warning-comments": [
        "warn",
        {
          terms: ["TODO", "FIXME", "HACK", "production"],
          location: "anywhere",
        },
      ],
      //   "no-console": "warn",
      //   "@typescript-eslint/no-unused-vars": "warn",
      //   "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
);
