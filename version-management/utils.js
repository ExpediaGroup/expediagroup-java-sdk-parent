function isLeaf(node) {
    return (node.elements === undefined || node?.elements?.length === 0);
}

function searchAndPerformActionOnSpecificNode(node, name, cb) {
    if (node.name === name) {
        cb(node)
    } else {
        if (isLeaf(node)) return false;
        else {
            const children = node?.elements;
            for (let i = 0; i < children?.length; i++) {
                searchAndPerformActionOnSpecificNode(children[i], name, cb)
            }
        }
    }
}

export {isLeaf, searchAndPerformActionOnSpecificNode}
