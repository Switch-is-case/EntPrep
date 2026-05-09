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
  createdAt: string;
}

export function useAdminUsers() {
  const { token, user: currentUser, authHeaders } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    const params = new URLSearchParams({
      page: page.toString(),
      limit: "15",
    });
    if (search) params.set("search", search);

    try {
      const res = await fetch(`/api/admin/users?${params}`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error("Failed to fetch users", e);
    } finally {
      setLoading(false);
    }
  }, [token, page, search, authHeaders]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  const toggleAdmin = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert("Нельзя изменить свой статус администратора");
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        headers: authHeaders(),
        method: "PUT",
        body: JSON.stringify({ isAdmin: !user.isAdmin }),
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error("Failed to toggle admin status", e);
    }
  };

  const deleteUser = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert("Нельзя удалить себя");
      return;
    }
    if (!confirm(`Удалить пользователя ${user.name}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        headers: authHeaders(),
        method: "DELETE",
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error("Failed to delete user", e);
    }
  };

  return {
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
  };
}
