"use client";

import React, { useState } from "react";
import { useApp } from "@/components/Providers";
import { t } from "@/lib/i18n";
import { useAdminUsers, User } from "@/hooks/useAdminUsers";
import { SearchToolbar } from "@/components/admin/ui/SearchToolbar";
import { DataTable, type Column } from "@/components/admin/ui/DataTable";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Badge } from "@/components/admin/ui/Badge";
import { IconButton } from "@/components/admin/ui/IconButton";
import { Pagination } from "@/components/admin/ui/Pagination";
import { RefreshCw, Shield, ShieldAlert, UserX, UserCheck, Trash2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
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
    refresh,
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
        <Badge key="admin" variant="info" className="uppercase text-[10px]">
          {t("admin.status.admin", lang)}
        </Badge>
      );
    }
    if (user.bannedAt) {
      badges.push(
        <Badge key="banned" variant="danger" className="uppercase text-[10px]">
          {t("admin.engagement.banned", lang)}
        </Badge>
      );
    }
    if (user.deletedAt) {
      badges.push(
        <Badge key="deleted" variant="outline" className="uppercase text-[10px]">
          {t("admin.engagement.deleted", lang)}
        </Badge>
      );
    }
    if (!user.emailVerified) {
      badges.push(
        <Badge key="unverified" variant="warning" className="uppercase text-[10px]">
          {t("admin.engagement.unverified", lang)}
        </Badge>
      );
    }
    if (badges.length === 0) {
      badges.push(
        <Badge key="active" variant="success" className="uppercase text-[10px]">
          {t("admin.status.verified", lang)}
        </Badge>
      );
    }
    return <div className="flex flex-wrap gap-1">{badges}</div>;
  };

  const columns: Column<User>[] = [
    { key: "user", label: t("admin.users.table.user", lang), flex: 1 },
    { key: "status", label: t("admin.common.status", lang), width: 140 },
    { key: "lang", label: t("profile.language", lang), width: 80 },
    { key: "subjects", label: t("admin.users.table.subjects", lang), width: 150 },
    { key: "date", label: t("admin.users.table.regDate", lang), width: 140 },
    { key: "actions", label: "", width: 180 },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-1">{t("admin.nav.users" as any, lang)}</h1>
          <p className="text-text-secondary text-sm">Monitor user activity and manage permissions</p>
        </div>
        <IconButton 
          icon={<RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />} 
          tooltip={t("common.refresh", lang)} 
          onClick={refresh} 
        />
      </div>

      <SearchToolbar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        placeholder={t("admin.common.search", lang)}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setFilters({}); setPage(1); }}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all",
              Object.keys(filters).length === 0 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "bg-surface-base border border-border text-text-secondary hover:bg-surface-raised"
            )}
          >
            {t("admin.common.all", lang)}
          </button>
          <button
            onClick={() => { setFilters({ isAdmin: true }); setPage(1); }}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all",
              filters.isAdmin === true 
                ? "bg-info text-white shadow-lg shadow-info/20" 
                : "bg-surface-base border border-border text-text-secondary hover:bg-surface-raised"
            )}
          >
            {t("admin.status.admin", lang)}
          </button>
          <button
            onClick={() => { setFilters({ isBanned: true }); setPage(1); }}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all",
              filters.isBanned === true 
                ? "bg-danger text-white shadow-lg shadow-danger/20" 
                : "bg-surface-base border border-border text-text-secondary hover:bg-surface-raised"
            )}
          >
            {t("admin.engagement.banned", lang)}
          </button>
        </div>
      </SearchToolbar>

      <DataTable
        columns={columns}
        rows={users}
        isLoading={loading}
        renderRow={(user) => (
          <tr key={user.id} className={cn("border-b border-border hover:bg-surface-raised/50 transition-colors group", user.deletedAt && "opacity-60")}>
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center text-white font-bold shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-text font-semibold flex items-center gap-2">
                    {user.name}
                    {user.id === currentUser?.id && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0">{t("admin.users.table.you", lang)}</Badge>
                    )}
                  </span>
                  <span className="text-text-secondary text-xs">{user.email}</span>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              {renderStatusBadges(user)}
            </td>
            <td className="px-6 py-4">
              <Badge variant="outline" className="font-mono">{user.language.toUpperCase()}</Badge>
            </td>
            <td className="px-6 py-4">
              <div className="text-text-secondary text-xs">
                {user.profileSubject1 || user.profileSubject2 ? (
                  <>
                    <p className="font-medium text-text">{getSubjectName(user.profileSubject1)}</p>
                    {user.profileSubject2 && <p className="opacity-70 mt-0.5">{getSubjectName(user.profileSubject2)}</p>}
                  </>
                ) : (
                  <span className="italic opacity-50">{t("admin.users.table.notSelected", lang)}</span>
                )}
              </div>
            </td>
            <td className="px-6 py-4 text-text-secondary text-xs">
              {new Date(user.createdAt).toLocaleDateString(lang === "kz" ? "kk-KZ" : lang === "ru" ? "ru-RU" : "en-US", {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {user.id !== currentUser?.id && (
                  <>
                    <IconButton 
                      icon={user.isAdmin ? <ShieldAlert className="w-4 h-4" /> : <Shield className="w-4 h-4" />} 
                      tooltip={user.isAdmin ? t("admin.users.actions.removeAdmin", lang) : t("admin.users.actions.makeAdmin", lang)}
                      variant={user.isAdmin ? "secondary" : "ghost"}
                      onClick={() => toggleAdmin(user)}
                      disabled={isPending(user.id, "admin")}
                    />
                    
                    {user.bannedAt ? (
                      <IconButton 
                        icon={<UserCheck className="w-4 h-4" />} 
                        tooltip={t("admin.users.actions.unban", lang)}
                        className="text-success hover:bg-success/10"
                        onClick={() => unbanUser(user)}
                        disabled={isPending(user.id, "ban")}
                      />
                    ) : (
                      <IconButton 
                        icon={<UserX className="w-4 h-4" />} 
                        tooltip={t("admin.users.actions.ban", lang)}
                        variant="danger"
                        onClick={() => handleBanClick(user)}
                        disabled={isPending(user.id, "ban")}
                      />
                    )}

                    {user.deletedAt ? (
                      <IconButton 
                        icon={<RotateCcw className="w-4 h-4" />} 
                        tooltip={t("admin.users.actions.restore", lang)}
                        onClick={() => restoreUser(user)}
                        disabled={isPending(user.id, "delete")}
                      />
                    ) : (
                      <IconButton 
                        icon={<Trash2 className="w-4 h-4" />} 
                        tooltip={t("admin.users.actions.delete", lang)}
                        variant="danger"
                        onClick={() => {
                          if (confirm(t("admin.users.actions.delete", lang) + "?")) {
                            deleteUser(user);
                          }
                        }}
                        disabled={isPending(user.id, "delete")}
                      />
                    )}
                  </>
                )}
              </div>
            </td>
          </tr>
        )}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        lang={lang}
      />

      {/* Ban Modal */}
      <ConfirmDialog
        open={banModalOpen}
        onOpenChange={setBanModalOpen}
        title={t("admin.users.actions.ban", lang)}
        description={selectedUser ? `${t("admin.users.table.user", lang)}: ${selectedUser.name}` : ""}
        confirmLabel={t("common.confirm", lang)}
        cancelLabel={t("common.cancel", lang)}
        variant="danger"
        onConfirm={handleConfirmBan}
        isLoading={submittingBan}
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {t("admin.users.modal.banReasonLabel", lang)}
          </label>
          <textarea
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            className="w-full bg-surface-raised border border-border rounded-xl px-3 py-2 text-text text-sm focus:outline-none focus:ring-1 focus:ring-danger/20 transition-all min-h-[100px]"
            placeholder={t("admin.users.modal.banReasonPlaceholder", lang)}
          />
          {banReason.trim().length < 10 && (
            <p className="text-[10px] text-danger mt-1">Min 10 characters required</p>
          )}
        </div>
      </ConfirmDialog>
    </div>
  );
}
