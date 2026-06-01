"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IdentifyPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const cleanName = nickname.trim();

    if (!cleanName) {
      setError("Has d'introduir un nickname per continuar.");
      return;
    }

    localStorage.setItem("laporra_nickname", cleanName);

    await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nickname: cleanName,
        createdAt: new Date().toISOString(),
      }),
    });

    router.push("/real/groups/a");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <section className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
        <p className="mb-3 text-center text-sm font-bold uppercase tracking-[0.35em] text-yellow-300">
          🏆 Mundial 2026
        </p>

        <h1 className="mb-4 text-center text-4xl font-black">
          Com et dius?
        </h1>

        <p className="mb-8 text-center text-slate-300">
          Introdueix un nickname per començar la teva porra.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setError("");
            }}
            placeholder="El teu nickname"
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 text-lg font-bold text-white outline-none focus:border-yellow-400"
          />

          {error && (
            <p className="text-center text-sm font-bold text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 via-yellow-400 to-red-600 px-8 py-4 text-lg font-black text-black shadow-lg transition hover:scale-105"
          >
            Continuar
          </button>
        </form>
      </section>
    </main>
  );
}
