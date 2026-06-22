import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const wixConfig = JSON.parse(readFileSync(path.join(rootDir, 'wix.config.json'), 'utf8'));
const siteName = path.basename(rootDir);

const countFiles = (targetDir) => {
  const absoluteDir = path.join(rootDir, targetDir);

  try {
    return readdirSync(absoluteDir, { withFileTypes: true }).reduce((total, entry) => {
      const relativePath = path.join(targetDir, entry.name);
      if (entry.isDirectory()) {
        return total + countFiles(relativePath);
      }
      return total + 1;
    }, 0);
  } catch {
    return 0;
  }
};

const buildSummary = {
  generatedAt: new Date().toISOString(),
  siteId: wixConfig.siteId,
  uiVersion: wixConfig.uiVersion,
  fileCounts: {
    pages: countFiles('src/pages'),
    backend: countFiles('src/backend'),
    public: countFiles('src/public'),
    books: countFiles('books'),
  },
};

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

writeFileSync(
  path.join(distDir, 'site-build.json'),
  `${JSON.stringify(buildSummary, null, 2)}\n`,
  'utf8',
);

cpSync(path.join(rootDir, 'README.md'), path.join(distDir, 'README.md'));

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${siteName} build artifact</title>
    <style>
      :root {
        color-scheme: light dark;
        font-family: Arial, sans-serif;
      }

      body {
        margin: 0 auto;
        max-width: 48rem;
        padding: 2rem 1.5rem 4rem;
        line-height: 1.5;
      }

      code {
        background: rgba(127, 127, 127, 0.12);
        border-radius: 0.25rem;
        padding: 0.1rem 0.3rem;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>${siteName} build artifact</h1>
      <p>This repository is a Wix site project, so the CI build publishes a lightweight artifact for deployment previews and workflow validation.</p>
      <ul>
        <li><strong>Site ID:</strong> <code>${buildSummary.siteId}</code></li>
        <li><strong>UI version:</strong> <code>${buildSummary.uiVersion}</code></li>
        <li><strong>Generated:</strong> <code>${buildSummary.generatedAt}</code></li>
      </ul>
      <h2>Content summary</h2>
      <ul>
        <li>Page files: ${buildSummary.fileCounts.pages}</li>
        <li>Backend files: ${buildSummary.fileCounts.backend}</li>
        <li>Public files: ${buildSummary.fileCounts.public}</li>
        <li>Book content files: ${buildSummary.fileCounts.books}</li>
      </ul>
      <h2>Artifacts</h2>
      <ul>
        <li><a href="./site-build.json">Build metadata (JSON)</a></li>
        <li><a href="./README.md">Repository README</a></li>
      </ul>
    </main>
  </body>
</html>
`;

writeFileSync(path.join(distDir, 'index.html'), html, 'utf8');
