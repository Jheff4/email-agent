import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useLogin } from "@/hooks/use-auth";
import { useAuthProvider } from "@/Providers/hooks";

const schema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const [authError, setAuthError] = useState<string>("");
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const { refetch } = useAuthProvider();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    document.title = "Login | Staff Monitor";
  }, []);

  const onSubmit = async (values: FormValues) => {
    setAuthError("");

    try {
      const result = await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });
      console.log("Login successful:", result.message);
      await refetch();
      navigate("/");
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.response?.status === 401) {
        setAuthError("Invalid email or password");
      } else {
        setAuthError("Login failed. Please try again.");
      }
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
          >
            {/* Display error message */}
            {authError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {authError}
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="text"
                {...register("email")}
                placeholder="Enter your email"
                disabled={loginMutation.isPending}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                disabled={loginMutation.isPending}
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
