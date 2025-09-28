import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminCreateUser,
  adminListUsers,
  adminListUserSessions,
  adminLogoutSession,
  adminUpdateUser,
  adminDeleteUser,
} from "@/lib/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type UserRow = {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
  name: string;
  dailySearchLimit: number;
  is_active: boolean;
  created_at: string;
};

type SessionRow = {
  id: string;
  ip: string;
  user_agent: string;
  device_fingerprint: string;
  created_at: string;
  expires_at: string;
  is_active?: boolean;
  logged_out_at?: string | null;
};

type CreateForm = {
  open: boolean;
  email: string;
  password: string;
  name: string;
  phone: string;
  role: "ADMIN" | "USER";
  daily: number;
  isActive: boolean;
  error?: string | null;
  ok?: boolean;
};

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionUser, setSessionUser] = useState<UserRow | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateForm>({
    open: false,
    email: "",
    password: "",
    name: "",
    phone: "",
    role: "USER",
    daily: 100,
    isActive: true,
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminListUsers();
      setUsers(res.users);
    } catch (e: any) {
      setError(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const update = async (
    u: UserRow,
    data: Partial<UserRow> & { password?: string }
  ) => {
    try {
      await adminUpdateUser(u.id, {
        name: data.name ?? u.name,
        role: (data.role as any) ?? u.role,
        dailySearchLimit: data.dailySearchLimit ?? u.dailySearchLimit,
        is_active: data.is_active ?? u.is_active,
        password: data.password,
      });
      await load();
    } catch (e: any) {
      alert(e?.message || "Update failed");
    }
  };

  const openSessions = async (u: UserRow) => {
    setSessionUser(u);
    setSessionsError(null);
    try {
      const res = await adminListUserSessions(u.id);
      setSessions(res.sessions);
    } catch (e: any) {
      setSessionsError(e?.message || "Failed to load sessions");
    }
  };

  const logoutSess = async (sid: string) => {
    try {
      await adminLogoutSession(sid);
      if (sessionUser) await openSessions(sessionUser);
    } catch (e: any) {
      alert(e?.message || "Failed to logout session");
    }
  };

  const submitCreate = async () => {
    setCreateForm((f) => ({ ...f, error: null, ok: false }));
    try {
      await adminCreateUser({
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
        name: createForm.name,
        dailySearchLimit: createForm.daily,
      });
      setCreateForm({
        open: false,
        email: "",
        password: "",
        name: "",
        phone: "",
        role: "USER",
        daily: 100,
        isActive: true,
        ok: true,
      });
      await load();
    } catch (e: any) {
      setCreateForm((f) => ({
        ...f,
        error: e?.message || "Failed to create user",
      }));
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try { await adminDeleteUser(id); await load(); } catch (e: any) { alert(e?.message || "Failed to delete user"); }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Users</h1>
          <Button onClick={() => setCreateForm((f) => ({ ...f, open: true }))}>
            Create User
          </Button>
        </div>

        {createForm.open && (
          <Card className="border shadow-lg">
            <CardHeader>
              <CardTitle>Create User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, password: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input
                    value={createForm.phone}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Role</Label>
                  <select
                    className="border rounded px-2 py-2"
                    value={createForm.role}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        role: e.target.value as any,
                      }))
                    }
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Daily Limit</Label>
                  <Input
                    type="number"
                    value={createForm.daily}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        daily: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Active</Label>
                  <input
                    type="checkbox"
                    checked={createForm.isActive}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        isActive: e.target.checked,
                      }))
                    }
                  />
                </div>
              </div>
              {createForm.error && (
                <div className="text-sm text-red-600">{createForm.error}</div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={submitCreate}
                  disabled={!createForm.email || !createForm.password}
                >
                  Create
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCreateForm({
                      open: false,
                      email: "",
                      password: "",
                      name: "",
                      phone: "",
                      role: "USER",
                      daily: 100,
                      isActive: true,
                    })
                  }
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-sm min-w-[900px]">
                  <thead>
                    <tr className="text-left">
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2 pr-4">Daily Limit</th>
                      <th className="py-2 pr-4">Active</th>
                      <th className="py-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t">
                        <td className="py-2 pr-4">{u.email}</td>
                        <td className="py-2 pr-4">
                          <Input
                            defaultValue={u.name}
                            onBlur={(e) => update(u, { name: e.target.value })}
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <select
                            defaultValue={u.role}
                            onChange={(e) =>
                              update(u, { role: e.target.value as any })
                            }
                            className="border rounded px-2 py-1"
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td className="py-2 pr-4">
                          <Input
                            type="number"
                            defaultValue={u.dailySearchLimit}
                            onBlur={(e) =>
                              update(u, {
                                dailySearchLimit: Number(e.target.value),
                              })
                            }
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <input
                            type="checkbox"
                            defaultChecked={u.is_active}
                            onChange={(e) =>
                              update(u, { is_active: e.target.checked })
                            }
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => update(u, {})}>Save</Button>
                            <Button variant="outline" onClick={() => navigate(`/admin/dashboard/user-searches?id=${u.id}`)}>Track</Button>
                            <Button variant="destructive" onClick={() => del(u.id)}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {sessionUser && (
          <Card>
            <CardHeader>
              <CardTitle>
                Authentication Details — {sessionUser.email}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessionsError ? (
                <div className="text-red-600">{sessionsError}</div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-sm min-w-[900px]">
                    <thead>
                      <tr className="text-left">
                        <th className="py-2 pr-4">Session ID</th>
                        <th className="py-2 pr-4">Device</th>
                        <th className="py-2 pr-4">IP</th>
                        <th className="py-2 pr-4">Agent</th>
                        <th className="py-2 pr-4">Created</th>
                        <th className="py-2 pr-4">Expires</th>
                        <th className="py-2 pr-4">Active</th>
                        <th className="py-2 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((s) => (
                        <tr key={s.id} className="border-t">
                          <td className="py-2 pr-4">{s.id}</td>
                          <td className="py-2 pr-4">
                            {s.device_fingerprint || "-"}
                          </td>
                          <td className="py-2 pr-4">{s.ip}</td>
                          <td
                            className="py-2 pr-4 max-w-[320px] truncate"
                            title={s.user_agent}
                          >
                            {s.user_agent}
                          </td>
                          <td className="py-2 pr-4">
                            {new Date(s.created_at).toLocaleString()}
                          </td>
                          <td className="py-2 pr-4">
                            {new Date(s.expires_at).toLocaleString()}
                          </td>
                          <td className="py-2 pr-4">
                            {s.logged_out_at ? "No" : "Yes"}
                          </td>
                          <td className="py-2 pr-4">
                            {!s.logged_out_at && (
                              <Button
                                variant="outline"
                                onClick={() => logoutSess(s.id)}
                              >
                                Logout
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
