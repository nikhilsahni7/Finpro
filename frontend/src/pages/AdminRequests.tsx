/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  adminCreateUser,
  adminListRegistrationRequests,
  adminUpdateRegistrationRequest,
} from "@/lib/api";
import { useEffect, useState } from "react";

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
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Registration Requests</h1>
        <Card>
          <CardHeader>
            <CardTitle>Pending & Recent</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-sm min-w-[1100px]">
                  <thead>
                    <tr className="text-left">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Phone</th>
                      <th className="py-2 pr-4">State</th>
                      <th className="py-2 pr-4">Requested</th>
                      <th className="py-2 pr-4">Verified</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const verified = !!r.email_verified_at;
                      const isApproved = r.status === "APPROVED";
                      const isCurrent = createForm?.id === r.id;
                      return (
                        <tr key={r.id} className="border-t align-top">
                          <td className="py-2 pr-4">{r.name}</td>
                          <td className="py-2 pr-4">{r.email}</td>
                          <td className="py-2 pr-4">{r.phone_number}</td>
                          <td className="py-2 pr-4">{r.state}</td>
                          <td className="py-2 pr-4">{r.requested_searches}</td>
                          <td className="py-2 pr-4">
                            {verified ? "Yes" : "No"}
                          </td>
                          <td className="py-2 pr-4">{r.status}</td>
                          <td className="py-2 pr-4">
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  disabled={!verified || isApproved}
                                  onClick={() => act(r.id, "APPROVED")}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  disabled={r.status === "REJECTED"}
                                  onClick={() => act(r.id, "REJECTED")}
                                >
                                  Reject
                                </Button>
                                {/* Create user visible when verified & approved */}
                                <Button
                                  variant="outline"
                                  disabled={!verified || !isApproved}
                                  onClick={() => openCreate(r)}
                                >
                                  Create User
                                </Button>
                              </div>
                              {isCurrent && (
                                <div className="border rounded p-3 space-y-2 bg-muted/30">
                                  <div className="text-xs text-muted-foreground">
                                    Create account for:{" "}
                                    <strong>{r.email}</strong>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <input
                                      className="border rounded px-2 py-1"
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
                                      className="border rounded px-2 py-1"
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
                                      className="border rounded px-2 py-1"
                                      type="number"
                                      min={1}
                                      max={10000}
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
                                    <div className="text-xs text-red-600">
                                      {createForm.error}
                                    </div>
                                  )}
                                  {createForm?.ok && (
                                    <div className="text-xs text-green-700">
                                      User created successfully
                                    </div>
                                  )}
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => submitCreate(r)}
                                      disabled={!createForm?.password}
                                    >
                                      Create
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setCreateForm(null)}
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
  );
};

export default AdminRequests;
