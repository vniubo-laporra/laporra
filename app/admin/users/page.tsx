"use client";

import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-4xl font-black">
          Administració
        </h1>

        <p className="mb-8 text-slate-300">
          Usuaris registrats i informació guardada.
        </p>

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
          <table className="w-full">
            <thead className="bg-slate-800 text-left">
              <tr>
                <th className="p-4">Nickname</th>
                <th className="p-4">Data registre</th>
                <th className="p-4">Dades</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user, index) => (
                <tr key={index} className="border-t border-slate-800">
                  <td className="p-4 font-bold text-yellow-300">
                    {user.nickname}
                  </td>
                  <td className="p-4 text-slate-300">
                    {new Date(user.createdAt).toLocaleString("ca-AD")}
                  </td>
                  <td className="p-4">
                    <pre className="max-w-xl overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-300">
                      {JSON.stringify(user.results, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400">
                    Encara no hi ha cap usuari registrat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
