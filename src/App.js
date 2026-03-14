import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, Container, Grid, IconButton, Stack, Tooltip, Typography, Link } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { QueryClient, QueryClientProvider, useMutation, useQueryClient } from '@tanstack/react-query';
import AuthPrompt from './components/AuthPrompt';
import OrgChart from './components/OrgChart';
import PersonDetails from './components/PersonDetails';
import SignedOutPreview from './components/SignedOutPreview';
import AppHeader from './components/AppHeader';
import { useGoogleAuth } from './lib/useGoogleAuth';
import { useDirectoryQuery } from './lib/useDirectoryQuery';
import { buildOrgChart, normalizeKey } from './lib/orgChart';
import { updateUserManager, updateUserJobTitle } from './lib/directoryMutations';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false
        }
    }
});
const DIRECTORY_SCOPE = 'https://www.googleapis.com/auth/admin.directory.user https://www.googleapis.com/auth/admin.directory.user.readonly openid email profile';
const AppContent = () => {
    const { isReady, accessToken, signIn, signOut, error: authError } = useGoogleAuth(DIRECTORY_SCOPE);
    const directoryQuery = useDirectoryQuery(accessToken);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [pendingManagers, setPendingManagers] = useState({});
    const [pendingTitles, setPendingTitles] = useState({});
    const [adminProfile, setAdminProfile] = useState(null);
    const queryClientInstance = useQueryClient();
    useEffect(() => {
        if (!accessToken) {
            setAdminProfile(null);
            return;
        }
        let cancelled = false;
        const fetchProfile = async () => {
            try {
                const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }
                const payload = (await response.json());
                if (!cancelled) {
                    setAdminProfile(payload);
                }
            }
            catch (err) {
                if (!cancelled) {
                    setAdminProfile(null);
                    console.warn('Unable to load admin profile', err);
                }
            }
        };
        fetchProfile();
        return () => {
            cancelled = true;
        };
    }, [accessToken]);
    useEffect(() => {
        if (!directoryQuery.data) {
            setPendingManagers({});
            setPendingTitles({});
            return;
        }
        setPendingManagers((prev) => {
            let updated = false;
            const next = { ...prev };
            directoryQuery.data.forEach((person) => {
                const pending = prev[person.id];
                if (pending === undefined)
                    return;
                const matches = pending === null
                    ? !person.managerEmail && !person.managerId
                    : person.managerEmail?.toLowerCase() === pending.toLowerCase();
                if (matches) {
                    delete next[person.id];
                    updated = true;
                }
            });
            return updated ? next : prev;
        });
        setPendingTitles((prev) => {
            let updated = false;
            const next = { ...prev };
            directoryQuery.data.forEach((person) => {
                const pending = prev[person.id];
                if (pending === undefined)
                    return;
                const matches = (person.jobTitle ?? '') === (pending ?? '');
                if (matches) {
                    delete next[person.id];
                    updated = true;
                }
            });
            return updated ? next : prev;
        });
    }, [directoryQuery.data]);
    const peopleWithPending = useMemo(() => {
        if (!directoryQuery.data)
            return null;
        if (Object.keys(pendingManagers).length === 0) {
            return directoryQuery.data;
        }
        return directoryQuery.data.map((person) => {
            let next = person;
            const pendingManager = pendingManagers[person.id];
            if (pendingManager !== undefined) {
                next = {
                    ...next,
                    managerEmail: pendingManager || undefined,
                    managerId: undefined,
                    managerDisplayName: pendingManager || undefined
                };
            }
            const pendingTitle = pendingTitles[person.id];
            if (pendingTitle !== undefined) {
                next = {
                    ...next,
                    jobTitle: pendingTitle || undefined
                };
            }
            return next;
        });
    }, [directoryQuery.data, pendingManagers, pendingTitles]);
    const chartData = useMemo(() => {
        if (!peopleWithPending)
            return null;
        return buildOrgChart(peopleWithPending);
    }, [peopleWithPending]);
    const nodesById = useMemo(() => {
        const map = new Map();
        if (!chartData)
            return map;
        const visit = (node) => {
            map.set(node.id, node);
            node.reports.forEach(visit);
        };
        chartData.roots.forEach(visit);
        return map;
    }, [chartData]);
    useEffect(() => {
        if (!chartData) {
            setSelectedEmail(null);
            return;
        }
        const normalizedSelected = normalizeKey(selectedEmail ?? undefined);
        if (normalizedSelected && chartData.nodeIndex.has(normalizedSelected)) {
            return;
        }
        const firstEmail = chartData.roots[0]?.primaryEmail ?? null;
        setSelectedEmail(firstEmail);
    }, [chartData, selectedEmail]);
    const handlePersonSelect = (email) => {
        setSelectedEmail(email);
    };
    const selectedNode = selectedEmail && chartData
        ? chartData.nodeIndex.get(normalizeKey(selectedEmail) ?? selectedEmail)
        : undefined;
    const authenticatedDirectoryUser = useMemo(() => {
        if (!adminProfile?.email)
            return undefined;
        const email = adminProfile.email.toLowerCase();
        return directoryQuery.data?.find((person) => person.primaryEmail.toLowerCase() === email);
    }, [adminProfile?.email, directoryQuery.data]);
    const activeAdminForHeader = useMemo(() => {
        if (authenticatedDirectoryUser)
            return authenticatedDirectoryUser;
        if (!adminProfile)
            return undefined;
        return {
            id: 'authenticated-user',
            primaryEmail: adminProfile.email ?? 'me',
            displayName: adminProfile.name ?? adminProfile.email ?? 'You',
            photoUrl: adminProfile.picture
        };
    }, [adminProfile, authenticatedDirectoryUser]);
    const managerNode = selectedNode && chartData
        ? (() => {
            const managerKeys = [selectedNode.managerEmail, selectedNode.managerId];
            for (const key of managerKeys) {
                const normalized = normalizeKey(key);
                if (!normalized)
                    continue;
                const match = chartData.nodeIndex.get(normalized);
                if (match) {
                    return match;
                }
            }
            return undefined;
        })()
        : undefined;
    const updateManagerMutation = useMutation({
        mutationKey: ['update-manager', accessToken],
        mutationFn: ({ userId, managerEmail }) => {
            if (!accessToken) {
                throw new Error('Missing access token');
            }
            return updateUserManager(accessToken, { userId, managerEmail });
        },
        onMutate: async (variables) => {
            setPendingManagers((prev) => ({ ...prev, [variables.userId]: variables.managerEmail }));
            await queryClientInstance.cancelQueries({ queryKey: ['directory', accessToken] });
            const previous = queryClientInstance.getQueryData(['directory', accessToken]);
            if (previous) {
                const updated = previous.map((person) => person.id === variables.userId
                    ? {
                        ...person,
                        managerEmail: variables.managerEmail ?? undefined,
                        managerId: undefined,
                        managerDisplayName: variables.managerEmail ?? undefined
                    }
                    : person);
                queryClientInstance.setQueryData(['directory', accessToken], updated);
            }
            return { previous };
        },
        onError: (_error, variables, context) => {
            if (context?.previous) {
                queryClientInstance.setQueryData(['directory', accessToken], context.previous);
            }
            setPendingManagers((prev) => {
                if (!(variables.userId in prev))
                    return prev;
                const next = { ...prev };
                delete next[variables.userId];
                return next;
            });
        },
        onSettled: () => {
            queryClientInstance.invalidateQueries({ queryKey: ['directory', accessToken] });
        }
    });
    const updateTitleMutation = useMutation({
        mutationKey: ['update-title', accessToken],
        mutationFn: ({ userId, jobTitle }) => {
            if (!accessToken) {
                throw new Error('Missing access token');
            }
            return updateUserJobTitle(accessToken, { userId, jobTitle });
        },
        onMutate: async (variables) => {
            setPendingTitles((prev) => ({ ...prev, [variables.userId]: variables.jobTitle }));
            await queryClientInstance.cancelQueries({ queryKey: ['directory', accessToken] });
            const previous = queryClientInstance.getQueryData(['directory', accessToken]);
            if (previous) {
                const updated = previous.map((person) => person.id === variables.userId
                    ? {
                        ...person,
                        jobTitle: variables.jobTitle || undefined
                    }
                    : person);
                queryClientInstance.setQueryData(['directory', accessToken], updated);
            }
            return { previous };
        },
        onError: (_error, variables, context) => {
            if (context?.previous) {
                queryClientInstance.setQueryData(['directory', accessToken], context.previous);
            }
            setPendingTitles((prev) => {
                if (!(variables.userId in prev))
                    return prev;
                const next = { ...prev };
                delete next[variables.userId];
                return next;
            });
        },
        onSettled: () => {
            queryClientInstance.invalidateQueries({ queryKey: ['directory', accessToken] });
        }
    });
    const handleManagerChange = (userId, managerEmail) => {
        if (!accessToken)
            return;
        updateManagerMutation.mutate({ userId, managerEmail });
    };
    const handleTitleChange = (userId, title) => {
        if (!accessToken)
            return;
        updateTitleMutation.mutate({ userId, jobTitle: title });
    };
    const selectedPendingTitle = selectedNode ? pendingTitles[selectedNode.id] : undefined;
    const isUpdatingSelectedTitle = Boolean(updateTitleMutation.isPending &&
        selectedNode &&
        updateTitleMutation.variables?.userId === selectedNode.id);
    return (_jsxs(Box, { minHeight: "100vh", display: "flex", flexDirection: "column", children: [_jsx(AppHeader, { isSignedIn: Boolean(accessToken), onSignIn: signIn, onSignOut: () => {
                    signOut();
                    queryClient.clear();
                }, activeAdmin: activeAdminForHeader }), _jsx(Container, { maxWidth: "lg", sx: { py: 6, flexGrow: 1, display: 'flex', flexDirection: 'column' }, children: _jsxs(Stack, { spacing: 3, flexGrow: 1, children: [authError && _jsx(Alert, { severity: "error", children: authError }), updateManagerMutation.isError && (_jsx(Alert, { severity: "error", children: updateManagerMutation.error?.message ?? 'Unable to update manager' })), directoryQuery.isError && (_jsx(Alert, { severity: "error", children: directoryQuery.error?.message })), !accessToken && (_jsx(AuthPrompt, { onSignIn: signIn, isReady: isReady, error: authError, children: _jsx(SignedOutPreview, {}) })), accessToken && !chartData && directoryQuery.isLoading && (_jsx(Stack, { alignItems: "center", py: 10, children: _jsx(CircularProgress, {}) })), accessToken && chartData && (_jsxs(Grid, { container: true, spacing: 3, children: [_jsxs(Grid, { item: true, xs: 12, md: 7, children: [_jsxs(Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", mb: 1, children: [_jsxs(Typography, { variant: "h6", color: "text.primary", children: [(peopleWithPending?.length ?? 0).toLocaleString(), " Users"] }), _jsx(Tooltip, { title: "Refresh directory", children: _jsx("span", { children: _jsx(IconButton, { onClick: () => directoryQuery.refetch(), disabled: directoryQuery.isFetching, children: _jsx(RefreshIcon, {}) }) }) })] }), _jsx(OrgChart, { roots: chartData.roots, nodesById: nodesById, selectedEmail: selectedEmail, onSelect: handlePersonSelect, onMove: handleManagerChange })] }), _jsx(Grid, { item: true, xs: 12, md: 5, children: _jsx(Box, { sx: { position: { md: 'sticky' }, top: { md: 24 } }, children: _jsx(PersonDetails, { person: selectedNode ?? null, manager: managerNode ?? null, onFocusManager: (email) => setSelectedEmail(email), onUpdateTitle: selectedNode ? (title) => handleTitleChange(selectedNode.id, title) : undefined, pendingTitle: selectedPendingTitle, isUpdatingTitle: isUpdatingSelectedTitle }) }) })] }))] }) }), _jsx(Box, { component: "footer", sx: { py: 3, mt: 'auto' }, children: _jsx(Container, { maxWidth: "lg", children: _jsx(Stack, { alignItems: "center", children: _jsxs(Typography, { variant: "caption", color: "text.disabled", children: ["Vibecoded by Emile Nijssen \u2022", ' ', _jsx(Link, { href: "https://emile.nl", target: "_blank", rel: "noopener noreferrer", underline: "hover", color: "inherit", children: "emile.nl" })] }) }) }) })] }));
};
const App = () => (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(AppContent, {}) }));
export default App;
