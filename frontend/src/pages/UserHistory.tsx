import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserHistory } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

type HistoryItem = {
  id: string;
  params: string;
  total: number;
  created_at: string;
};

function parseParams(raw: string): Record<string, string> {
  try {
    const obj = JSON.parse(raw || "{}");
    const normalized: Record<string, string> = {};
    const keys = [
      "name",
      "email",
      "phone",
      "linkedin",
      "position",
      "company",
      "companyPhone",
      "website",
      "domain",
      "facebook",
      "linkedinCompanyPage",
      "state",
      "logic",
      "page",
      "pageSize",
    ];
    for (const k of keys) {
      const v = obj?.[k];
      if (v !== undefined && String(v).trim() !== "") normalized[k] = String(v);
    }
    return normalized;
  } catch {
    return {};
  }
}

const chipLabel: Record<string, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  linkedin: "LinkedIn",
  position: "Position",
  company: "Company",
  companyPhone: "Company Phone",
  website: "Website",
  domain: "Domain",
  facebook: "Facebook",
  linkedinCompanyPage: "LinkedIn Company Page",
  state: "State",
  logic: "Logic",
  page: "Page",
  pageSize: "Page Size",
};

const Chip = ({ label, value }: { label: string; value: string }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border text-xs mr-2 mb-2">
    <span className="text-muted-foreground">{label}</span>
    <span
      className="font-medium text-brand-navy truncate max-w-[220px]"
      title={`${label}: ${value}`}
    >
      {value}
    </span>
  </div>
);

const Pagination = ({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (p: number) => void;
}) => (
  <div className="flex items-center gap-2 mt-4">
    <button
      className="border rounded px-3 py-1 disabled:opacity-50"
      disabled={page <= 1}
      onClick={() => onChange(page - 1)}
    >
      Prev
    </button>
    <div className="text-sm">
      Page {page} / {Math.max(1, pages)}
    </div>
    <button
      className="border rounded px-3 py-1 disabled:opacity-50"
      disabled={page >= pages}
      onClick={() => onChange(page + 1)}
    >
      Next
    </button>
  </div>
);

const UserHistory = () => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 25;

  const load = async (p: number) => {
    const res = await getUserHistory(p, limit);
    setItems(res.items);
    setTotal(res.total_count);
    setPage(res.page);
  };

  useEffect(() => {
    void load(1);
  }, []);

  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Search History</h1>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No history yet. Run a search to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {items.map((it) => {
              const p = parseParams(it.params);
              const when = new Date(it.created_at).toLocaleString();
              return (
                <Card
                  key={it.id}
                  className="border shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{when}</CardTitle>
                      <div className="text-sm">
                        Total Results:{" "}
                        <span className="font-semibold">
                          {it.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap">
                      {Object.entries(p).map(([k, v]) => (
                        <Chip key={k} label={chipLabel[k] || k} value={v} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Pagination page={page} pages={pages} onChange={(p) => void load(p)} />
      </div>
    </div>
  );
};

export default UserHistory;
