"use client";

import ErrorMessage from "@/components/ErrorMessage";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginUserDataForm, loginUserSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function SignIn() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginUserDataForm>({
    resolver: zodResolver(loginUserSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (data: LoginUserDataForm) => {
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl,
      });

      if (result?.error) {
        toast.error("Sign-in failed", {
          description: "Invalid email or password. Please try again.",
        });
      } else {
        toast.success("You have been signed in.");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.log(error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="flex items-center justify-center">
      <Card className="w-[400px] shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">DriveClone</div>
          <CardTitle className="text-2xl font-bold">Welcome to DriveClone</CardTitle>
          <CardDescription>Sign in to access your files and folders</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="google">Google</TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <form onSubmit={onSubmit} className="space-y-4 mt-4">
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                      Forgot password?
                    </Link>
                  </div>
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
                <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="google">
              <div className="space-y-4 mt-4">
                <GoogleAuthButton label="Continue with Google" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-center text-sm">
            <p className="text-gray-500 mb-2">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign up
              </Link>
            </p>
            <p className="text-xs text-gray-400">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
