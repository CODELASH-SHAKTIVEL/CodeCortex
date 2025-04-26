import { db } from '@/server/db';
import {Octokit} from 'octokit';
import axios from 'axios';
import { aisummarisecommit } from './gemini';

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

// const githubUrl = 'https://github.com/CODELASH-SHAKTIVEL/Incognito_feedback'

type Response = {
    commitHash: string;
    commitMessage: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string;
}

export const getCommitHashes = async (githubUrl: string): Promise<Response[]> =>{
    const [owner, repo] = githubUrl.split("/").slice(-2);
    if (!owner || !repo) {
      throw new Error("Invalid github url");
    }
  
    const { data } = await octokit.rest.repos.listCommits({
      owner,
      repo,
    });
  
    const sortedCommits = data.sort(
      (a: any, b: any) =>
        new Date(b.commit.author.date).getTime() -
        new Date(a.commit.author.date).getTime(),
    ) as any[];

    // console.log( " sorted commits " , sortedCommits)
    // Sort commits by date in descending order
  
    return sortedCommits.slice(0, 10).map((commit: any) => ({
      commitHash: commit.sha as string,
      commitMessage: commit.commit?.message ?? "",
      commitAuthorName: commit.commit?.author?.name ?? "",
      commitAuthorAvatar: commit.author?.avatar_url ?? "",
      commitDate: commit.commit?.author?.date ?? "",
    }));
    
}

// poll the lastest and unsaved commits from the github repo
// and save them to the database
export const  pollCommits = async (projectId: string) => {
  const { project , githubUrl } = await fetchProjectGithubUrl(projectId);

  const commitHashes = await getCommitHashes(githubUrl);

  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  );
  
  const summarisedCommits = await Promise.allSettled(
    unprocessedCommits.map((commit) => {
      return summariseCommit(githubUrl, commit.commitHash);
    }
  ));

  const summarises = summarisedCommits.map((commit) => {
    if (commit.status === "fulfilled") {
      return commit.value as string;
    } else {
      console.error("Error summarising commit", commit.reason);
      return null;
    }
  });
 
  const commits = await db.commit.createMany({
    data: summarises.map((summary, index) => {
      console.log("processing commit", unprocessedCommits[index]);
      return {
        projectId: projectId,
        commitHash: unprocessedCommits[index]!.commitHash,
        commitMessage: unprocessedCommits[index]!.commitMessage,
        commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
        commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
        commitDate: unprocessedCommits[index]!.commitDate,
        summary: summary ?? "", // <-- if summary is null, use empty string
      };
    }),
  });
  
  
  console.log("summarised commits", summarisedCommits);
  console.log("data", project , githubUrl);
  console.log("commit hashes", commitHashes);
  console.log("unprocessed commits", unprocessedCommits);
  console.log("summarised commits", summarises);
  console.log("commits", commits);
  
  return commits;
}

const summariseCommit = async (githubUrl: string  , commitHash : string) => {
  const {data} = await axios.get(
    `${githubUrl}/commit/${commitHash}.diff`,{
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    },
    )
    return await aisummarisecommit(data);
}

// Fetch the project from the database using the projectId before calling the function of poll commits 
export const fetchProjectGithubUrl = async (projectId: string) => {
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      id: true,
      githuburl : true,
    },
  });

  if (!project?.githuburl) {
    throw new Error("Project has no github URL");
  }

  return { project, githubUrl: project?.githuburl };
}

export const filterUnprocessedCommits = async ( projectId : string,  commitHashes: Response[]) => {
  const processedCommits = await db.commit.findMany({
    where: {
      projectId,
    },
    select: {
      commitHash: true,
    },
  });

  const processedCommitHashes = processedCommits.map(
    (commit) => commit.commitHash,
  );

  return commitHashes.filter(
    (commit) => !processedCommitHashes.includes(commit.commitHash), // always return unprocessed commits means false onces
  );
}
 
// await pollCommits('cm9spv3i80000tx1kvlvy6oo5')