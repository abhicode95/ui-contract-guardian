import ts from "typescript";
import type {
  ComponentContract,
  PropContract,
  PropType,
} from "@ui-contract-guardian/contracts";

export function extractComponentContract(filePath: string): ComponentContract {
  const sourceCode = ts.sys.readFile(filePath) ?? "";

  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
  );

  const typeAliases = new Map<string, ts.TypeAliasDeclaration>();

  sourceFile.forEachChild((node) => {
    if (ts.isTypeAliasDeclaration(node)) {
      typeAliases.set(node.name.getText(sourceFile), node);
    }
  });

  const props: PropContract[] = [];

  let componentName = "UnknownComponent";

  sourceFile.forEachChild((node) => {
    if (ts.isInterfaceDeclaration(node)) {
      componentName = node.name.getText(sourceFile);

      node.members.forEach((member) => {
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

        if (ts.isTypeReferenceNode(typeNode)) {
          const typeName = typeNode.typeName.getText(sourceFile);

          const alias = typeAliases.get(typeName);

          if (alias && ts.isUnionTypeNode(alias.type)) {
            const values = alias.type.types.map((typeNode) => {
              const value = typeNode.getText(sourceFile);

              return value.replace(/^["']|["']$/g, "");
            });

            props.push({
              name,
              required,
              type: "union",
              values,
            });

            return;
          }
        }

        if (typeNode.kind === ts.SyntaxKind.BooleanKeyword) {
          props.push({
            name,
            required,
            type: "boolean",
          });

          return;
        }

        props.push({
          name,
          required,
          type: "unknown",
        });
      });
    }
  });

  return {
    name: componentName,
    filePath,
    props,
  };
}
