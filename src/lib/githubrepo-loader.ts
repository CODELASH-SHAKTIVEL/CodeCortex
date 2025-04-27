import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';
import { Document } from '@langchain/core/documents';
import { generateEmbedding, summariseCode } from './gemini';
import { db } from '@/server/db';

const LoadGithubRepo = async (githuburl: string, githubToken?: string) => {
  const loader = new GithubRepoLoader(githuburl, {
    branch: 'main',
    accessToken: githubToken || "",
    ignoreFiles: ['.gitignore', 'README.md', 'LICENSE', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'package.json', 'package-lock.json', 'yarn.lock', 'yarn-error.log', 'yarn-debug.log', 'yarn.lock', 'pnpm-lock.yaml', 'pnpmfile.js', 'pnpmfile.cjs', 'pnpmfile.mjs', 'pnpmfile.ts', 'pnpmfile.js', 'pnpmfile.cjs', 'pnpmfile.mjs', 'pnpmfile.ts', 'pnpmfile.js', 'pnpmfile.cjs', 'pnpmfile.mjs', 'pnpmfile.ts'],
    recursive: true,
    unknown: 'warn',
    maxConcurrency: 5
  });
  const documents = await loader.load();
  return documents;
}

// console.log(await LoadGithubRepo("https://github.com/CODELASH-SHAKTIVEL/Incognito_feedback"))

export const indexGithubRepo = async (projectId: string,githubUrl: string,githubToken?: string,) => {
  const docs = await LoadGithubRepo(githubUrl, githubToken);

  const allEmbeddings = await generateEmbeddings(docs);

  await Promise.allSettled(
    allEmbeddings.map(async (embedding, index) => {
      console.log(`processing ${index} of ${allEmbeddings.length}`);

      if (!embedding) return;

      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          summary: embedding.summary,
          sourceCode: embedding.sourceCode,
          fileName: embedding.fileName,
          projectId,
        },
      });

      await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding"=${embedding.embedding}::vector
        WHERE "id"=${sourceCodeEmbedding.id}
        `;
    }),
  );
};

const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(
    docs.map(async (doc) => {
      const summary = await summariseCode(doc);
      const embedding = await generateEmbedding(summary);

      return {
        summary,
        embedding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
        fileName: doc.metadata.source,
      };
    }),
  );
};
