"use client";

import { useEffect, useState } from "react";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import { GROUPS } from "@/lib/groupsData";
import { getThirdPlaceBracket } from "@/lib/thirdPlaceMatrix";

function getWinner(match: any, scores: any) {
  if (!match || !match.home || !match.away) return null;
  const s = scores[match.id];
  if (!s || s.home === "" || s.away === "" || s.home === undefined || s.away === undefined) return null;

  const h = Number(s.home);
  const a = Number(s.away);

  if (h > a) return match.home;
  if (a > h) return match.away;

  return s.advancer || null;
}

function getLoser(match: any, scores: any) {
  const winner = getWinner(match, scores);
  if (!match || !winner) return null;
  return winner === match.home ? match.away : match.home;
}

function resolveSlot(slot: string, tables: any) {
  const pos = Number(slot[0]) - 1;
  const group = slot[1];
  return tables[group]?.[pos]?.team || null;
}

function getQualifiedThirdGroups(tables: any) {
  return Object.entries(tables)
    .map(([group, table]: any) => {
      const third = table?.[2];
      if (!third) return null;
      return { group, ...third };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return String(a.group).localeCompare(String(b.group));
    })
    .slice(0, 8)
    .map((x: any) => x.group);
}

function buildBracket(tables: any, scores: any) {
  const thirdGroups = getQualifiedThirdGroups(tables);
  if (thirdGroups.length < 8) return [];

  let matrix: any = null;

  try {
    matrix = getThirdPlaceBracket(thirdGroups).pairings;
  } catch {
    return [];
  }

  const round32 = [
    { id: "M73", round: "Setzens", home: resolveSlot("2A", tables), away: resolveSlot("2B", tables) },
    { id: "M74", round: "Setzens", home: resolveSlot("1E", tables), away: resolveSlot(matrix["1E"], tables) },
    { id: "M75", round: "Setzens", home: resolveSlot("1F", tables), away: resolveSlot("2C", tables) },
    { id: "M76", round: "Setzens", home: resolveSlot("1C", tables), away: resolveSlot("2F", tables) },
    { id: "M77", round: "Setzens", home: resolveSlot("1I", tables), away: resolveSlot(matrix["1I"], tables) },
    { id: "M78", round: "Setzens", home: resolveSlot("2E", tables), away: resolveSlot("2I", tables) },
    { id: "M79", round: "Setzens", home: resolveSlot("1A", tables), away: resolveSlot(matrix["1A"], tables) },
    { id: "M80", round: "Setzens", home: resolveSlot("1L", tables), away: resolveSlot(matrix["1L"], tables) },
    { id: "M81", round: "Setzens", home: resolveSlot("1D", tables), away: resolveSlot(matrix["1D"], tables) },
    { id: "M82", round: "Setzens", home: resolveSlot("1G", tables), away: resolveSlot(matrix["1G"], tables) },
    { id: "M83", round: "Setzens", home: resolveSlot("2K", tables), away: resolveSlot("2L", tables) },
    { id: "M84", round: "Setzens", home: resolveSlot("1H", tables), away: resolveSlot("2J", tables) },
    { id: "M85", round: "Setzens", home: resolveSlot("1B", tables), away: resolveSlot(matrix["1B"], tables) },
    { id: "M86", round: "Setzens", home: resolveSlot("1J", tables), away: resolveSlot("2H", tables) },
    { id: "M87", round: "Setzens", home: resolveSlot("1K", tables), away: resolveSlot(matrix["1K"], tables) },
    { id: "M88", round: "Setzens", home: resolveSlot("2D", tables), away: resolveSlot("2G", tables) },
  ];

  const byId = (list: any[], id: string) => list.find((m) => m.id === id);

  const r16 = [
    { id: "M89", round: "Vuitens", home: getWinner(byId(round32, "M74"), scores), away: getWinner(byId(round32, "M77"), scores) },
    { id: "M90", round: "Vuitens", home: getWinner(byId(round32, "M73"), scores), away: getWinner(byId(round32, "M75"), scores) },
    { id: "M91", round: "Vuitens", home: getWinner(byId(round32, "M76"), scores), away: getWinner(byId(round32, "M78"), scores) },
    { id: "M92", round: "Vuitens", home: getWinner(byId(round32, "M79"), scores), away: getWinner(byId(round32, "M80"), scores) },
    { id: "M93", round: "Vuitens", home: getWinner(byId(round32, "M83"), scores), away: getWinner(byId(round32, "M84"), scores) },
    { id: "M94", round: "Vuitens", home: getWinner(byId(round32, "M81"), scores), away: getWinner(byId(round32, "M82"), scores) },
    { id: "M95", round: "Vuitens", home: getWinner(byId(round32, "M86"), scores), away: getWinner(byId(round32, "M88"), scores) },
    { id: "M96", round: "Vuitens", home: getWinner(byId(round32, "M85"), scores), away: getWinner(byId(round32, "M87"), scores) },
  ];

  const quarters = [
    { id: "M97", round: "Quarts", home: getWinner(byId(r16, "M89"), scores), away: getWinner(byId(r16, "M90"), scores) },
    { id: "M98", round: "Quarts", home: getWinner(byId(r16, "M93"), scores), away: getWinner(byId(r16, "M94"), scores) },
    { id: "M99", round: "Quarts", home: getWinner(byId(r16, "M91"), scores), away: getWinner(byId(r16, "M92"), scores) },
    { id: "M100", round: "Quarts", home: getWinner(byId(r16, "M95"), scores), away: getWinner(byId(r16, "M96"), scores) },
  ];

  const semis = [
    { id: "M101", round: "Semifinals", home: getWinner(byId(quarters, "M97"), scores), away: getWinner(byId(quarters, "M98"), scores) },
    { id: "M102", round: "Semifinals", home: getWinner(byId(quarters, "M99"), scores), away: getWinner(byId(quarters, "M100"), scores) },
  ];

  const thirdPlace = [
    { id: "M103", round: "3r i 4t lloc", home: getLoser(byId(semis, "M101"), scores), away: getLoser(byId(semis, "M102"), scores) },
  ];

  const final = [
    { id: "M104", round: "Final", home: getWinner(byId(semis, "M101"), scores), away: getWinner(byId(semis, "M102"), scores) },
  ];

  return [...round32, ...r16, ...quarters, ...semis, ...thirdPlace, ...final];
}

function GroupsView({ item }: any) {
  const groups = item.group_tables || item.groupTables || {};

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Object.entries(groups)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([group, table]: any) => (
        <div key={group} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <h3 className="mb-3 text-lg font-black text-yellow-300">Grup {group}</h3>

          <table className="w-full text-xs">
            <thead className="text-slate-400">
              <tr>
                <th className="pb-2 text-left">#</th>
                <th className="pb-2 text-left">Equip</th>
                <th className="pb-2 text-center">PTS</th>
                <th className="pb-2 text-center">PJ</th>
                <th className="pb-2 text-center">GF</th>
                <th className="pb-2 text-center">DG</th>
              </tr>
            </thead>

            <tbody>
              {table.map((row: any, index: number) => (
                <tr key={row.team} className="border-t border-slate-800">
                  <td className="py-2 font-bold text-slate-500">{index + 1}</td>
                  <td className="py-2 font-bold">{row.team}</td>
                  <td className="py-2 text-center font-black text-yellow-300">{row.points}</td>
                  <td className="py-2 text-center text-slate-300">{row.played}</td>
                  <td className="py-2 text-center text-slate-300">{row.goalsFor}</td>
                  <td className="py-2 text-center text-slate-300">
                    {row.goalDiff > 0 ? "+" : ""}
                    {row.goalDiff}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}




function getVisualMatchOrder(group: string) {
  const specialOrder: any = {
    B: ["B5", "B6", "B1", "B2", "B3", "B4"],
    E: ["E1", "E2", "E5", "E6", "E3", "E4"],
    F: ["F1", "F2", "F5", "F6", "F3", "F4"],
    K: ["K5", "K6", "K1", "K2", "K3", "K4"],
  };

  return specialOrder[group] || [
    `${group}1`,
    `${group}2`,
    `${group}3`,
    `${group}4`,
    `${group}5`,
    `${group}6`,
  ];
}

function sortMatchesByVisualOrder(group: string, entries: any[]) {
  const order = getVisualMatchOrder(group);

  return entries.sort(([a], [b]) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);

    if (ia === -1 && ib === -1) return String(a).localeCompare(String(b));
    if (ia === -1) return 1;
    if (ib === -1) return -1;

    return ia - ib;
  });
}
function getMatchInfo(group: string, matchId: string) {
  const teams = GROUPS[group];
  if (!teams) return null;

  const matches: any = {
    [`${group}1`]: { home: teams[0], away: teams[1] },
    [`${group}2`]: { home: teams[2], away: teams[3] },
    [`${group}3`]: { home: teams[0], away: teams[2] },
    [`${group}4`]: { home: teams[1], away: teams[3] },
    [`${group}5`]: { home: teams[0], away: teams[3] },
    [`${group}6`]: { home: teams[1], away: teams[2] },
  };

  return matches[matchId] || null;
}
function GroupScoresView({ item }: any) {
  const groups = item.groups || {};

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Object.entries(groups)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([group, matches]: any) => (
        <div key={group} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <h3 className="mb-3 text-lg font-black text-yellow-300">
            Grup {group}
          </h3>

          <div className="space-y-2 text-sm">
            {Object.entries(matches)
              .sort(([a], [b]) => {
                const order = getVisualMatchOrder(group);
                const ia = order.indexOf(a);
                const ib = order.indexOf(b);
                return ia - ib;
              })
              .map(([matchId, score]: any) => (
              <div
                key={matchId}
                className="flex items-center justify-between border-b border-slate-800 pb-2 last:border-b-0"
              >
                <span className="font-bold text-slate-300">
                  {(() => {
                    const info = getMatchInfo(group, matchId);
                    if (!info) return matchId;
                    return `${info.home} - ${info.away}`;
                  })()}
                </span>

                <span className="font-black text-white">
                  {score.home ?? "-"} - {score.away ?? "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
function KnockoutView({ item }: any) {
  const knockout = item.knockout || {};
  const bracket = buildBracket(item.group_tables || item.groupTables || {}, knockout);
  const rounds = ["Setzens", "Vuitens", "Quarts", "Semifinals", "3r i 4t lloc", "Final"];

  return (
    <div className="space-y-6">
      {rounds.map((round) => (
        <div key={round} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <h3 className="mb-3 text-lg font-black text-yellow-300">{round}</h3>

          <table className="w-full text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="pb-3 text-left">Partit</th>
                <th className="pb-3 text-left">Equip 1</th>
                <th className="pb-3 text-center">Resultat</th>
                <th className="pb-3 text-left">Equip 2</th>
                <th className="pb-3 text-left">Passa</th>
              </tr>
            </thead>

            <tbody>
              {bracket
                .filter((m: any) => m.round === round)
                .map((match: any) => {
                  const score = knockout[match.id] || {};
                  const winner = getWinner(match, knockout);

                  return (
                    <tr key={match.id} className="border-t border-slate-800">
                      <td className="py-3 font-bold text-slate-500">{match.id}</td>
                      <td className="py-3 font-bold">{match.home || "Pendent"}</td>
                      <td className="py-3 text-center font-black">
                        {score.home ?? "-"} - {score.away ?? "-"}
                      </td>
                      <td className="py-3 font-bold">{match.away || "Pendent"}</td>
                      <td className="py-3 font-bold text-emerald-300">{winner || "-"}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default function AdminSubmissionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [validated, setValidated] = useState<any>({});

  useEffect(() => {
    fetch("/api/submissions")
      .then((res) => res.json())
      .then((data) => {
        setItems(data);

        const initialValidated: any = {};
        data.forEach((item: any) => {
          initialValidated[item.nickname] = !!item.validated;
        });
        setValidated(initialValidated);
      });
  }, []);

  async function toggleValidated(nickname: string, value: boolean) {
    setValidated({
      ...validated,
      [nickname]: value,
    });

    await fetch("/api/submissions/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nickname,
        validated: value,
      }),
    });

    setItems(
      items.map((item) =>
        item.nickname === nickname
          ? {
              ...item,
              validated: value,
              validatedAt: value ? new Date().toISOString() : null,
            }
          : item
      )
    );
  }

  async function deleteSubmission(nickname: string) {
    const confirmed = window.confirm(`Segur que vols moure a la paperera la prediccio de ${nickname}?`);

    if (!confirmed) return;

    await fetch("/api/submissions", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nickname }),
    });

    setItems(items.filter((item) => item.nickname !== nickname));

    if (openIndex !== null) {
      setOpenIndex(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex justify-end">
          <AdminLogoutButton />
        </div>
        <h1 className="mb-2 text-4xl font-black">Prediccions finalitzades</h1>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-slate-300">
            Aqui nomes apareixen les prediccions dels usuaris que han arribat a la pagina d'agraiment.
          </p>

          <a
            href="/admin/trash"
            className="rounded-2xl border border-red-500/40 px-5 py-3 text-sm font-black text-red-300 hover:bg-red-950/30"
          >
            Veure paperera
          </a>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm uppercase tracking-widest text-slate-400">Total prediccions</p>
          <p className="text-4xl font-black text-yellow-300">{items.length}</p>
        </div>

        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={index} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full flex-col gap-2 text-left md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!validated[item.nickname]}
                      onChange={(e) =>
                        toggleValidated(item.nickname, e.target.checked)
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="h-6 w-6 cursor-pointer accent-emerald-500"
                    />

                    <h2 className="text-2xl font-black text-yellow-300">
                      {item.nickname}
                    </h2>

                    {validated[item.nickname] && (
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-300">
                        Validada
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">
                    {new Date(item.submittedAt).toLocaleString("ca-AD")}
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-black text-slate-300">
                    {openIndex === index ? "Amagar" : "Veure prediccio"}
                  </span>

                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/admin/submissions/edit/${encodeURIComponent(item.nickname)}`;
                    }}
                    className="rounded-xl bg-blue-600/20 px-4 py-2 text-sm font-black text-blue-300 hover:bg-blue-600/40"
                  >
                    Editar
                  </span>

                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSubmission(item.nickname);
                    }}
                    className="rounded-xl bg-red-600/20 px-4 py-2 text-sm font-black text-red-300 hover:bg-red-600/40"
                  >
                    Esborrar
                  </span>
                </div>
              </button>

              {openIndex === index && (
                <div className="mt-8 space-y-10">
                  <section>
                    <h3 className="mb-4 text-xl font-black">Classificacions de grup</h3>
                    <GroupsView item={item} />
                  </section>

                  <section>
                    <h3 className="mb-4 text-xl font-black">Resultats fase de grups</h3>
                    <GroupScoresView item={item} />

                    <h3 className="mb-4 text-xl font-black">Eliminatories</h3>
                    <KnockoutView item={item} />
                  </section>
                </div>
              )}
            </div>
          ))}

          {items.length === 0 && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
              Encara no hi ha cap prediccio finalitzada.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}