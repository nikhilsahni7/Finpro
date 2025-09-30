import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminCreateUser,
  adminDeleteUser,
  adminListUsers,
  adminListUserSessions,
  adminLogoutSession,
  adminUpdateUser,
} from "@/lib/api";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Database,
  FileText,
  Home,
  Menu,
  Plus,
  Save,
  Shield,
  Trash2,
  UserCog,
  Users as UsersIcon,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    try {
      await adminDeleteUser(id);
      await load();
    } catch (e: any) {
      alert(e?.message || "Failed to delete user");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-slate-200 hover:bg-slate-50"
      >
        <Menu className="w-6 h-6 text-slate-700" />
      </button>

      {/* Sidebar Overlay for Mobile */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarCollapsed ? "w-20" : "w-72"
        } fixed lg:static inset-y-0 left-0 z-40 border-r bg-white/95 backdrop-blur-xl shadow-xl flex flex-col transition-all duration-300 ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b bg-blue-600 relative">
          <Link to="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-xl font-bold text-white truncate">
                  FINPRO
                </h1>
                <p className="text-xs text-blue-100">Admin Portal</p>
              </div>
            )}
          </Link>

          {/* Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full items-center justify-center shadow-lg transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-all duration-300 text-slate-700 hover:text-blue-600 group"
            title="Dashboard"
          >
            <Home className="w-5 h-5 flex-shrink-0 text-slate-600 group-hover:text-blue-600 transition-colors" />
            {!sidebarCollapsed && (
              <span className="font-medium truncate">Dashboard</span>
            )}
          </Link>
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white shadow-lg"
            title="Users"
          >
            <UsersIcon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="font-medium truncate">Users</span>
            )}
          </div>
          <Link
            to="/admin/dashboard/requests"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-all duration-300 text-slate-700 hover:text-blue-600 group"
            title="Requests"
          >
            <FileText className="w-5 h-5 flex-shrink-0 text-slate-600 group-hover:text-blue-600 transition-colors" />
            {!sidebarCollapsed && (
              <span className="font-medium truncate">Requests</span>
            )}
          </Link>
          <Link
            to="/admin/dashboard/uploads"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-all duration-300 text-slate-700 hover:text-blue-600 group"
            title="Uploads"
          >
            <Database className="w-5 h-5 flex-shrink-0 text-slate-600 group-hover:text-blue-600 transition-colors" />
            {!sidebarCollapsed && (
              <span className="font-medium truncate">Uploads</span>
            )}
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 lg:space-y-6 max-w-7xl mx-auto ml-0 lg:ml-auto mr-0 lg:mr-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-4 ml-12 lg:ml-0">
            <Link
              to="/admin/dashboard"
              className="hover:text-blue-600 hover:underline transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">Users</span>
          </div>

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8 ml-12 lg:ml-0">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
                User Management
              </h1>
              <p className="text-slate-600">
                Manage user accounts and permissions
              </p>
            </div>
            <Button
              onClick={() => setCreateForm((f) => ({ ...f, open: true }))}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </div>

          {/* Create User Form */}
          {createForm.open && (
            <Card className="border border-blue-200 shadow-xl bg-white">
              <div className="h-1 bg-blue-600"></div>
              <CardHeader className="bg-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <UserCog className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">Create New User</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setCreateForm({ ...createForm, open: false })
                    }
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <Input
                      value={createForm.email}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, email: e.target.value }))
                      }
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Password</Label>
                    <Input
                      type="password"
                      value={createForm.password}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          password: e.target.value,
                        }))
                      }
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Name</Label>
                    <Input
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Phone</Label>
                    <Input
                      value={createForm.phone}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Role</Label>
                    <select
                      className="w-full border border-slate-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Daily Limit</Label>
                    <Input
                      type="number"
                      value={createForm.daily}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          daily: Number(e.target.value),
                        }))
                      }
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                {createForm.error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
                    {createForm.error}
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={submitCreate}
                    disabled={!createForm.email || !createForm.password}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create User
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

          {/* Users Table */}
          <Card className="border border-slate-200 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-xl">All Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading users...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
                  {error}
                </div>
              ) : (
                <div className="overflow-auto rounded-lg border border-slate-200">
                  <table className="w-full text-sm min-w-[900px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4 text-left font-semibold text-slate-700">
                          Email
                        </th>
                        <th className="py-3 px-4 text-left font-semibold text-slate-700">
                          Name
                        </th>
                        <th className="py-3 px-4 text-left font-semibold text-slate-700">
                          Role
                        </th>
                        <th className="py-3 px-4 text-left font-semibold text-slate-700">
                          Daily Limit
                        </th>
                        <th className="py-3 px-4 text-left font-semibold text-slate-700">
                          Status
                        </th>
                        <th className="py-3 px-4 text-left font-semibold text-slate-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium text-slate-700">
                            {u.email}
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              defaultValue={u.name}
                              onBlur={(e) =>
                                update(u, { name: e.target.value })
                              }
                              className="h-9 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <select
                              defaultValue={u.role}
                              onChange={(e) =>
                                update(u, { role: e.target.value as any })
                              }
                              className={`border rounded-md px-2 py-1.5 text-xs font-semibold ${
                                u.role === "ADMIN"
                                  ? "bg-blue-100 text-blue-700 border-blue-300"
                                  : "bg-blue-100 text-blue-700 border-blue-300"
                              }`}
                            >
                              <option value="USER">USER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              defaultValue={u.dailySearchLimit}
                              onBlur={(e) =>
                                update(u, {
                                  dailySearchLimit: Number(e.target.value),
                                })
                              }
                              className="h-9 w-24 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                defaultChecked={u.is_active}
                                onChange={(e) =>
                                  update(u, { is_active: e.target.checked })
                                }
                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                              />
                              <span
                                className={`text-xs font-semibold ${
                                  u.is_active
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {u.is_active ? "Active" : "Inactive"}
                              </span>
                            </label>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => update(u, {})}
                                className="border-slate-300 hover:border-green-500 hover:text-green-600"
                              >
                                <Save className="w-3 h-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/admin/dashboard/user-searches?id=${u.id}`
                                  )
                                }
                                className="border-slate-300 hover:border-blue-500 hover:text-blue-600"
                              >
                                <Activity className="w-3 h-3 mr-1" />
                                Track
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => del(u.id)}
                                className="border-slate-300 hover:border-red-500 hover:text-red-600"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
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

          {/* Sessions Table */}
          {sessionUser && (
            <Card className="border border-slate-200 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-xl">
                  Authentication Details — {sessionUser.email}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessionsError ? (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
                    {sessionsError}
                  </div>
                ) : (
                  <div className="overflow-auto rounded-lg border border-slate-200">
                    <table className="w-full text-sm min-w-[900px]">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4 text-left font-semibold text-slate-700">
                            Session ID
                          </th>
                          <th className="py-3 px-4 text-left font-semibold text-slate-700">
                            Device
                          </th>
                          <th className="py-3 px-4 text-left font-semibold text-slate-700">
                            IP
                          </th>
                          <th className="py-3 px-4 text-left font-semibold text-slate-700">
                            Agent
                          </th>
                          <th className="py-3 px-4 text-left font-semibold text-slate-700">
                            Created
                          </th>
                          <th className="py-3 px-4 text-left font-semibold text-slate-700">
                            Expires
                          </th>
                          <th className="py-3 px-4 text-left font-semibold text-slate-700">
                            Active
                          </th>
                          <th className="py-3 px-4 text-left font-semibold text-slate-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sessions.map((s) => (
                          <tr
                            key={s.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="py-3 px-4 font-mono text-xs text-slate-600">
                              {s.id.substring(0, 8)}...
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {s.device_fingerprint || "-"}
                            </td>
                            <td className="py-3 px-4 font-mono text-xs text-slate-600">
                              {s.ip}
                            </td>
                            <td
                              className="py-3 px-4 max-w-[320px] truncate text-slate-600"
                              title={s.user_agent}
                            >
                              {s.user_agent}
                            </td>
                            <td className="py-3 px-4 text-slate-500 text-xs">
                              {new Date(s.created_at).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-slate-500 text-xs">
                              {new Date(s.expires_at).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                  s.logged_out_at
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {s.logged_out_at ? "Inactive" : "Active"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {!s.logged_out_at && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => logoutSess(s.id)}
                                  className="border-slate-300 hover:border-red-500 hover:text-red-600"
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
    </div>
  );
};

export default AdminUsers;
