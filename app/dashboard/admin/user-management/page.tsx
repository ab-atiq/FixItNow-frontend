"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  activeStatus?: "ACTIVE" | "BLOCKED" | "INACTIVE" | string;
  isBlocked?: boolean;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  function getUserStatus(user: AdminUser) {
    if (user.activeStatus) {
      return user.activeStatus.toUpperCase() === "BLOCKED" ? "BLOCKED" : "ACTIVE";
    }
    return user.isBlocked ? "BLOCKED" : "ACTIVE";
  }

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const data = await api.get<AdminUser[]>("/admin/users");
      setUsers(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to load users";
      toast.error(message);
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function toggleUserStatus(user: AdminUser) {
    const currentStatus = getUserStatus(user);
    const nextStatus = currentStatus === "BLOCKED" ? "ACTIVE" : "BLOCKED";

    setTogglingUserId(user.id);
    try {
      await api.patch(`/admin/users/${user.id}`, { activeStatus: nextStatus });

      toast.success(
        nextStatus === "BLOCKED"
          ? `User ${user.name} has been banned.`
          : `User ${user.name} has been unbanned.`,
      );
      await loadUsers();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to update user status";
      toast.error(message);
    } finally {
      setTogglingUserId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">User Management</h1>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="font-semibold text-gray-900 text-lg text-center">User Management</h2>
        </CardHeader>
        <CardContent className="space-y-8">
          {loadingUsers ? (
            <p className="text-sm text-gray-500">Loading users...</p>
          ) : (
            [
              { title: "Admin Users", role: "ADMIN" },
              { title: "Customer Users", role: "CUSTOMER" },
              { title: "Technician Users", role: "TECHNICIAN" },
            ].map(({ title, role }) => {
              const filteredUsers = users.filter((user) => user.role === role);

              return (
                <div key={role}>
                  <h2 className="mb-3 text-lg font-semibold text-gray-900">{title}</h2>

                  {filteredUsers.length === 0 ? (
                    <p className="text-sm text-gray-500">No {title.toLowerCase()} found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 text-gray-500">
                            <th className="py-2 pr-4">Name</th>
                            <th className="py-2 pr-4">Email</th>
                            <th className="py-2 pr-4">Role</th>
                            <th className="py-2 pr-4">Status</th>
                            <th className="py-2 pr-4">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => {
                            const status = getUserStatus(user);
                            const isBlocked = status === "BLOCKED";

                            return (
                              <tr key={user.id} className="border-b border-gray-50">
                                <td className="py-3 pr-4 font-medium text-gray-900">{user.name}</td>
                                <td className="py-3 pr-4 text-gray-600">{user.email}</td>
                                <td className="py-3 pr-4 text-gray-600">{user.role}</td>
                                <td className="py-3 pr-4">
                                  <span className={
                                    "inline-flex rounded-full px-2 py-1 text-xs font-medium " +
                                    (isBlocked ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700")
                                  }>
                                    {status}
                                  </span>
                                </td>
                                <td className="py-3 pr-4">
                                  <Button
                                    variant={isBlocked ? "outline" : "danger"}
                                    isLoading={togglingUserId === user.id}
                                    onClick={() => toggleUserStatus(user)}
                                    className="min-w-[90px]"
                                  >
                                    {isBlocked ? "Unban" : "Ban"}
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
