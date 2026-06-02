"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function EditSubmissionPage() {
  const params = useParams();
  const nickname = decodeURIComponent(String(params.nickname || ""));

  const [groups, setGroups] = useState("{}");
  const [groupTables, setGroupTables] = useState("{}");
  const [knockout, setKnockout] = useState("{}");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/submissions/item?nickname=${encodeURIComponent(nickname)}`)
      .then((res) => {
        if (!res.ok) throw new Error("not-found");
        return res.json();
      })
      .then((data) => {
        setGroups(JSON.stringify(data.groups || {}, null, 2));
        setGroupTables(JSON.stringify(data.group_tables || data.groupTables || {}, null, 2));
        setKnockout(JSON.stringify(data.knockout || {}, null, 2));
      })
      .catch(() => setError("No s'ha trobat la prediccio."));
  }, [nickname]);

  async function save() {
    setError("");
    setSaved(false);

    let parsedGroups;
    let parsedGroupTables;
    let parsedKnockout;

    try {
      parsedGroups = JSON.parse(groups);
      parsedGroupTables = JSON.parse(groupTables);
      parsedKnockout = JSON.parse(knockout);
    } catch {
      setError("Hi ha algun JSON mal escrit. Revisa comes, claus i cometes.");
      return;
    }

    const res = await fetch("/api/submissions/item", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname,
        groups: parsedGroups,
        group_tables: parsedGroupTables,
        knockout: parsedKnockout,
      }),
    });

    if (!res.ok) {
      setError("No s'ha pogut guardar.");
      return;
    }

    setSaved(true);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <a
          href="/admin/submissions"
          className="mb-6 inline-block rounded-2xl border border-slate-700 px-5 py-3 font-bold text-slate-300 hover:bg-slate-900"
        >
          Tornar a prediccions
        </a>

        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="mb-2 text-sm font-black uppercase tracking-[0.35em] text-yellow-300">
            Editar prediccio
          </p>

          <h1 className="text-4xl font-black">{nickname}</h1>

          <p className="mt-3 text-slate-300">
            Fes modificacions puntuals. Si canvies resultats de grup, revisa tambe la classificacio del grup si afecta el quadre.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 font-bold text-red-300">
            {error}
          </div>
        )}

        {saved && (
          <div className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 font-bold text-emerald-300">
            Canvis guardats correctament.
          </div>
        )}

        <div className="grid gap-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-3 text-xl font-black text-yellow-300">Resultats fase de grups</h2>
            <textarea
              value={groups}
              onChange={(e) => setGroups(e.target.value)}
              className="h-[320px] w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 font-mono text-xs text-slate-200 outline-none focus:border-yellow-400"
            />
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-3 text-xl font-black text-yellow-300">Classificacions de grup</h2>
            <textarea
              value={groupTables}
              onChange={(e) => setGroupTables(e.target.value)}
              className="h-[320px] w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 font-mono text-xs text-slate-200 outline-none focus:border-yellow-400"
            />
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-3 text-xl font-black text-yellow-300">Eliminatories</h2>
            <textarea
              value={knockout}
              onChange={(e) => setKnockout(e.target.value)}
              className="h-[320px] w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 font-mono text-xs text-slate-200 outline-none focus:border-yellow-400"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={save}
            className="rounded-2xl bg-gradient-to-r from-blue-600 via-yellow-400 to-red-600 px-8 py-4 font-black text-black"
          >
            Guardar canvis
          </button>
        </div>
      </section>
    </main>
  );
}