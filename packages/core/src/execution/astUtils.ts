import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { AwaitCall } from './types';

let idCounter = 0;

export function analyzeAsyncFlow(code: string): AwaitCall[] {
    const ast = acorn.parse(code, {
        ecmaVersion: 'latest',
        sourceType: 'module',
        locations: true
    }) as any;

    const awaitCalls: AwaitCall[] = [];

    walk.simple(ast, {
        AwaitExpression(node: any) {
            const line = node.loc.start.line;
            const id = (++idCounter).toString();

            const dependsOn: string[] = [];

            // Try to detect basic dependency
            if (
                node.argument &&
                node.argument.type === 'CallExpression' &&
                node.argument.arguments?.length
            ) {
                node.argument.arguments.forEach((arg: any) => {
                    if (arg.type === 'Identifier') {
                        dependsOn.push(arg.name);
                    }
                });
            }

            awaitCalls.push({
                id,
                line,
                dependsOn: dependsOn.length > 0 ? dependsOn : undefined
            });
        }
    });

    return awaitCalls;
}
