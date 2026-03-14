const DIRECTORY_ENDPOINT = 'https://admin.googleapis.com/admin/directory/v1/users';

interface UpdateManagerPayload {
  userId: string;
  managerEmail?: string | null;
}

interface UpdateJobTitlePayload {
  userId: string;
  jobTitle: string;
}

const patchUser = async (accessToken: string, userId: string, updateMask: string, body: Record<string, unknown>) => {
  const url = new URL(`${DIRECTORY_ENDPOINT}/${encodeURIComponent(userId)}`);
  url.searchParams.set('updateMask', updateMask);

  const response = await fetch(url.toString(), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to update user: ${response.status} ${message}`);
  }

  return response.json();
};

export const updateUserManager = async (accessToken: string, { userId, managerEmail }: UpdateManagerPayload) =>
  patchUser(accessToken, userId, 'relations', {
    relations: managerEmail ? [{ type: 'manager', value: managerEmail }] : []
  });

export const updateUserJobTitle = async (accessToken: string, { userId, jobTitle }: UpdateJobTitlePayload) =>
  patchUser(accessToken, userId, 'organizations', {
    organizations: [
      {
        primary: true,
        title: jobTitle || null
      }
    ]
  });
