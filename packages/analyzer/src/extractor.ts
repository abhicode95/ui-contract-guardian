import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const ts: any = require("typescript").default ?? require("typescript");

import type {
  ComponentContract,
  PropContract,
  PropType,
} from "@ui-contract-guardian/contracts";

function getPrimitiveType(typeNode: any): PropType {
  switch (typeNode.kind) {
    case ts.SyntaxKind.StringKeyword:
      return "string";

    case ts.SyntaxKind.NumberKeyword:
      return "number";

    case ts.SyntaxKind.BooleanKeyword:
      return "boolean";

    case ts.SyntaxKind.ObjectKeyword:
      return "object";

    default:
      return "unknown";
  }
}

function getUnionValues(unionNode: any, sourceFile: any): string[] {
  return unionNode.types
    .map((member: any) => {
      if (ts.isLiteralTypeNode(member) && ts.isStringLiteral(member.literal)) {
        return member.literal.text;
      }

      return null;
    })
    .filter((value: string | null): value is string => value !== null);
}

function resolvePropType(
  typeNode: any,
  typeAliases: Map<string, any>,
  sourceFile: any,
): Pick<PropContract, "type" | "values"> {
  // Direct primitive types
  const primitiveType = getPrimitiveType(typeNode);

  if (primitiveType !== "unknown") {
    return {
      type: primitiveType,
    };
  }

  // Direct union
  if (ts.isUnionTypeNode(typeNode)) {
    const values = getUnionValues(typeNode, sourceFile);

    if (values.length > 0) {
      return {
        type: "union",
        values,
      };
    }
  }

  // Type alias
  if (ts.isTypeReferenceNode(typeNode)) {
    const typeName = typeNode.typeName.getText(sourceFile);

    const alias = typeAliases.get(typeName);

    if (alias) {
      if (ts.isUnionTypeNode(alias.type)) {
        const values = getUnionValues(alias.type, sourceFile);

        if (values.length > 0) {
          return {
            type: "union",
            values,
          };
        }
      }

      const aliasPrimitiveType = getPrimitiveType(alias.type);

      if (aliasPrimitiveType !== "unknown") {
        return {
          type: aliasPrimitiveType,
        };
      }
    }
  }

  return {
    type: "unknown",
  };
}

export function extractComponentContract(filePath: string): ComponentContract {
  const sourceCode = readFileSync(filePath, "utf-8");

  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
  );
  const diagnostics = sourceFile.parseDiagnostics ?? [];

  if (diagnostics.length > 0) {
    const messages = diagnostics
      .map((diagnostic: any) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
      )
      .join("\n");

    throw new Error(
      `TypeScript syntax errors found in ${filePath}:\n${messages}`,
    );
  }
  const typeAliases = new Map<string, any>();

  sourceFile.forEachChild((node: any) => {
    if (ts.isTypeAliasDeclaration(node)) {
      typeAliases.set(node.name.getText(sourceFile), node);
    }
  });

  const props: PropContract[] = [];

  let componentName = "UnknownComponent";

  sourceFile.forEachChild((node: any) => {
    if (!ts.isInterfaceDeclaration(node)) {
      return;
    }

    componentName = node.name.getText(sourceFile);

    node.members.forEach((member: any) => {
      if (!ts.isPropertySignature(member)) {
        return;
      }

      const name = member.name.getText(sourceFile);

      const required = !member.questionToken;

      const typeNode = member.type;

      if (!typeNode) {
        props.push({
          name,
          required,
          type: "unknown",
        });

        return;
      }

      const resolved = resolvePropType(typeNode, typeAliases, sourceFile);

      props.push({
        name,
        required,
        type: resolved.type,
        ...(resolved.values ? { values: resolved.values } : {}),
      });
    });
  });

  return {
    name: componentName,
    filePath,
    props,
  };
}
