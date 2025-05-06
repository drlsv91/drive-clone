"use client";

import ErrorMessage from "@/components/ErrorMessage";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showError } from "@/lib/utils";
import { RegisterUserDataForm, registerUserSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function SignUpForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterUserDataForm>({
    resolver: zodResolver(registerUserSchema),
  });

  const onSubmit = handleSubmit(async (data: RegisterUserDataForm) => {
    try {
      setIsSubmitting(true);

      await axios.post("/api/auth/register", data);
      toast.success("Registration successful", {
        description: "You can now sign in with your credentials.",
      });

      router.push("/signin");
    } catch (error: unknown) {
      showError(error);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="flex items-center justify-center">
      <Card className="w-[400px] shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">DriveClone</div>
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>Sign up to start using DriveClone</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register("name")}
                className={clsx({
                  "border border-red-500": !!errors.name?.message,
                })}
              />
              <ErrorMessage>{errors.name?.message}</ErrorMessage>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                className={clsx({
                  "border border-red-500": !!errors.email?.message,
                })}
              />
              <ErrorMessage>{errors.email?.message}</ErrorMessage>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className={clsx({
                  "border border-red-500": !!errors.password?.message,
                })}
              />
              <ErrorMessage>{errors.password?.message}</ErrorMessage>
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Confirm Password</Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                className={clsx({
                  "border border-red-500": !!errors.confirmPassword?.message,
                })}
              />
              <ErrorMessage>{errors.confirmPassword?.message}</ErrorMessage>
            </div>
            <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <GoogleAuthButton label="Sign up with Google" />
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-center text-sm">
            <p className="text-gray-500">
              Already have an account?{" "}
              <Link href="/signin" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SignUp() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
