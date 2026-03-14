# Org Chart for Google Workspace

A vibecoded front-end-only React + TypeScript + Material UI experience for visualizing your Google Workspace directory.

A front-end-only React + TypeScript + Material UI experience that mirrors Google's design language while visualizing the Google Workspace directory. Admins can authenticate with their Workspace account, fetch employees from the Directory API, and explore the org chart based on each user's manager email.

## Highlights

- Google Identity Services token flow that runs entirely in the browser
- Directory API integration with pagination handling and graceful error states
- Drag-and-drop tree editing plus inline role/title editing that syncs to Google Workspace
- Manager / report hierarchy that mirrors the Directory "manager email" relation
- Material UI components themed with Google colors, including responsive org chart and rich person cards
- React Query data layer with refresh controls and optimistic UI feedback

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create an OAuth 2.0 Web Client** in Google Cloud Console and enable the Admin SDK > Directory API for your Workspace organization.
3. **Update the Google OAuth client ID** inside `src/config.ts` (replace the placeholder with your Workspace OAuth client).
4. **Run the dev server**
   ```bash
   npm run dev
   ```
5. Navigate to `http://localhost:5173`, sign in with a Google Workspace admin, grant the `admin.directory.user` + `admin.directory.user.readonly` scopes, and explore + edit your org chart.

## Notes on auth & security

- The app never persists tokens or user data; everything stays in memory inside the browser tab.
- The Directory API scopes include read and write access to the Admin SDK user resource because drag-and-drop edits update each person's manager relation.
- Because the app is front-end only, rate limits and CORS policies apply to the signed-in admin directly; there is no proxy server.

## Project structure

```
src/
├── App.tsx                 # Entry shell handling auth and data orchestration
├── components/             # Material UI building blocks (chart, auth prompt, details)
├── lib/
│   ├── googleDirectory.ts  # Directory API client + data normalization
│   ├── orgChart.ts         # Hierarchy builder utilities
│   ├── useDirectoryQuery.ts
│   └── useGoogleAuth.ts    # GIS token client hook
├── types/                  # Shared TypeScript types + google.* declarations
└── main.tsx                # App bootstrap + Material theme
```

## Future enhancements

- Add cached offline demo data so designers can preview without Workspace access
- Support searching/filtering by name, department, or location within the org chart
- Surface additional Directory fields (custom attributes, cost center, pronouns)
- Export snapshots as images/PDF to share with leadership teams
