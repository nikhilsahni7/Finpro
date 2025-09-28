import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const doLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_expires");
    navigate("/admin/signin");
  };
  return (
    <div className="min-h-screen p-6 space-y-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between rounded-lg border p-3 bg-white/90 mb-4">
          <div className="font-medium">Admin</div>
          <Button variant="outline" size="sm" onClick={doLogout}>
            Logout
          </Button>
        </div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                to="/admin/dashboard/users"
                className="underline text-brand-blue"
              >
                Manage users
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                to="/admin/dashboard/requests"
                className="underline text-brand-blue"
              >
                Review registration requests
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                to="/admin/dashboard/uploads"
                className="underline text-brand-blue"
              >
                Data uploads
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
