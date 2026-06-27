"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "../schemas";
import { useSupabase } from "@/providers/supabase-provider";
import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function SignupForm() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    try {
      const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { name: data.name },
        },
      });
      if (signUpError) throw signUpError;

      // If session exists (email confirmation disabled), create workspace and redirect
      if (signUpData.session) {
        const slug = data.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString(36);
        const createRes = await fetch("/api/v1/workspaces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${data.name}'s Workspace`,
            slug,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          }),
        });

        const createData = await createRes.json();
        if (!createData.success) {
          toast.warning("Account created but workspace setup failed.");
        }

        toast.success("Account created! Welcome to Growthscape.");
        router.push("/dashboard");
        router.refresh();
      } else {
        // Email confirmation required
        toast.success("Account created! Check your email to verify, then sign in.");
        router.push("/login");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Name" error={errors.name?.message} required>
        <Input placeholder="John Doe" {...register("name")} autoComplete="name" />
      </FormField>

      <FormField label="Email" error={errors.email?.message} required>
        <Input type="email" placeholder="you@example.com" {...register("email")} autoComplete="email" />
      </FormField>

      <FormField label="Password" error={errors.password?.message} required>
        <Input type="password" placeholder="••••••••" {...register("password")} autoComplete="new-password" />
      </FormField>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Create account
      </Button>
    </form>
  );
}
