"use client";

export default function AdminLogoutButton() {
  async function logout() {
    await fetch("/api/admin-logout", {
      method: "POST",
    });

    window.location.href = "/admin/login";
  }

  return (
    <button
      onClick={logout}
      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white hover:bg-red-700"
    >
      Tancar sessió
    </button>
  );
}