/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
    root: true,
    parser: "vue-eslint-parser",
    parserOptions: {
        ecmaVersion: "latest",
        parser: "@typescript-eslint/parser",
        sourceType: "module",
        project: "./tsconfig.json",
    },
    plugins: ["@typescript-eslint"],
    extends: [
        "plugin:vue/vue3-essential",
        "plugin:@typescript-eslint/recommended",
        "eslint:recommended",
        "@vue/eslint-config-typescript",
        "@vue/eslint-config-prettier/skip-formatting",
    ],
    rules: {
        "@typescript-eslint/no-floating-promises": ["error"],
    },
    overrides: [
        {
            files: ["layouts/*.vue", "pages/**/*.vue"],
            rules: { "vue/multi-word-component-names": "off" },
        },
    ],
};
