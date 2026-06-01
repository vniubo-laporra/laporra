"use client";

import { useEffect, useState } from "react";

export default function ThanksPage() {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function submitPrediction() {
      const nickname = localStorage.getItem("laporra_nickname") || "";
      const groups = JSON.parse(localStorage.getItem("laporra_group_scores") || "{}");
      const groupTables = JSON.parse(localStorage.getItem("laporra_group_tables") || "{}");
      const knockout = JSON.parse(localStorage.getItem("laporra_knockout_scores") || "{}");

      await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname,
          groups,
          groupTables,
          knockout,
        }),
      });

      setSaved(true);
    }

    submitPrediction();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white flex items-center justify-center">
      <section className="max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center shadow-2xl">
        <p className="mb-3 text-sm font-black uppercase tracking-[0.35em] text-yellow-300">
          Laporra.ad
        </p>

        <h1 className="mb-6 text-4xl font-black">
          Prediccio finalitzada
        </h1>

        <p className="mb-4 text-lg text-slate-300">
          Gracies per participar a la porra del Mundial 2026.
        </p>

        <p className={saved ? "mb-6 font-bold text-emerald-400" : "mb-6 font-bold text-yellow-300"}>
          {saved ? "Prediccio guardada correctament." : "Guardant prediccio..."}
        </p>

        <div className="rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-5 text-left">
          <p className="font-black text-yellow-300">Recordatori important</p>
          <p className="mt-2 text-slate-200">
            La prediccio sera valida quan es rebi el Bizum al numero indicat per privat.
          </p>
        </div>

        <a
          href="/"
          className="mt-8 inline-flex rounded-2xl bg-gradient-to-r from-blue-600 via-yellow-400 to-red-600 px-8 py-4 font-black text-black"
        >
          Tornar a l'inici
        </a>
      </section>
    </main>
  );
}