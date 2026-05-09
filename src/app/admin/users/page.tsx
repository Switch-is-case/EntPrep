"use client";

import React from "react";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";
import { useAdminUsers } from "@/hooks/useAdminUsers";

export default function AdminUsers() {
  const { lang } = useApp();
  const {
    users,
    loading,
    page,
    totalPages,
    search,
    setPage,
    setSearch,
    toggleAdmin,
    deleteUser,
    currentUser,
  } = useAdminUsers();

  const getSubjectName = (s: string | null) => {
    if (!s) return "—";
    const key = `subject.${s}` as keyof typeof import("@/lib/i18n").translations;
    return t(key, lang);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Пользователи</h1>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Поиск по имени или email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-400 w-80"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-700/50">
                <tr className="text-left text-slate-300">
                  <th className="px-4 py-3 font-medium">Пользователь</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Язык</th>
                  <th className="px-4 py-3 font-medium">Профильные предметы</th>
                  <th className="px-4 py-3 font-medium">Роль</th>
                  <th className="px-4 py-3 font-medium">Дата рег.</th>
                  <th className="px-4 py-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">
                          {user.name}
                          {user.id === currentUser?.id && (
                            <span className="text-xs text-slate-400 ml-1">
                              (вы)
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                        {user.language.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">
                      {user.profileSubject1 || user.profileSubject2 ? (
                        <>
                          {getSubjectName(user.profileSubject1)}
                          {user.profileSubject2 && (
                            <> + {getSubjectName(user.profileSubject2)}</>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-500">Не выбраны</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleAdmin(user)}
                        disabled={user.id === currentUser?.id}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          user.isAdmin
                            ? "bg-primary/20 text-primary hover:bg-primary/30"
                            : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                        } ${
                          user.id === currentUser?.id
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                        }`}
                      >
                        {user.isAdmin ? "Admin" : "User"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="px-4 py-3">
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => deleteUser(user)}
                          className="text-danger hover:text-red-400"
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      Нет пользователей
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-slate-700 text-white text-sm disabled:opacity-50"
          >
            ←
          </button>
          <span className="text-slate-300 text-sm">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-slate-700 text-white text-sm disabled:opacity-50"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
