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
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminUploads = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [error, setError] = useState<string>("");
  const [q, setQ] = useState<string>("");
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
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-60 border-r bg-white/95 p-4 space-y-4">
        <Link
          to="/admin/dashboard"
          className="block text-xl font-bold text-brand-navy"
        >
          FINPRO
        </Link>
        <nav className="space-y-2 text-sm">
          <Link
            className="block px-2 py-1 rounded hover:bg-muted"
            to="/admin/dashboard/users"
          >
            Users
          </Link>
          <Link
            className="block px-2 py-1 rounded hover:bg-muted"
            to="/admin/dashboard/requests"
          >
            Requests
          </Link>
          <span className="block px-2 py-1 rounded bg-brand-blue text-white">
            Uploads
          </span>
        </nav>
      </div>

      {/* Main */}
      <div className="flex-1 p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV</CardTitle>
            <CardDescription>
              Upload data files; progress and status appear below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="file">CSV File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
              <Button type="submit" disabled={!file || isUploading}>
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </form>
            {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <Input
                placeholder="Search uploads by filename, ID, status, or error..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Filename</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Rows</th>
                    <th className="py-2 pr-4">Processed</th>
                    <th className="py-2 pr-4">Progress</th>
                    <th className="py-2 pr-4">Error</th>
                    <th className="py-2 pr-4">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="py-2 pr-4">{u.id}</td>
                      <td className="py-2 pr-4">{u.original_filename}</td>
                      <td className="py-2 pr-4">{u.status}</td>
                      <td className="py-2 pr-4">{u.row_count ?? "-"}</td>
                      <td className="py-2 pr-4">{u.processed_rows ?? "-"}</td>
                      <td className="py-2 pr-4">
                        {u.progress_pct != null
                          ? `${Math.round(u.progress_pct)}%`
                          : "-"}
                      </td>
                      <td className="py-2 pr-4">{u.error ?? ""}</td>
                      <td className="py-2 pr-4">
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
  );
};

export default AdminUploads;
