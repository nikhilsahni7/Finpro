import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { getMe } from "./lib/api";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRequests from "./pages/AdminRequests";
import AdminSignIn from "./pages/AdminSignIn";
import AdminUploads from "./pages/AdminUploads";
import AdminUsers from "./pages/AdminUsers";
import AdminUserSearches from "./pages/AdminUserSearches";
import DeviceConflict from "./pages/DeviceConflict";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import UserDashboard from "./pages/UserDashboard";
import UserHistory from "./pages/UserHistory";

const queryClient = new QueryClient();

const RequireAuth = ({
  children,
  role,
}: {
  children: JSX.Element;
  role: "ADMIN" | "USER";
}) => {
  const [state, setState] = useState<{
    loading: boolean;
    ok: boolean;
    role?: string;
  }>({ loading: true, ok: false });
  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setState({ loading: false, ok: me.role === role, role: me.role });
      } catch {
        setState({ loading: false, ok: false });
      }
    })();
  }, [role]);
  if (state.loading) return <div />;
  if (!state.ok)
    return (
      <Navigate to={role === "ADMIN" ? "/admin/signin" : "/signin"} replace />
    );
  return children;
};

const RedirectIfAuthed = ({
  target,
  role,
  children,
}: {
  target: string;
  role?: "ADMIN" | "USER";
  children: JSX.Element;
}) => {
  const [done, setDone] = useState(false);
  const [to, setTo] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        if (role && me.role !== role) {
          setDone(true);
          return;
        }
        setTo(target);
      } catch {
        setDone(true);
      }
    })();
  }, [target, role]);
  if (to) return <Navigate to={to} replace />;
  if (!done) return <div />;
  return children;
};

const HomeRedirect = () => {
  const [to, setTo] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setTo(me.role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard");
      } catch {
        setTo(null);
      }
    })();
  }, []);
  if (!to) return <Index />;
  return <Navigate to={to} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route
            path="/signin"
            element={
              <RedirectIfAuthed target="/user/dashboard">
                <SignIn />
              </RedirectIfAuthed>
            }
          />
          <Route
            path="/signup"
            element={
              <RedirectIfAuthed target="/user/dashboard">
                <SignUp />
              </RedirectIfAuthed>
            }
          />
          <Route
            path="/user/dashboard"
            element={
              <RequireAuth role="USER">
                <UserDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/user/history"
            element={
              <RequireAuth role="USER">
                <UserHistory />
              </RequireAuth>
            }
          />

          <Route
            path="/admin/signin"
            element={
              <RedirectIfAuthed target="/admin/dashboard" role="ADMIN">
                <AdminSignIn />
              </RedirectIfAuthed>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <RequireAuth role="ADMIN">
                <AdminDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/dashboard/users"
            element={
              <RequireAuth role="ADMIN">
                <AdminUsers />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/dashboard/requests"
            element={
              <RequireAuth role="ADMIN">
                <AdminRequests />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/dashboard/uploads"
            element={
              <RequireAuth role="ADMIN">
                <AdminUploads />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/dashboard/user-searches"
            element={
              <RequireAuth role="ADMIN">
                <AdminUserSearches />
              </RequireAuth>
            }
          />

          <Route path="/device-conflict" element={<DeviceConflict />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
