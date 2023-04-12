export type Script = ReturnType<typeof createScript>;

export function createScript() {
    const imports: [string, string][] = [];
    const constants: [string, string][] = [];

    return {
        addImport(name: string, path: string) {
            imports.push([name, path]);
        },

        addConstantExpr(name: string, expr: string) {
            constants.push([name, expr]);
        },
        addConstantJson(name: string, value: unknown) {
            this.addConstantExpr(name, JSON.stringify(value));
        },

        finalize(): string {
            const statements: string[] = [];
            for (const [name, path] of imports) {
                statements.push(`import ${name} from "${path}";`);
            }
            for (const [name, value] of constants) {
                statements.push(`const ${name} = ${value};`);
            }
            return statements.join("");
        },
    };
}
