# APITester Landing Page & Interactive Playground

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frdhmuhammad%2Fapitester-landingpage)

Official landing page and interactive playground for [APITester](https://github.com/rdhmuhammad/apitester) — the Git-native API client and Obsidian-style Markdown workspace for Windows and macOS.

Built with **React 19**, **Vite**, **Tailwind CSS v4**, and **TypeScript**.

---

## 🚀 Deploying to Vercel

### Option 1: Vercel Dashboard (Recommended — Zero Config)

1. Go to [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and select `rdhmuhammad/apitester-landingpage`.
3. Vercel automatically detects the **Vite** framework preset from `vercel.json`:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. (Optional) Configure environment variables in the Vercel dashboard if needed (see `.env.example`).
5. Click **Deploy**. Vercel will generate your live production URL (e.g., `https://apitester-landingpage.vercel.app`) with automatic preview deployments on every Pull Request.

---

### Option 2: Deploy via Vercel CLI

1. Install the Vercel CLI globally (or run with `npx`):
   ```bash
   npm i -g vercel
   ```

2. Log in to your Vercel account:
   ```bash
   vercel login
   ```

3. Deploy to preview:
   ```bash
   vercel
   ```

4. Deploy to production:
   ```bash
   vercel --prod
   ```

---

### Option 3: Automated CI/CD via GitHub Actions

This repository includes a pre-configured GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

To enable automated deployment via GitHub Actions:
1. In your Vercel account, create a Personal Access Token at **Settings > Tokens**.
2. Link your local project using `vercel link` to retrieve your `ORG_ID` and `PROJECT_ID` (found in `.vercel/project.json`).
3. In your GitHub repository, navigate to **Settings > Secrets and variables > Actions** and add:
   - `VERCEL_TOKEN`: Your Vercel personal token
   - `VERCEL_ORG_ID`: Your Vercel team/org ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID
4. Future pushes to `main` will automatically build, type-check, and deploy to Vercel production.

---

## 🛠️ Local Development

### Prerequisites

- Node.js 20+ or 22 LTS
- npm (or bun/pnpm)

### Setup

```bash
# Clone the repository
git clone https://github.com/rdhmuhammad/apitester-landingpage.git
cd apitester-landingpage

# Install dependencies
npm install

# Start local development server (http://localhost:3000)
npm run dev

# Run TypeScript type check
npm run lint

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 📁 Repository Structure

```
apitester-landingpage/
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI build check & Vercel deployment pipeline
├── public/                    # Static assets
├── src/
│   ├── components/            # React UI components (Playground, Bento, Showcase)
│   ├── data/                  # Mock seed workspace data
│   ├── utils/                 # Utility helpers & logic tests
│   ├── App.tsx                # Main landing page application
│   ├── index.css              # Global styles & Tailwind CSS v4 directives
│   └── main.tsx               # React DOM entry point
├── .env.example               # Reference environment variables
├── .vercelignore              # Files excluded from Vercel deployments
├── package.json               # Dependencies and build scripts
├── tsconfig.json              # TypeScript configuration
├── vercel.json                # Vercel deployment & routing configuration
└── vite.config.ts             # Vite configuration with Tailwind CSS plugin
```

---

## 📄 License

Licensed under the [Apache-2.0 License](LICENSE).
