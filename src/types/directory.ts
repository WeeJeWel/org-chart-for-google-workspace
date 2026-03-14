export interface DirectoryPerson {
  id: string;
  primaryEmail: string;
  displayName: string;
  givenName?: string;
  jobTitle?: string;
  department?: string;
  photoUrl?: string;
  managerEmail?: string;
  managerId?: string;
  managerDisplayName?: string;
  location?: string;
  phone?: string;
  aliases?: string[];
}

export interface OrgNode extends DirectoryPerson {
  reports: OrgNode[];
}

export interface OrgChartData {
  roots: OrgNode[];
  nodeIndex: Map<string, OrgNode>;
}
