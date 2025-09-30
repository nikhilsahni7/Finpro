/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listUploads, uploadCsv, type UploadRecord } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  ChevronLeft,
  ChevronRight,
  Database,
  FileText,
  Home,
  Menu,
  Search,
  Shield,
  Upload,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminUploads = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [error, setError] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const { clear } = useAuth();

  const refresh = async () => {
    try {
      const res = await listUploads();
      const list = Array.isArray(res?.uploads) ? res.uploads : [];
      setUploads(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load uploads");
      if (e?.status === 401 || e?.status === 403) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        clear();
        navigate("/admin/signin", { replace: true });
      }
    }
  };

  useEffect(() => {
    void refresh();
    intervalRef.current = window.setInterval(refresh, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setIsUploading(true);
    setError("");
    try {
      await uploadCsv(file);
      setFile(null);
      await refresh();
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const filtered = uploads.filter((u) => {
    const t = q.trim().toLowerCase();
    if (!t) return true;
    const hay = `${u.id} ${u.original_filename} ${u.status} ${
      u.error ?? ""
    }`.toLowerCase();
    return hay.includes(t);
  });

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
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white shadow-lg"
            title="Uploads"
          >
            <Database className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="font-medium truncate">Uploads</span>
            )}
          </div>
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
            <span className="text-slate-900 font-medium">Uploads</span>
          </div>

          {/* Page Header */}
          <div className="mb-6 lg:mb-8 ml-12 lg:ml-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
              Data Uploads
            </h1>
            <p className="text-slate-600">Upload and manage CSV data files</p>
          </div>

          {/* Upload Form Card */}
          <Card className="border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
            <div className="h-1 bg-blue-600"></div>
            <CardHeader className="bg-blue-50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg lg:text-xl">
                    Upload CSV File
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Select a CSV file to upload; progress will appear in the
                    table below
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form
                onSubmit={submit}
                className="flex flex-col sm:flex-row items-end gap-4"
              >
                <div className="flex-1 w-full space-y-2">
                  <Label htmlFor="file" className="text-sm font-medium">
                    Select File
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!file || isUploading}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  {isUploading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </form>
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Uploads Table Card */}
          <Card className="border border-slate-200 shadow-lg bg-white">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg lg:text-xl">
                    Recent Uploads
                  </CardTitle>
                  <CardDescription className="text-sm">
                    View and monitor all uploaded files
                  </CardDescription>
                </div>
                <div className="text-sm text-slate-500">
                  Auto-refresh:{" "}
                  <span className="text-blue-600 font-medium">Active</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Search by filename, ID, status, or error..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 text-left font-semibold text-slate-700 whitespace-nowrap">
                        ID
                      </th>
                      <th className="py-3 px-4 text-left font-semibold text-slate-700 whitespace-nowrap">
                        Filename
                      </th>
                      <th className="py-3 px-4 text-left font-semibold text-slate-700 whitespace-nowrap">
                        Status
                      </th>
                      <th className="py-3 px-4 text-left font-semibold text-slate-700 whitespace-nowrap">
                        Rows
                      </th>
                      <th className="py-3 px-4 text-left font-semibold text-slate-700 whitespace-nowrap">
                        Processed
                      </th>
                      <th className="py-3 px-4 text-left font-semibold text-slate-700 whitespace-nowrap">
                        Progress
                      </th>
                      <th className="py-3 px-4 text-left font-semibold text-slate-700 whitespace-nowrap">
                        Error
                      </th>
                      <th className="py-3 px-4 text-left font-semibold text-slate-700 whitespace-nowrap">
                        Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs">
                            {u.id}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700 max-w-xs truncate">
                          {u.original_filename}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              u.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : u.status === "processing"
                                ? "bg-blue-100 text-blue-700"
                                : u.status === "failed"
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {u.row_count ?? "-"}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {u.processed_rows ?? "-"}
                        </td>
                        <td className="py-3 px-4">
                          {u.progress_pct != null ? (
                            <div className="w-24">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="h-full bg-blue-600 transition-all duration-500"
                                    style={{
                                      width: `${Math.round(u.progress_pct)}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-xs font-medium text-slate-600">
                                  {Math.round(u.progress_pct)}%
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-red-600 text-xs max-w-xs truncate">
                          {u.error ?? ""}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">
                          {new Date(u.updated_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminUploads;
