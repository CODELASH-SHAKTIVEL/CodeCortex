import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/githubrepo-loader";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        repoUrl: z.string(),
        projectName: z.string(),
        githubToken: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id; // Access the user ID from the context
      // Validate the input data
      console.log("Creating project with input: ", input);

      // Step 1: Create the project
      const project = await ctx.db.project.create({
        data: {
          name: input.projectName,
          githuburl: input.repoUrl,
          // Add any other fields necessary for creating a project
        },
      });

      // Step 2: Create a UserToProject entry to link the user to the project
      await ctx.db.userToProject.create({
        data: {
          userId, // Use the user ID from the context
          projectId: project.id, // Link the project with the newly created project ID
        },
      });

      await indexGithubRepo(
        project.id, input.repoUrl, input.githubToken
      ); // Call the indexGithubRepo function with the project ID, GitHub URL, and token
      await pollCommits(project.id); // Call the pollCommits function with the project ID and GitHub token
      return project;
    }),

  getProjects: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id; // Access the user ID from the context
    // Fetch projects associated with the user
    const projects = await ctx.db.project.findMany({
      where: {
        UserToProject: {
          some: {
            userId: userId, // Filter projects by the user's ID
          },
        },
        DeletedAt: null // Ensure the project is not deleted
      },
    });

    return projects;
  }),

  getCommits: protectedProcedure
    .input(z.object({
      projectId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      pollCommits(input.projectId); // Call the pollCommits function with the project ID
      return await ctx.db.commit.findMany({
        where: {
          projectId: input.projectId,
        },
      });
    }),

    saveAnswer: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        filesReferences: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.question.create({
        data: {
          answer: input.answer,
          filesReferences: input.filesReferences,
          projectId: input.projectId,
          question: input.question,
          userId: ctx.user.id!,
        },
      });
    }),
    
    getQuestions: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.question.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

    getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user.id;
    
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          imageUrl: true,
          firstName: true,
          lastName: true,
          emailAddress: true,
          credits: true,
        },
      });
    
      return user;
    }),
    uploadMeeting: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        meetingUrl: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db.meeting.create({
        data: {
          meetingUrl: input.meetingUrl,
          projectId: input.projectId,
          name: input.name,
          status: "PROCESSING",
        },
      });
      return meeting;
    }),
});
