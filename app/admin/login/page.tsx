"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin/submissions";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setError("Contrasenya incorrecta.");
      return;
    }

    window.location.href = next;
  }

  return (
    <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
      <p className="mb-3 text-center text-sm font-black uppercase tracking-[0.35em] text-yellow-300">
        Laporra.ad
      </p>

      <h1 className="mb-6 text-center text-3xl font-black">
        Admin
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contrasenya"
          className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 font-bold outline-none focus:border-yellow-400"
        />

        {error && (
          <p className="text-center text-sm font-bold text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-2xl bg-gradient-to-r from-blue-600 via-yellow-400 to-red-600 px-8 py-4 font-black text-black"
        >
          Entrar
        </button>
      </form>
    </section>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white flex items-center justify-center">
      <Suspense fallback={<p>Carregant...</p>}>
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}