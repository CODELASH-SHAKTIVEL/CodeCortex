// utils/getUser.ts
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function getUser() {
  const { getUser: getKindeUser } = getKindeServerSession();
  const user = await getKindeUser();

  return user ?? null;
}
