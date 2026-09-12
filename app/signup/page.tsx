"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", businessName: "", whatsapp: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Unable to create your account.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Account created, but automatic sign-in failed. Please sign in manually.");
      setLoading(false);
      router.push("/login");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border bg-white p-7 shadow-sm">
        <p className="text-sm font-extrabold tracking-wide text-indigo-600">FASHION SELLER PRO</p>
        <h1 className="mt-4 text-3xl font-black tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-slate-500">Set up your seller account and business in one step.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold">Your name</span>
            <input value={form.name} onChange={(e) => update("name", e.target.value)} required autoComplete="name" className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Business name</span>
            <input value={form.businessName} onChange={(e) => update("businessName", e.target.value)} required className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Email</span>
            <input value={form.email} onChange={(e) => update("email", e.target.value)} type="email" required autoComplete="email" className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Password</span>
            <input value={form.password} onChange={(e) => update("password", e.target.value)} type="password" required minLength={8} autoComplete="new-password" className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500" />
            <span className="mt-1 block text-xs text-slate-500">Use at least 8 characters.</span>
          </label>
          <label className="block">
            <span className="text-sm font-semibold">WhatsApp number <span className="font-normal text-slate-400">(optional)</span></span>
            <input value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} type="tel" autoComplete="tel" placeholder="024 000 0000" className="mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500" />
          </label>

          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

          <button disabled={loading} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link href="/login" className="font-bold text-indigo-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
