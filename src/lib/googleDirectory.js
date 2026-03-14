const DIRECTORY_ENDPOINT = 'https://admin.googleapis.com/admin/directory/v1/users';
const parseManagerValue = (value) => {
    if (!value)
        return undefined;
    const trimmed = value.trim();
    if (!trimmed)
        return undefined;
    const normalized = trimmed.replace(/^(people|users)\//i, '');
    if (normalized.includes('@')) {
        return { email: normalized.toLowerCase(), display: trimmed };
    }
    const isLikelyId = /^[a-z0-9_-]{8,}$/i.test(normalized) && !normalized.includes(' ');
    if (isLikelyId) {
        return { id: normalized };
    }
    return { display: trimmed };
};
const getManagerFromUser = (user) => {
    const relation = user.relations?.find((rel) => rel.type?.toLowerCase() === 'manager');
    if (relation?.value) {
        const info = parseManagerValue(relation.value);
        if (info) {
            return { ...info, display: info.display ?? relation.value };
        }
    }
    return {};
};
const mapUserToPerson = (user) => {
    const primaryOrg = user.organizations?.find((org) => org.primary) ?? user.organizations?.[0];
    const manager = getManagerFromUser(user);
    return {
        id: user.id,
        primaryEmail: user.primaryEmail,
        displayName: user.name?.fullName ?? user.primaryEmail,
        givenName: user.name?.givenName,
        photoUrl: user.thumbnailPhotoUrl,
        jobTitle: primaryOrg?.title,
        department: primaryOrg?.department,
        location: primaryOrg?.location,
        managerEmail: manager.email,
        managerId: manager.id,
        managerDisplayName: manager.display,
        phone: user.phones?.[0]?.value,
        aliases: [...(user.aliases ?? []), ...(user.nonEditableAliases ?? [])]
    };
};
export const fetchDirectoryPeople = async (accessToken) => {
    const people = [];
    let pageToken;
    do {
        const url = new URL(DIRECTORY_ENDPOINT);
        url.searchParams.set('customer', 'my_customer');
        url.searchParams.set('projection', 'full');
        url.searchParams.set('viewType', 'admin_view');
        url.searchParams.set('maxResults', '500');
        if (pageToken) {
            url.searchParams.set('pageToken', pageToken);
        }
        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            const message = await response.text();
            throw new Error(`Directory API error: ${response.status} ${message}`);
        }
        const payload = (await response.json());
        people.push(...(payload.users?.map(mapUserToPerson) ?? []));
        pageToken = payload.nextPageToken;
    } while (pageToken);
    return people;
};
