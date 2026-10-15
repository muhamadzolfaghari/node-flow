import { fileURLToPath, URL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

function githubPagesSpaPlugin() {
  return {
    name: 'github-pages-spa',
    closeBundle() {
      try {
        const distDir = path.resolve(process.cwd(), 'dist');
        const indexHtml = path.join(distDir, 'index.html');
        const notFoundHtml = path.join(distDir, '404.html');
        const nojekyll = path.join(distDir, '.nojekyll');
        if (!fs.existsSync(distDir)) return;
        if (fs.existsSync(indexHtml) && !fs.existsSync(notFoundHtml)) {
          fs.copyFileSync(indexHtml, notFoundHtml);
        }
        if (!fs.existsSync(nojekyll)) {
          fs.writeFileSync(nojekyll, '# Disable Jekyll for GitHub Pages\n');
        }
      } catch (e) {
        console.warn('github-pages-spa hook warning:', e);
      }
    },
  };
}

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  const getBase = () => {
    if (isDev) return '/';
    if (process.env.VITE_BASE_URL) return process.env.VITE_BASE_URL;
    if (process.env.GITHUB_REPOSITORY) {
      const repoName = process.env.GITHUB_REPOSITORY.split('/')[1];
      return `/${repoName}/`;
    }
    return process.env.NODE_ENV === 'production' ? '/node-flow/' : '/';
  };

  return {
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    plugins: [
      tailwindcss(),
      react(),
      githubPagesSpaPlugin(),
    ],
    base: getBase(),
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
    },
  };
});

