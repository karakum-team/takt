import ts, {Node, SyntaxKind} from "typescript";
import {createSimplePlugin} from "../plugin";
import {CheckCoverageService, checkCoverageServiceKey} from "./CheckCoveragePlugin";

const isNull = (type: Node) => ts.isLiteralTypeNode(type) && type.literal.kind === SyntaxKind.NullKeyword
const isUndefined = (type: Node) => type.kind === SyntaxKind.UndefinedKeyword

const isNullable = (type: Node) => isNull(type) || isUndefined(type)

export const convertOptionalUnionType = createSimplePlugin((node, context, render) => {
    if (ts.isUnionTypeNode(node) &&
        node.types.length === 2 &&
        node.types.some(type => isNullable(type))
    ) {

        const checkCoverageService = context.lookupService<CheckCoverageService>(checkCoverageServiceKey)
        checkCoverageService?.cover(node)
        checkCoverageService?.cover(node.types[0])
        checkCoverageService?.cover(node.types[1])

        const nonNullableType = node.types.find(type => !isNullable(type))
        const nullableType = node.types.find(type => isNullable(type))

        nullableType && checkCoverageService?.deepCover(nullableType)

        return (nonNullableType && `${render(nonNullableType)}?`) ?? ""
    }

    return null;
})
