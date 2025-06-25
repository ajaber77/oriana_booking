
# Deploying Your Oriana Chalet Booking App to GitHub Pages

This guide will help you build your React application and deploy it as a static site to GitHub Pages.

GitHub Pages serves static files. Your current setup uses `index.html` which tries to load `index.tsx` directly. Browsers do not understand `.tsx` (TypeScript/JSX) files natively. Therefore, you **must build** your application into static HTML, JavaScript, and CSS files first.

## Step 1: Set Up a Build Process (If you haven't already)

If you started this project with a tool like Create React App (CRA), Vite, or Parcel, you likely already have a build command.

*   **Vite:** `npm run build` or `yarn build`
*   **Create React App:** `npm run build` or `yarn build`
*   **Parcel:** `npx parcel build src/index.html` (or your entry point)

If you don't have a build tool, you'll need to set one up. **Vite** is a modern and fast option for React projects:
1.  Initialize Vite in your project (if not done): Follow Vite's official guide.
2.  Ensure your `index.html` is the entry point or configure Vite accordingly.
3.  Vite will typically build your project into a `dist` folder.

**Ensure your `index.html` file in the build output correctly links to the generated JavaScript and CSS bundles.** Your build tool usually handles this automatically. The `<script type="module" src="/index.tsx"></script>` line will be replaced by a link to a bundled `.js` file.

## Step 2: Build Your Application

Run the build command provided by your chosen build tool. For example:

```bash
npm run build
# or
yarn build
```

This command will typically create a folder named `dist` (for Vite, Parcel) or `build` (for Create React App) in your project's root. This folder contains the static `index.html`, JavaScript bundles, CSS files, and any other assets ready for deployment.

## Step 3: Deploy to GitHub Pages

There are several ways to deploy to GitHub Pages. Here are two common methods:

### Method A: Deploying from a `/docs` folder on your `main` branch (Manual)

1.  **Configure Build Output (Optional but Recommended):**
    If your build tool allows, configure it to output the build files directly into a folder named `docs` at the root of your project. For Vite, you can set `build.outDir = 'docs'` in your `vite.config.ts` file. Then run your build command.
    If you cannot configure the output directory, after building (e.g., to a `dist` folder), **copy the entire contents** of your build output folder (e.g., everything inside `dist`) into a new folder named `docs` at the root of your repository.

2.  **Adjust Base Path in `index.html` (If Necessary):**
    GitHub Pages often serves your site from a subpath, like `https://<YOUR_USERNAME>.github.io/<YOUR_REPOSITORY_NAME>/`.
    If your `index.html` file in the `docs` folder (or build output) uses absolute paths for assets (e.g., `/main.js`), you might need to adjust them to be relative or configure a `base` path in your build tool.
    For Vite, set `base: '/<YOUR_REPOSITORY_NAME>/'` in `vite.config.ts` before building.
    For Create React App, add `"homepage": "https://<YOUR_USERNAME>.github.io/<YOUR_REPOSITORY_NAME>"` to your `package.json` before building.

3.  **Commit and Push:**
    Add the `docs` folder (containing your built static site) to Git, commit the changes, and push them to your `main` (or `master`) branch on GitHub.

    ```bash
    git add docs
    git commit -m "Add/update built site for GitHub Pages"
    git push origin main
    ```

4.  **Configure GitHub Pages Settings:**
    *   Go to your GitHub repository.
    *   Click on "Settings" (the gear icon).
    *   In the left sidebar, navigate to "Pages" under the "Code and automation" section.
    *   Under "Build and deployment":
        *   For "Source", select "Deploy from a branch".
        *   For "Branch", select your `main` (or `master`) branch and the `/docs` folder from the dropdown.
    *   Click "Save".

    GitHub will now publish your site. It might take a few minutes for the site to become live. You'll find the URL on the same GitHub Pages settings page.

### Method B: Using the `gh-pages` npm package (Automated)

This method is often easier for React projects.

1.  **Install `gh-pages`:**
    ```bash
    npm install --save-dev gh-pages
    # or
    yarn add --dev gh-pages
    ```

2.  **Add a Deploy Script to `package.json`:**
    Open your `package.json` file and add the following scripts. Adjust `YOUR_USERNAME` and `YOUR_REPOSITORY_NAME`. If your build output folder is not `build`, change `build` in the `deploy` script accordingly (e.g., to `dist`).

    ```json
    {
      "name": "your-app-name",
      "version": "0.1.0",
      "homepage": "https://<YOUR_USERNAME>.github.io/<YOUR_REPOSITORY_NAME>", // Important for CRA
      "scripts": {
        "start": "...", // Your existing start script
        "build": "...", // Your existing build script (e.g., "vite build" or "react-scripts build")
        "predeploy": "npm run build", // Or yarn build
        "deploy": "gh-pages -d build" // Change 'build' to 'dist' if that's your output folder
      }
    }
    ```
    *   The `homepage` field is particularly important for Create React App to ensure assets are linked correctly. For Vite, you'd set the `base` property in `vite.config.js` or `vite.config.ts` to `/<YOUR_REPOSITORY_NAME>/`.

3.  **Run the Deploy Script:**
    ```bash
    npm run deploy
    # or
    yarn deploy
    ```
    This command will first build your application (due to `predeploy`) and then push the contents of your build folder (`build` or `dist`) to a special `gh-pages` branch on your GitHub repository.

4.  **Configure GitHub Pages Settings:**
    *   Go to your GitHub repository.
    *   Click on "Settings".
    *   Navigate to "Pages".
    *   Under "Build and deployment":
        *   For "Source", select "Deploy from a branch".
        *   For "Branch", select the `gh-pages` branch and `/ (root)` folder.
    *   Click "Save".

    Your site should be published shortly.

## Important Considerations:

*   **Client-Side Routing:** If your app uses client-side routing (e.g., with React Router), you might need to add a `404.html` file (a copy of your `index.html`) to your build output / `docs` folder or `gh-pages` branch. This helps GitHub Pages redirect all paths to your `index.html` so React Router can handle them. Some build tools or deployment scripts handle this.
*   **API Keys (`process.env.API_KEY`):** Your application structure (and the Gemini API guidelines) mentions obtaining the API key from `process.env.API_KEY`. On a purely static hosting platform like GitHub Pages, there is no server-side "environment" where `process.env` variables are typically set and accessed securely at runtime.
    *   **Directly embedding a sensitive API key into your client-side JavaScript bundle (which would happen if a build tool substitutes `process.env.API_KEY` at build time) is a major security risk, as it becomes publicly visible.**
    *   For applications requiring API keys on the client-side, the secure approach is usually to route API calls through a backend proxy or serverless function that can securely store and use the API key. The client calls your proxy, and your proxy calls the external API.
    *   **The constraint that the API key *must* come from `process.env.API_KEY` and is "pre-configured" is challenging for a static deployment model.** If this is for a demo and you are using a key with restricted permissions specifically for this client-side application, be fully aware of the exposure. Otherwise, you will need to implement a backend component to handle API requests securely, which is beyond the scope of a simple GitHub Pages deployment.

By following these steps, you should be able to get your Oriana Chalet Booking application live on GitHub Pages, keeping in mind the build requirements and API key security.
