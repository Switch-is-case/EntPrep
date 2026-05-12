"use client";

import React, { useState } from "react";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";
import { useAdminUsers, User } from "@/hooks/useAdminUsers";
import { Spinner } from "@/components/Spinner";

export default function AdminUsers() {
  const { lang } = useApp();
  const {
    users,
    loading,
    page,
    totalPages,
    search,
    filters,
    setPage,
    setSearch,
    setFilters,
    toggleAdmin,
    banUser,
    unbanUser,
    deleteUser,
    restoreUser,
    currentUser,
    isPending,
  } = useAdminUsers();

  const [banModalOpen, setBanModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");
  const [submittingBan, setSubmittingBan] = useState(false);

  const getSubjectName = (s: string | null) => {
    if (!s) return "—";
    const key = `subject.${s}` as keyof typeof import("@/lib/i18n").translations;
    return t(key, lang);
  };

  const handleBanClick = (user: User) => {
    setSelectedUser(user);
    setBanReason("");
    setBanModalOpen(true);
  };

  const handleConfirmBan = async () => {
    if (!selectedUser || banReason.trim().length < 10) return;
    setSubmittingBan(true);
    const success = await banUser(selectedUser, banReason);
    setSubmittingBan(false);
    if (success) {
      setBanModalOpen(false);
      setSelectedUser(null);
    } else {
      alert(t("admin.users.error.ban", lang));
    }
  };

  const renderStatusBadges = (user: User) => {
    const badges = [];
    if (user.isAdmin) {
      badges.push(
        <span key="admin" className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded uppercase tracking-wider">
          {t("admin.status.admin", lang)}
        </span>
      );
    }
    if (user.bannedAt) {
      badges.push(
        <span key="banned" className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded uppercase tracking-wider">
          {t("admin.engagement.banned", lang)}
        </span>
      );
    }
    if (user.deletedAt) {
      badges.push(
        <span key="deleted" className="px-2 py-0.5 bg-slate-600/50 text-slate-400 text-[10px] font-bold rounded uppercase tracking-wider">
          {t("admin.engagement.deleted", lang)}
        </span>
      );
    }
    if (!user.emailVerified) {
      badges.push(
        <span key="unverified" className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-[10px] font-bold rounded uppercase tracking-wider">
          {t("admin.engagement.unverified", lang)}
        </span>
      );
    }
    if (badges.length === 0) {
      badges.push(
        <span key="active" className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded uppercase tracking-wider">
          {t("admin.status.verified", lang)}
        </span>
      );
    }
    return <div className="flex flex-wrap gap-1">{badges}</div>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">{t("admin.users.title", lang)}</h1>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <input
              type="text"
              placeholder={t("admin.users.searchPlaceholder", lang)}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => { setFilters({}); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                Object.keys(filters).length === 0 ? "bg-primary text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {t("admin.users.filter.all", lang)}
            </button>
            <button
              onClick={() => { setFilters({ isAdmin: true }); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.isAdmin === true ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {t("admin.users.filter.admins", lang)}
            </button>
            <button
              onClick={() => { setFilters({ isBanned: true }); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.isBanned === true ? "bg-red-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {t("admin.users.filter.banned", lang)}
            </button>
            <button
              onClick={() => { setFilters({ isDeleted: true }); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.isDeleted === true ? "bg-slate-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {t("admin.users.filter.deleted", lang)}
            </button>
            <button
              onClick={() => { setFilters({ emailVerified: false }); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.emailVerified === false ? "bg-yellow-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {t("admin.users.filter.unverified", lang)}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="md" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr className="text-slate-400">
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">{t("admin.users.table.user", lang)}</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">{t("admin.common.status", lang)}</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">{t("profile.language", lang)}</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">{t("admin.users.table.subjects", lang)}</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider">{t("admin.users.table.regDate", lang)}</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">{t("admin.common.actions", lang)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {users.map((user) => (
                  <tr key={user.id} className={`hover:bg-slate-700/30 transition-colors ${user.deletedAt ? "opacity-60" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-semibold">
                            {user.name}
                            {user.id === currentUser?.id && (
                              <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-400 ml-2">
                                {t("admin.users.table.you", lang)}
                              </span>
                            )}
                          </span>
                          <span className="text-slate-400 text-xs">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {renderStatusBadges(user)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono bg-slate-700/50 border border-slate-600 px-2 py-1 rounded text-slate-300">
                        {user.language.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-xs max-w-[150px] truncate">
                      {user.profileSubject1 || user.profileSubject2 ? (
                        <>
                          {getSubjectName(user.profileSubject1)}
                          {user.profileSubject2 && (
                            <div className="text-slate-500 font-medium">
                              + {getSubjectName(user.profileSubject2)}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-500 italic">{t("admin.users.table.notSelected", lang)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString(lang === "kz" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US", {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.id !== currentUser?.id && (
                          <div className="flex gap-2">
                            {/* Toggle Admin */}
                            <button
                              onClick={() => toggleAdmin(user)}
                              disabled={isPending(user.id, "admin")}
                              title={user.isAdmin ? t("admin.users.actions.removeAdmin", lang) : t("admin.users.actions.makeAdmin", lang)}
                              className={`p-1.5 rounded-lg border transition-all ${
                                user.isAdmin 
                                  ? "bg-blue-500/10 border-blue-500/50 text-blue-400 hover:bg-blue-500/20" 
                                  : "bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-600"
                              } ${isPending(user.id, "admin") ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              {isPending(user.id, "admin") ? (
                                <Spinner size="sm" />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                              )}
                            </button>

                            {/* Ban/Unban */}
                            {user.bannedAt ? (
                              <button
                                onClick={() => unbanUser(user)}
                                disabled={isPending(user.id, "ban")}
                                title={t("admin.users.actions.unban", lang)}
                                className={`p-1.5 rounded-lg bg-green-500/10 border border-green-500/50 text-green-400 hover:bg-green-500/20 transition-all ${isPending(user.id, "ban") ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                {isPending(user.id, "ban") ? (
                                  <Spinner size="sm" />
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBanClick(user)}
                                disabled={isPending(user.id, "ban")}
                                title={t("admin.users.actions.ban", lang)}
                                className={`p-1.5 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 hover:bg-red-500/20 transition-all ${isPending(user.id, "ban") ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                {isPending(user.id, "ban") ? (
                                  <Spinner size="sm" />
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                                  </svg>
                                )}
                              </button>
                            )}

                            {/* Delete/Restore */}
                            {user.deletedAt ? (
                              <button
                                onClick={() => restoreUser(user)}
                                disabled={isPending(user.id, "delete")}
                                title={t("admin.users.actions.restore", lang)}
                                className={`p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/20 transition-all ${isPending(user.id, "delete") ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                {isPending(user.id, "delete") ? (
                                  <Spinner size="sm" />
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => deleteUser(user)}
                                disabled={user.isAdmin || isPending(user.id, "delete")}
                                title={user.isAdmin ? t("admin.users.actions.noDeleteAdmin", lang) : t("admin.users.actions.delete", lang)}
                                className={`p-1.5 rounded-lg border transition-all ${
                                  user.isAdmin 
                                    ? "bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed" 
                                    : "bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20"
                                } ${isPending(user.id, "delete") ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                {isPending(user.id, "delete") ? (
                                  <Spinner size="sm" />
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>{t("admin.users.notFound", lang)}</span>
                      </div>
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
        <div className="flex items-center justify-between mt-6 px-2">
          <div className="text-xs text-slate-400">
            {t("admin.users.pagination.page", lang)} {page} {t("admin.users.pagination.of", lang)} {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm disabled:opacity-50 hover:bg-slate-700 transition-all"
            >
              {t("admin.users.pagination.prev", lang)}
            </button>
            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let p = page - 2 + i;
                if (page <= 2) p = i + 1;
                if (page >= totalPages - 1) p = totalPages - 4 + i;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      page === p ? "bg-primary text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm disabled:opacity-50 hover:bg-slate-700 transition-all"
            >
              {t("admin.users.pagination.next", lang)}
            </button>
          </div>
        </div>
      )}

      {/* Ban Reason Modal */}
      {banModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{t("admin.users.modal.banTitle", lang)}</h3>
              <button 
                onClick={() => setBanModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.268 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{selectedUser?.name}</p>
                  <p className="text-xs text-red-400">{t("admin.users.modal.banWarning", lang)}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t("admin.users.modal.banReasonLabel", lang)}</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder={t("admin.users.modal.banReasonPlaceholder", lang)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 min-h-[100px] transition-all"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-900/50 flex gap-3">
              <button
                onClick={() => setBanModalOpen(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-all"
              >
                {t("admin.common.cancel", lang)}
              </button>
              <button
                onClick={handleConfirmBan}
                disabled={banReason.trim().length < 10 || submittingBan}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-900/20"
              >
                {submittingBan ? <Spinner size="sm" color="white" /> : t("admin.users.actions.ban", lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
