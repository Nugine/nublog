import vueEslintParser from "vue-eslint-parser";
import tseslint from "typescript-eslint";
import eslint from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import vueTsEslintConfig from "@vue/eslint-config-typescript";
import prettierConfig from "@vue/eslint-config-prettier";

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    ...pluginVue.configs["flat/essential"],
    ...vueTsEslintConfig(),
    prettierConfig,
    {
        languageOptions: {
            parser: vueEslintParser,
            parserOptions: {
                ecmaVersion: "latest",
                parser: "@typescript-eslint/parser",
                sourceType: "module",
                project: "./tsconfig.json",
            },
        },
        rules: {
            "@typescript-eslint/no-floating-promises": ["error"],
            // https://typescript-eslint.io/rules/no-unused-vars/
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "vue/multi-word-component-names": "off",
        },
    },
    {
        ignores: ["dist", ".nuxt", ".output", "node_modules"],
    }
);
