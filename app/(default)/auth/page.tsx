"use client";

import { Suspense, useState } from "react";
import { SignInForm } from "@/components/auth/sign-in";
import { SignUpForm } from "@/components/auth/sign-up";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="flex my-auto h-full grow flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4">
        {/* <div className="flex gap-2 rounded-lg border border-border bg-muted p-1">
          <Button
            variant={mode === "signin" ? "default" : "ghost"}
            className="flex-1"
            onClick={() => setMode("signin")}
          >
            Sign In
          </Button>
          <Button
            variant={mode === "signup" ? "default" : "ghost"}
            className="flex-1"
            onClick={() => setMode("signup")}
          >
            Sign Up
          </Button>
        </div> */}

        <Suspense fallback={<div>Loading...</div>}>
          {mode === "signin" ? <SignInForm /> : <SignUpForm />}
        </Suspense>
      </div>
    </div>
  );
}
