import { db } from "@/server/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: Promise<{ projectId: string }>;
};

const JoinHandler = async (props: Props) => {
  const { projectId } = await props.params;

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) return redirect("/api/auth/login");

  const { id: userId, email, given_name: firstName, family_name: lastName, picture: imageUrl } = user;

  // Check if the user already exists in your database
  let dbUser = await db.user.findUnique({
    where: { id: userId },
  });

  if (!dbUser) {
    dbUser = await db.user.create({
      data: {
        id: userId,
        emailAddress: email ?? "",
        imageUrl: imageUrl ?? "",
        firstName: firstName ?? "",
        lastName: lastName ?? "",
      },
    });
  }

  // Check if the project exists
  const project = await db.project.findUnique({
    where: { id: projectId },
  });

  if (!project) return redirect("/dashboard");

  // Try to associate the user with the project
  try {
    await db.userToProject.create({
      data: {
        userId,
        projectId,
      },
    });
  } catch (error) {
    console.log("User already in project");
  }

  return redirect("/dashboard");
};

export default JoinHandler;
