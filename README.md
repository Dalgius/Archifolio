
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment Variables

For the application to connect to Firebase, you need to set up environment variables.

1.  Create a new file in the root directory named `.env.local`.
2.  Copy the contents of the `.env` file into your new `.env.local` file.
3.  Fill in your actual Firebase project credentials in `.env.local`.

**IMPORTANT**: The `.env.local` file is listed in `.gitignore` and should never be committed to your repository. This keeps your credentials secure.

When deploying to a hosting provider like Netlify or Vercel, you must set these same environment variables in the provider's dashboard.

## Admin vs. Public Builds

To create a "public-only" version of the site for production (e.g., for your final client-facing site), you can use the `NEXT_PUBLIC_BUILD_MODE` environment variable.

-   **Admin & Preview (Default):** If this variable is not set, the app will be built in its default state, which includes the public portfolio and the "Accesso Admin" button. This is ideal for your Netlify admin panel.
-   **Public-Only Site:** Set the `NEXT_PUBLIC_BUILD_MODE` environment variable to `public` in your hosting provider's build settings. This will automatically hide the "Accesso Admin" button from the header, creating a clean version of the site for public viewing.
