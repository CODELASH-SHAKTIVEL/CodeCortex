import { db } from "@/server/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";

type Props = {};

const page = async ({}: Props) => {
  const { getUser, isAuthenticated } = getKindeServerSession();

  if (!(await isAuthenticated())) {
    return notFound(); // or redirect to login
  }

  const user = await getUser();

  if (!user || !user.email) {
    return notFound();
  }

  await db.user.upsert({
    where: {
      emailAddress: user.email,
    },
    update: {
      imageUrl: user.picture ?? "",
      firstName: user.given_name ?? "",
      lastName: user.family_name ?? "",
    },
    create: {
      id: user.id,
      emailAddress: user.email,
      imageUrl: user.picture ?? "",
      firstName: user.given_name ?? "",
      lastName: user.family_name ?? "",
    },
  });

  // ✅ Don't wrap this in try/catch
  return redirect("/dashboard");
};

export default page;
