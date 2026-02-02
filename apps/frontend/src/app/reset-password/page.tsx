import ResetPasswordForm from "@/components/auth/reset-password-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your password with a token",
};

export default function ResetPasswordPage() {
  return (
    <div className=" flex h-screen w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center sm:w-96 space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Reset Password
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new password for your account
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
