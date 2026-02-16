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
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SignInState = {
	email: string
	password: string
	rememberMe: boolean
}

export function SignInForm() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const callbackURL = searchParams.get("callbackURL") ?? "/"

	const [formState, setFormState] = useState<SignInState>({
		email: "",
		password: "",
		rememberMe: true,
	})
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleChange = (key: keyof SignInState, value: string | boolean) => {
		setFormState((prev) => ({ ...prev, [key]: value }))
	}

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setErrorMessage(null)
		setIsSubmitting(true)

		try {
			const result = await authClient.signIn.email({
				email: formState.email,
				password: formState.password,
				rememberMe: formState.rememberMe,
				callbackURL,
			})

			if (result?.error) {
				setErrorMessage(result.error.message ?? "Unable to sign in.")
				return
			}

			if (result?.data?.redirect && result.data.url) {
				window.location.href = result.data.url
				return
			}

			router.push(callbackURL)
			router.refresh()
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unable to sign in."
			setErrorMessage(message)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Card className="mx-auto w-full max-w-md">
			<CardHeader>
				<CardTitle>Sign in</CardTitle>
				<CardDescription>
					Use your email and password to access your account.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-4" onSubmit={handleSubmit}>
					{errorMessage ? (
						<Alert variant="destructive">
							<AlertTitle>Sign in failed</AlertTitle>
							<AlertDescription>{errorMessage}</AlertDescription>
						</Alert>
					) : null}

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
							autoComplete="current-password"
							value={formState.password}
							onChange={(event) => handleChange("password", event.target.value)}
							required
						/>
					</div>

					<div className="flex items-center gap-2">
						<Checkbox
							checked={formState.rememberMe}
							onCheckedChange={(value) => handleChange("rememberMe", !!value)}
							aria-label="Remember me"
						/>
						<Label className="text-sm text-muted-foreground">
							Remember me
						</Label>
					</div>

					<Button type="submit" className="w-full" disabled={isSubmitting}>
						{isSubmitting ? "Signing in..." : "Sign in"}
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
