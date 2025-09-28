import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminGetUserSearches } from "@/lib/api";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const AdminUserSearches = () => {
  const [params] = useSearchParams();
  const userId = params.get("id") || "";
  const [items, setItems] = useState<Array<{ id: string; device: string; ip: string; agent: string; params: string; total: number; created_at: string }>>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 25;
  const load = async (p: number) => {
    const res = await adminGetUserSearches(userId, p, limit);
    setItems(res.items); setTotal(res.total_count); setPage(res.page);
  };
  useEffect(() => { if (userId) void load(1); }, [userId]);
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">User Searches</h1>
        <Card>
          <CardHeader><CardTitle>Recent</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-sm min-w-[1000px]">
                <thead>
                  <tr className="text-left">
                    <th className="py-2 pr-4">When</th>
                    <th className="py-2 pr-4">Device</th>
                    <th className="py-2 pr-4">IP</th>
                    <th className="py-2 pr-4">Agent</th>
                    <th className="py-2 pr-4">Params</th>
                    <th className="py-2 pr-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="py-2 pr-4">{new Date(it.created_at).toLocaleString()}</td>
                      <td className="py-2 pr-4">{it.device || "-"}</td>
                      <td className="py-2 pr-4">{it.ip}</td>
                      <td className="py-2 pr-4 max-w-[320px] truncate" title={it.agent}>{it.agent}</td>
                      <td className="py-2 pr-4 text-xs whitespace-pre-wrap break-all">{it.params}</td>
                      <td className="py-2 pr-4">{it.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button className="border rounded px-3 py-1" disabled={page <= 1} onClick={() => load(page - 1)}>Prev</button>
              <div className="text-sm">Page {page} / {pages}</div>
              <button className="border rounded px-3 py-1" disabled={page >= pages} onClick={() => load(page + 1)}>Next</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUserSearches;
