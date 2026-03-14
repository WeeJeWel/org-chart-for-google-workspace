import type { DirectoryPerson, OrgChartData, OrgNode } from '../types/directory';

export const normalizeKey = (value?: string) => {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.includes('@') ? trimmed.toLowerCase() : trimmed;
};

const registerNodeKey = (index: Map<string, OrgNode>, key: string | undefined | null, node: OrgNode) => {
  const normalized = normalizeKey(key ?? undefined);
  if (!normalized) return;
  index.set(normalized, node);
};

const sortTree = (node: OrgNode) => {
  node.reports.sort((a, b) => a.displayName.localeCompare(b.displayName));
  node.reports.forEach(sortTree);
};

export const buildOrgChart = (people: DirectoryPerson[]): OrgChartData => {
  const nodeIndex = new Map<string, OrgNode>();
  const nodes: OrgNode[] = people.map((person) => {
    const node: OrgNode = {
      ...person,
      reports: []
    };
    registerNodeKey(nodeIndex, person.id, node);
    registerNodeKey(nodeIndex, person.primaryEmail, node);
    person.aliases?.forEach((alias) => registerNodeKey(nodeIndex, alias, node));
    return node;
  });

  const roots: OrgNode[] = [];

  nodes.forEach((node) => {
    const managerKeys = [node.managerEmail, node.managerId];
    let manager: OrgNode | undefined;

    for (const key of managerKeys) {
      const normalized = normalizeKey(key);
      if (!normalized) continue;
      manager = nodeIndex.get(normalized);
      if (manager) break;
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
