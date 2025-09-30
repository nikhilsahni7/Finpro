/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  adminCreateUser,
  adminListRegistrationRequests,
  adminUpdateRegistrationRequest,
} from "@/lib/api";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Database,
  FileText,
  Home,
  Menu,
  Shield,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type RequestRow = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  state: string;
  requested_searches: number;
  status: string;
  created_at: string;
  email_verified_at?: string | null;
};

type CreateForm = {
  id: string;
  password: string;
  role: "ADMIN" | "USER";
  daily: number;
  error?: string | null;
  ok?: boolean;
} | null;

const AdminRequests = () => {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateForm>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminListRegistrationRequests(1, 200);
      setRows(res.requests);
    } catch (e: any) {
      setError(e?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const act = async (id: string, status: "APPROVED" | "REJECTED") => {
    await adminUpdateRegistrationRequest(id, { status });
    await load();
  };

  const openCreate = (r: RequestRow) => {
    setCreateForm({
      id: r.id,
      password: "",
      role: "USER",
      daily: Math.max(50, r.requested_searches || 100),
      error: null,
      ok: false,
    });
  };

  const submitCreate = async (r: RequestRow) => {
    if (!createForm) return;
    setCreateForm({ ...createForm, error: null, ok: false });
    try {
      await adminCreateUser({
        email: r.email,
        password: createForm.password,
        role: createForm.role,
        name: r.name,
        dailySearchLimit: createForm.daily,
      });
      setCreateForm({ ...createForm, ok: true });
    } catch (e: any) {
      setCreateForm({
        ...createForm,
        error: e?.message || "Failed to create user",
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
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
          <Link
            to="/admin/dashboard/users"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-all duration-300 text-slate-700 hover:text-blue-600 group"
            title="Users"
          >
            <Users className="w-5 h-5 flex-shrink-0 text-slate-600 group-hover:text-blue-600 transition-colors" />
            {!sidebarCollapsed && (
              <span className="font-medium truncate">Users</span>
            )}
          </Link>
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white shadow-lg"
            title="Requests"
          >
            <FileText className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="font-medium truncate">Requests</span>
            )}
          </div>
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
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 lg:space-y-6 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-4 ml-12 lg:ml-0">
            <Link
              to="/admin/dashboard"
              className="hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">Requests</span>
          </div>

          {/* Page Header */}
          <div className="mb-6 lg:mb-8 ml-12 lg:ml-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
              Registration Requests
            </h1>
            <p className="text-slate-600">
              Review and approve registration requests
            </p>
          </div>

          {/* Requests Table */}
          <Card className="border border-slate-200 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-xl">
                Pending & Recent Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading requests...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              ) : (
                <div className="overflow-auto rounded-lg border border-slate-200">
                  <table className="w-full text-sm min-w-[1100px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4 text-left font-semibold text-slate-700">
                          Name
                        </th>
                        <th className="py-3 px-4 text-left font-semibold text-slate-700">
                          Email
                        </th>
                        <th className="py-3 px-4 text-left font-semibold text-slate-700">
                          Phone
                        </th>
                        <th className="py-3 px-4 text-left font-semibold text-slate-700">
                          State
                        </th>
                        <th className="py-3 px-4 text-left font-semibold text-slate-700">
                          Requested
                        </th>
                        <th className="py-3 px-4 text-left font-semibold text-slate-700">
                          Verified
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
                      {rows.map((r) => {
                        const verified = !!r.email_verified_at;
                        const isApproved = r.status === "APPROVED";
                        const isCurrent = createForm?.id === r.id;
                        return (
                          <tr
                            key={r.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-slate-700">
                              {r.name}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {r.email}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {r.phone_number}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {r.state}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {r.requested_searches}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                  verified
                                    ? "bg-green-100 text-green-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {verified ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                  r.status === "APPROVED"
                                    ? "bg-green-100 text-green-700"
                                    : r.status === "REJECTED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!verified || isApproved}
                                    onClick={() => act(r.id, "APPROVED")}
                                    className="border-slate-300 hover:border-green-500 hover:text-green-600 disabled:opacity-50"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={r.status === "REJECTED"}
                                    onClick={() => act(r.id, "REJECTED")}
                                    className="border-slate-300 hover:border-red-500 hover:text-red-600 disabled:opacity-50"
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Reject
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!verified || !isApproved}
                                    onClick={() => openCreate(r)}
                                    className="border-slate-300 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50"
                                  >
                                    <UserPlus className="w-3 h-3 mr-1" />
                                    Create User
                                  </Button>
                                </div>
                                {isCurrent && (
                                  <div className="border border-blue-200 rounded-lg p-4 space-y-3 bg-blue-50">
                                    <div className="text-xs text-slate-600 font-medium">
                                      Create account for:{" "}
                                      <strong className="text-blue-700">
                                        {r.email}
                                      </strong>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                      <input
                                        className="border border-slate-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                        type="password"
                                        placeholder="Password"
                                        value={createForm?.password || ""}
                                        onChange={(e) =>
                                          setCreateForm(
                                            createForm
                                              ? {
                                                  ...createForm,
                                                  password: e.target.value,
                                                }
                                              : null
                                          )
                                        }
                                      />
                                      <select
                                        className="border border-slate-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                        value={
                                          createForm?.role || ("USER" as any)
                                        }
                                        onChange={(e) =>
                                          setCreateForm(
                                            createForm
                                              ? {
                                                  ...createForm,
                                                  role: e.target.value as any,
                                                }
                                              : null
                                          )
                                        }
                                      >
                                        <option value="USER">USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                      </select>
                                      <input
                                        className="border border-slate-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                        type="number"
                                        min={1}
                                        max={10000}
                                        placeholder="Daily Limit"
                                        value={createForm?.daily || 100}
                                        onChange={(e) =>
                                          setCreateForm(
                                            createForm
                                              ? {
                                                  ...createForm,
                                                  daily: Number(e.target.value),
                                                }
                                              : null
                                          )
                                        }
                                      />
                                    </div>
                                    {createForm?.error && (
                                      <div className="p-2 rounded-md bg-red-50 border border-red-200 text-xs text-red-600">
                                        {createForm.error}
                                      </div>
                                    )}
                                    {createForm?.ok && (
                                      <div className="p-2 rounded-md bg-green-50 border border-green-200 text-xs text-green-700 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        User created successfully
                                      </div>
                                    )}
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => submitCreate(r)}
                                        disabled={!createForm?.password}
                                        className="bg-blue-600 hover:bg-blue-700"
                                      >
                                        Create
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setCreateForm(null)}
                                        className="border-slate-300"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminRequests;
