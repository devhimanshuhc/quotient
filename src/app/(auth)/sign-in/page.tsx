import { getAuthSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import SignInClient from "./SignInClient";

export default async function SignInPage() {
  const session = await getAuthSession();

  if (session?.user) {
    return redirect("/dashboard");
  }

  return <SignInClient />;
}