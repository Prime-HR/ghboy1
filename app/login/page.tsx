"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border bg-white p-7 shadow-sm">
        <p className="text-sm font-extrabold tracking-wide text-indigo-600">FASHION SELLER PRO</p>
        <h1 className="mt-4 text-3xl font-black tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to manage your fashion business.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold">Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email" className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Password</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required autoComplete="current-password" className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500" />
          </label>

          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

          <button disabled={loading} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New seller? <Link href="/signup" className="font-bold text-indigo-600 hover:underline">Create your account</Link>
        </p>
      </div>
    </main>
  );
}
