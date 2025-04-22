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
      const userEmail = ctx.user.email; // Access the user email from the context
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

      return project;
    }),
});
