export function toPascalCase(str: string): string {
    return str
        .replace(/[-_./\\]+/g, ' ')
        .replace(/\s+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/^(.)/, (_, chr) => chr.toUpperCase())
        .replace(/\s/g, '');
}
