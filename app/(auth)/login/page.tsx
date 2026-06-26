import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <>
      <h2 className="text-lg font-semibold mb-1">Welcome back</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Sign in to your Growthscape account
      </p>
      <LoginForm />
      <p className="text-sm text-muted-foreground text-center mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </>
  );
}
