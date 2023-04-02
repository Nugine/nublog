export type Script = ReturnType<typeof createScript>;

export function createScript() {
    const imports: [string, string][] = [];
    const constants: [string, string][] = [];

    return {
        addImport(name: string, path: string) {
            imports.push([name, path]);
        },
        addConstant(name: string, value: unknown) {
            constants.push([name, JSON.stringify(value)]);
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
