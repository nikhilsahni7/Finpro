import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminGetUserSearches } from "@/lib/api";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const AdminUserSearches = () => {
  const [params] = useSearchParams();
  const userId = params.get("id") || "";
  const [items, setItems] = useState<
    Array<{
      id: string;
      device: string;
      ip: string;
      agent: string;
      params: string;
      total: number;
      created_at: string;
    }>
  >([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const limit = 25;
  const load = async (p: number) => {
    const res = await adminGetUserSearches(userId, p, limit);
    setItems(res.items);
    setTotal(res.total_count);
    setPage(res.page);
  };
  useEffect(() => {
    if (userId) void load(1);
  }, [userId]);
  const pages = Math.max(1, Math.ceil(total / limit));

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
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 lg:space-y-6 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-4 ml-12 lg:ml-0">
            <Link
              to="/admin/dashboard"
              className="hover:text-blue-600 hover:underline transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              to="/admin/dashboard/users"
              className="hover:text-blue-600 hover:underline transition-colors"
            >
              Users
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">User Searches</span>
          </div>

          {/* Page Header */}
          <div className="mb-6 lg:mb-8 ml-12 lg:ml-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
              User Search History
            </h1>
            <p className="text-slate-600">View search activity for this user</p>
          </div>

          <Card className="border border-slate-200 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-xl">Recent Searches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm min-w-[1000px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-left">
                      <th className="py-3 px-4 font-semibold text-slate-700">When</th>
                      <th className="py-3 px-4 font-semibold text-slate-700">Device</th>
                      <th className="py-3 px-4 font-semibold text-slate-700">IP</th>
                      <th className="py-3 px-4 font-semibold text-slate-700">Agent</th>
                      <th className="py-3 px-4 font-semibold text-slate-700">Params</th>
                      <th className="py-3 px-4 font-semibold text-slate-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it) => (
                      <tr key={it.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {new Date(it.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{it.device || "-"}</td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-600">{it.ip}</td>
                        <td
                          className="py-3 px-4 max-w-[320px] truncate text-slate-600"
                          title={it.agent}
                        >
                          {it.agent}
                        </td>
                        <td className="py-3 px-4 text-xs whitespace-pre-wrap break-all text-slate-600">
                          {it.params}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{it.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  className="border border-slate-300 rounded-lg px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={page <= 1}
                  onClick={() => load(page - 1)}
                >
                  Previous
                </button>
                <div className="text-sm text-slate-600">
                  Page <span className="font-semibold text-slate-800">{page}</span> of <span className="font-semibold text-slate-800">{pages}</span>
                </div>
                <button
                  className="border border-slate-300 rounded-lg px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={page >= pages}
                  onClick={() => load(page + 1)}
                >
                  Next
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminUserSearches;
