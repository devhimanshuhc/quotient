import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function getAuthSession() {
  return await getServerAuthSession();
}

export async function requireAuth() {
  const session = await getAuthSession();
  
  if (!session?.user) {
    return redirect("/sign-in");
  }
  
  return session;
}
