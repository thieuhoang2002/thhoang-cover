
# thhoang cover - Music Portfolio

A luxury, minimalist music portfolio built with React 18, Vite, and Tailwind CSS.

## Features
- Glassmorphism UI
- Dark Luxury Aesthetics
- Responsive Design (Mobile & Desktop)
- Smooth Audio Playback Logic
- Spinning Disc Animations

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install lucide-react
   ```

2. **Run Local Development**
   ```bash
   npm run dev
   ```

## Deployment to GitHub Pages

To deploy this project to GitHub Pages:

1. **Update `vite.config.ts`**
   Ensure the `base` property matches your repository name:
   `base: '/your-repo-name/'`

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Install the `gh-pages` package**
   ```bash
   npm install gh-pages --save-dev
   ```

4. **Update `package.json` scripts**
   Add these two lines to your `scripts` section:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

5. **Run the deployment command**
   ```bash
   npm run deploy
   ```

6. **GitHub Settings**
   Go to your GitHub repository -> Settings -> Pages. Select the `gh-pages` branch as the source for your site.

---
Developed by **thhoang cover**.
