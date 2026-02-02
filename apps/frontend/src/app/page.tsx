import Image from "next/image";
import LoginForm from "@/components/auth/login-form";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromToken } from "@/utils/auth";
import Link from "next/link";

export default async function LoginPage() {
  const token = (await cookies()).get("token")?.value || "";
  const user = getUserFromToken(token);
  if (user) {
    redirect("/dashboard");
  }
  return (
    <div className="container font-dmSans relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r border-border">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image
            src="/logo.png"
            alt="Logo"
            width={200}
            height={200}
            className="mr-2"
          />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This inventory system has transformed how we manage our
              multi-store operations, making it seamless and efficient.&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <LoginForm />
        </div>
      </div>
     
    </div>
  );
}
