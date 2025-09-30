import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import {
  ChevronLeft,
  ChevronRight,
  Database,
  FileText,
  LogOut,
  Menu,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { clear } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const doLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_expires");
    clear();
    navigate("/admin/signin", { replace: true });
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
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white shadow-lg transition-all duration-300"
            title="Dashboard"
          >
            <Users className="w-5 h-5 flex-shrink-0" />
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

        {/* Logout Button */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={doLogout}
              className="w-full border-slate-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-screen">
          {/* Header */}
          <div className="border-b bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 ml-12 lg:ml-0">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-bold text-blue-600">
                      FINPRO Admin
                    </h1>
                    <p className="text-xs text-slate-500">
                      Administrative Portal
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={doLogout}
                  className="border-slate-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div className="mb-6 lg:mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
                Dashboard
              </h2>
              <p className="text-slate-600">
                Manage your application from here
              </p>
            </div>

            {/* Management Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <Link to="/admin/dashboard/users" className="block group">
                <Card className="border border-slate-200 shadow-md hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden group-hover:border-blue-300">
                  <div className="h-2 bg-blue-600"></div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors duration-300">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg lg:text-xl">
                        User Management
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-sm mb-4">
                      Create, edit, and manage user accounts and permissions
                    </p>
                    <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 gap-1 transition-all duration-300">
                      Manage users
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/admin/dashboard/requests" className="block group">
                <Card className="border border-slate-200 shadow-md hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden group-hover:border-blue-300">
                  <div className="h-2 bg-blue-600"></div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors duration-300">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg lg:text-xl">
                        Requests
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-sm mb-4">
                      Review and process registration requests from new users
                    </p>
                    <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 gap-1 transition-all duration-300">
                      Review requests
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/admin/dashboard/uploads" className="block group">
                <Card className="border border-slate-200 shadow-md hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden group-hover:border-blue-300">
                  <div className="h-2 bg-blue-600"></div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors duration-300">
                        <Database className="w-6 h-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg lg:text-xl">
                        Data Uploads
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-sm mb-4">
                      Upload and manage CSV data files for the platform
                    </p>
                    <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 gap-1 transition-all duration-300">
                      Manage uploads
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
