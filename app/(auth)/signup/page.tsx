import Link from "next/link";
import { SignupForm } from "@/features/auth/components/signup-form";

export default function SignupPage() {
  return (
    <>
      <h2 className="text-lg font-semibold mb-1">Create your account</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Start managing your social media with AI
      </p>
      <SignupForm />
      <p className="text-sm text-muted-foreground text-center mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </>
  );
}
