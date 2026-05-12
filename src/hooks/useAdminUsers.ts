import { useState, useCallback, useEffect } from "react";
import { useApp } from "@/components/Providers";

export interface User {
  id: string;
  name: string;
  email: string;
  language: string;
  profileSubject1: string | null;
  profileSubject2: string | null;
  isAdmin: boolean;
  emailVerified: boolean;
  bannedAt: string | null;
  banReason: string | null;
  deletedAt: string | null;
  createdAt: string;
}

export interface UserFilters {
  isAdmin?: boolean;
  isBanned?: boolean;
  isDeleted?: boolean;
  emailVerified?: boolean;
}

export function useAdminUsers() {
  const { token, user: currentUser, authHeaders } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<UserFilters>({});

  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());

  const addPending = (userId: string, action: string) => {
    setPendingActions(prev => {
      const next = new Set(prev);
      next.add(`${userId}:${action}`);
      return next;
    });
  };

  const removePending = (userId: string, action: string) => {
    setPendingActions(prev => {
      const next = new Set(prev);
      next.delete(`${userId}:${action}`);
      return next;
    });
  };

  const isPending = (userId: string, action: string) => pendingActions.has(`${userId}:${action}`);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: "15",
    });
    if (search) params.set("search", search);
    if (filters.isAdmin !== undefined) params.set("isAdmin", filters.isAdmin.toString());
    if (filters.isBanned !== undefined) params.set("isBanned", filters.isBanned.toString());
    if (filters.isDeleted !== undefined) params.set("isDeleted", filters.isDeleted.toString());
    if (filters.emailVerified !== undefined) params.set("emailVerified", filters.emailVerified.toString());

    try {
      const res = await fetch(`/api/admin/users?${params}`, { headers: authHeaders() });
      if (res.ok) {
        const resData = await res.json();
        const data = resData.data;
        setUsers(data.users);
        setTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error("Failed to fetch users", e);
    } finally {
      setLoading(false);
    }
  }, [token, page, search, filters, authHeaders]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleAdmin = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert("Нельзя изменить свой статус администратора");
      return;
    }
    if (isPending(user.id, "admin")) return;

    addPending(user.id, "admin");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        headers: authHeaders(),
        method: "PUT",
        body: JSON.stringify({ isAdmin: !user.isAdmin }),
      });

      if (res.ok) {
        await fetchUsers();
      }
    } catch (e) {
      console.error("Failed to toggle admin status", e);
    } finally {
      removePending(user.id, "admin");
    }
  };

  const banUser = async (user: User, reason: string) => {
    if (isPending(user.id, "ban")) return false;
    addPending(user.id, "ban");
    try {
      const res = await fetch(`/api/admin/users/${user.id}/ban`, {
        headers: authHeaders(),
        method: "POST",
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        await fetchUsers();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to ban user", e);
      return false;
    } finally {
      removePending(user.id, "ban");
    }
  };

  const unbanUser = async (user: User) => {
    if (isPending(user.id, "ban")) return;
    addPending(user.id, "ban");
    try {
      const res = await fetch(`/api/admin/users/${user.id}/unban`, {
        headers: authHeaders(),
        method: "POST",
      });

      if (res.ok) {
        await fetchUsers();
      }
    } catch (e) {
      console.error("Failed to unban user", e);
    } finally {
      removePending(user.id, "ban");
    }
  };

  const deleteUser = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert("Нельзя удалить себя");
      return;
    }
    if (user.isAdmin) {
      alert("Нельзя удалить администратора");
      return;
    }
    if (isPending(user.id, "delete")) return;

    if (!confirm(`Удалить пользователя ${user.name}?`)) return;

    addPending(user.id, "delete");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        headers: authHeaders(),
        method: "DELETE",
      });

      if (res.ok) {
        await fetchUsers();
      }
    } catch (e) {
      console.error("Failed to delete user", e);
    } finally {
      removePending(user.id, "delete");
    }
  };

  const restoreUser = async (user: User) => {
    if (isPending(user.id, "delete")) return;
    addPending(user.id, "delete");
    try {
      const res = await fetch(`/api/admin/users/${user.id}/restore`, {
        headers: authHeaders(),
        method: "POST",
      });

      if (res.ok) {
        await fetchUsers();
      }
    } catch (e) {
      console.error("Failed to restore user", e);
    } finally {
      removePending(user.id, "delete");
    }
  };

  return {
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
    refresh: fetchUsers
  };
}
