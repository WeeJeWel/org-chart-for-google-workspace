export const normalizeKey = (value) => {
    const trimmed = value?.trim();
    if (!trimmed)
        return undefined;
    return trimmed.includes('@') ? trimmed.toLowerCase() : trimmed;
};
const registerNodeKey = (index, key, node) => {
    const normalized = normalizeKey(key ?? undefined);
    if (!normalized)
        return;
    index.set(normalized, node);
};
const sortTree = (node) => {
    node.reports.sort((a, b) => a.displayName.localeCompare(b.displayName));
    node.reports.forEach(sortTree);
};
export const buildOrgChart = (people) => {
    const nodeIndex = new Map();
    const nodes = people.map((person) => {
        const node = {
            ...person,
            reports: []
        };
        registerNodeKey(nodeIndex, person.id, node);
        registerNodeKey(nodeIndex, person.primaryEmail, node);
        person.aliases?.forEach((alias) => registerNodeKey(nodeIndex, alias, node));
        return node;
    });
    const roots = [];
    nodes.forEach((node) => {
        const managerKeys = [node.managerEmail, node.managerId];
        let manager;
        for (const key of managerKeys) {
            const normalized = normalizeKey(key);
            if (!normalized)
                continue;
            manager = nodeIndex.get(normalized);
            if (manager)
                break;
        }
        if (!manager) {
            roots.push(node);
            return;
        }
        manager.reports.push(node);
    });
    roots.sort((a, b) => a.displayName.localeCompare(b.displayName));
    roots.forEach(sortTree);
    return { roots, nodeIndex };
};
