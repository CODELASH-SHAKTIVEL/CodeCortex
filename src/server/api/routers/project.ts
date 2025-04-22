import { createTRPCRouter , protectedProcedure } from "@/server/api/trpc";
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
        .mutation(async ({ ctx , input }) => {
            ctx.user.id; // Access the user ID from the context
            ctx.user.email; // Access the user email from the context
            console.log("Creating project with input: ", input);
            return true;
          })
})