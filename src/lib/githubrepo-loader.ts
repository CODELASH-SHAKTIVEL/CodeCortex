import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';

const LoadGithubRepo = async (githuburl: string, githubToken?: string) => {
  const loader = new GithubRepoLoader(githuburl, {
    branch: 'main',
    accessToken: githubToken || "",
    ignoreFiles: ['.gitignore', 'README.md' , 'LICENSE', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md' , 'package.json', 'package-lock.json', 'yarn.lock', 'yarn-error.log', 'yarn-debug.log', 'yarn.lock', 'pnpm-lock.yaml', 'pnpmfile.js', 'pnpmfile.cjs' , 'pnpmfile.mjs', 'pnpmfile.ts', 'pnpmfile.js', 'pnpmfile.cjs', 'pnpmfile.mjs', 'pnpmfile.ts', 'pnpmfile.js', 'pnpmfile.cjs', 'pnpmfile.mjs', 'pnpmfile.ts'],
    recursive: true,
    unknown: 'warn',
    maxConcurrency:5
  });
  const documents = await loader.load();
  return documents;
}

console.log(await LoadGithubRepo("https://github.com/CODELASH-SHAKTIVEL/Incognito_feedback"))