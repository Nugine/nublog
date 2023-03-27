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
        // https://typescript-eslint.io/rules/no-unused-vars/
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
    overrides: [
        {
            files: ["layouts/*.vue", "pages/**/*.vue", "error.vue"],
            rules: { "vue/multi-word-component-names": "off" },
        },
    ],
};
