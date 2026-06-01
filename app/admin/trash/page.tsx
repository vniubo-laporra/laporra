"use client";

import { useEffect, useState } from "react";

export default function AdminTrashPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/trash")
      .then((res) => res.json())
      .then(setItems);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-black">Paperera</h1>
            <p className="text-slate-300">
              Prediccions eliminades de la llista principal. No s'han esborrat definitivament.
            </p>
          </div>

          <a
            href="/admin/submissions"
            className="rounded-2xl border border-slate-700 px-6 py-3 text-center font-black text-slate-300 hover:bg-slate-900"
          >
            Tornar a prediccions
          </a>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm uppercase tracking-widest text-slate-400">Total a paperera</p>
          <p className="text-4xl font-black text-red-300">{items.length}</p>
        </div>

        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={index} className="rounded-3xl border border-red-900/60 bg-slate-900 p-6">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-red-300">{item.nickname}</h2>
                  <p className="text-sm text-slate-400">
                    Eliminada: {new Date(item.deletedAt).toLocaleString("ca-AD")}
                  </p>
                  <p className="text-sm text-slate-500">
                    Enviada: {new Date(item.submittedAt).toLocaleString("ca-AD")}
                  </p>
                </div>
              </div>

              <pre className="max-h-[350px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-300">
                {JSON.stringify(item, null, 2)}
              </pre>
            </div>
          ))}

          {items.length === 0 && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
              La paperera esta buida.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}