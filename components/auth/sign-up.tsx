"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SignUpState = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackURL = searchParams.get("callbackURL") ?? "/"

  const [formState, setFormState] = useState<SignUpState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (key: keyof SignUpState, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    if (formState.password !== formState.confirmPassword) {
      setErrorMessage("Passwords do not match.")
      return
    }

    if (formState.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await authClient.signUp.email({
        name: formState.name,
        email: formState.email,
        password: formState.password,
        callbackURL,
      })

      if (result?.error) {
        setErrorMessage(result.error.message ?? "Unable to sign up.")
        return
      }

      // @ts-expect-error
      if (result?.data?.redirect && result.data.url) {
        // @ts-expect-error
        window.location.href = result.data.url
        return
      }

      router.push(callbackURL)
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign up."
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          Sign up with your email and password to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertTitle>Sign up failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              value={formState.name}
              onChange={(event) => handleChange("name", event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={formState.email}
              onChange={(event) => handleChange("email", event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              value={formState.password}
              onChange={(event) => handleChange("password", event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              autoComplete="new-password"
              value={formState.confirmPassword}
              onChange={(event) =>
                handleChange("confirmPassword", event.target.value)
              }
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
