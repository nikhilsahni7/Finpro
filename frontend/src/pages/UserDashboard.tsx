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
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { db, searchContacts, seedContactsBatch, type Contact } from "@/lib/db";
import { ArrowRight, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import Papa from "papaparse";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

// Columns from CSV
export type PersonRow = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  position: string;
  company: string;
  "company phone": string;
  website: string;
  domain: string;
  facebook: string;
  twitter: string;
  "linkedin company page": string;
  country: string;
  state: string;
};

type SearchLogic = "AND" | "OR";

type SearchForm = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  position: string;
  company: string;
  companyPhone: string;
  website: string;
  domain: string;
  facebook: string;
  linkedinCompanyPage: string;
  state: string;
};

const initialForm: SearchForm = {
  name: "",
  email: "",
  phone: "",
  linkedin: "",
  position: "",
  company: "",
  companyPhone: "",
  website: "",
  domain: "",
  facebook: "",
  linkedinCompanyPage: "",
  state: "",
};

const normalize = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  const str = String(value).trim();
  if (str.toLowerCase() === "null" || str === "undefined") return "";
  return str;
};

const lowerIncludes = (haystack: string, needle: string): boolean => {
  if (!needle) return true;
  return haystack.toLowerCase().includes(needle.toLowerCase());
};

const measure = async <T,>(fn: () => T | Promise<T>) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return { result, ms: Math.max(0, Math.round(end - start)) };
};

const UserDashboard = () => {
  const [form, setForm] = useState<SearchForm>(initialForm);
  const [logic, setLogic] = useState<SearchLogic>("AND");
  const [rows, setRows] = useState<Contact[]>([]);
  const [execMs, setExecMs] = useState<number>(0);
  const [queryCount, setQueryCount] = useState<number>(0);
  const [withinFilter, setWithinFilter] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const pageSize = 25;
  const formRef = useRef<HTMLFormElement | null>(null);

  // Seed Dexie in small batches once (idempotent)
  useEffect(() => {
    let cancelled = false;
    const seed = async () => {
      const count = await db.contacts.count();
      if (count > 0) return; // already seeded
      const res = await fetch("/Finprov.csv", { cache: "no-cache" });
      const csvText = await res.text();
      const parsed = Papa.parse<Record<string, string>>(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.replace(/\ufeff/g, "").trim(),
      });
      const batch: Contact[] = [];
      const flush = async () => {
        if (!batch.length) return;
        await seedContactsBatch(batch.splice(0, batch.length));
      };
      for (const row of parsed.data) {
        if (cancelled) return;
        const c: Contact = {
          name: normalize(row["name"]),
          email: normalize(row["email"]),
          phone: normalize(row["phone"]),
          linkedin: normalize(row["linkedin"]),
          position: normalize(row["position"]),
          company: normalize(row["company"]),
          companyPhone: normalize(row["company phone"]),
          website: normalize(row["website"]),
          domain: normalize(row["domain"]),
          facebook: normalize(row["facebook"]),
          twitter: normalize(row["twitter"]),
          linkedinCompanyPage: normalize(row["linkedin company page"]),
          country: normalize(row["country"]),
          state: normalize(row["state"]),
        };
        batch.push(c);
        if (batch.length >= 100) await flush();
      }
      await flush();
    };
    // Defer seeding until after first paint
    const id = setTimeout(() => void seed(), 0);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetFormAndResults = () => {
    setForm(initialForm);
    setWithinFilter("");
    setLogic("AND");
    setPage(1);
    setRows([]);
    setExecMs(0);
  };

  const runSearch = async () => {
    setIsSearching(true);
    const start = performance.now();
    const { rows, total } = await searchContacts({
      logic,
      page,
      pageSize,
      name: form.name,
      email: form.email,
      phone: form.phone,
      linkedin: form.linkedin,
      position: form.position,
      company: form.company,
      companyPhone: form.companyPhone,
      website: form.website,
      domain: form.domain,
      facebook: form.facebook,
      linkedinCompanyPage: form.linkedinCompanyPage,
      state: form.state,
    });
    setRows(rows);
    setTotal(total);
    setExecMs(Math.max(0, Math.round(performance.now() - start)));
    setQueryCount((c) => c + 1);
    setIsSearching(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    runSearch();
  };

  const filteredWithin = useMemo(() => {
    if (!withinFilter) return rows;
    const q = withinFilter.toLowerCase();
    return rows.filter((r) =>
      [
        r.name,
        r.email,
        r.phone,
        r.linkedin,
        r.position,
        r.company,
        r.companyPhone,
        r.website,
        r.domain,
        r.facebook,
        r.twitter,
        r.linkedinCompanyPage,
        r.country,
        r.state,
      ]
        .join(" \u2009|\u2009 ")
        .toLowerCase()
        .includes(q)
    );
  }, [withinFilter, rows]);

  const totalResults = filteredWithin.length;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <div className="w-full px-6 md:px-10 lg:px-16 xl:px-24 py-5">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
            <div className="w-5 h-5 bg-white rounded-sm shadow-sm"></div>
          </div>
          <span className="text-2xl font-bold text-brand-navy tracking-tight group-hover:text-brand-blue transition-colors duration-300">
            FINPRO
          </span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="px-6 md:px-10 lg:px-16 xl:px-24 pb-10 grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Left */}
        <div className="space-y-6">
          {/* Banner */}
          <div className="rounded-xl border border-border/60 bg-white/90 backdrop-blur-md p-4 md:p-5 flex items-center gap-3 text-sm text-muted-foreground">
            <SlidersHorizontal className="w-4 h-4 text-brand-blue" />
            <span>
              Showing seeded CSV results. Run a new search to refresh.
            </span>
          </div>

          {/* Search Card */}
          <Card className="shadow-xl border border-border/60 bg-white/95 backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-brand-navy">Customer Search</CardTitle>
              <CardDescription>
                Use multiple fields and switch logic between AND and OR.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Logic */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    Search Logic:
                  </span>
                  <ToggleGroup
                    type="single"
                    value={logic}
                    onValueChange={(v) => v && setLogic(v as SearchLogic)}
                    className="bg-muted/40 p-1 rounded-xl border"
                  >
                    <ToggleGroupItem
                      value="AND"
                      className="data-[state=on]:bg-brand-blue data-[state=on]:text-white rounded-lg px-3 py-1 text-sm"
                    >
                      AND
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="OR"
                      className="data-[state=on]:bg-brand-blue data-[state=on]:text-white rounded-lg px-3 py-1 text-sm"
                    >
                      OR
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <div className="text-xs text-muted-foreground">
                  All filled fields must match when AND is selected.
                </div>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Row 1 */}
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-brand-navy">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter name"
                      value={form.name}
                      onChange={handleChange}
                      className="h-11 rounded-xl border-2 border-border focus:border-brand-blue bg-background/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-brand-navy">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      placeholder="Enter email"
                      value={form.email}
                      onChange={handleChange}
                      className="h-11 rounded-xl border-2 border-border focus:border-brand-blue bg-background/50"
                    />
                  </div>

                  {/* Row 2 */}
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-brand-navy">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="Enter phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="h-11 rounded-xl border-2 border-border focus:border-brand-blue bg-background/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="linkedin" className="text-brand-navy">
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      name="linkedin"
                      placeholder="Profile URL"
                      value={form.linkedin}
                      onChange={handleChange}
                      className="h-11 rounded-xl border-2 border-border focus:border-brand-blue bg-background/50"
                    />
                  </div>

                  {/* Row 3 */}
                  <div className="space-y-1">
                    <Label htmlFor="position" className="text-brand-navy">
                      Position
                    </Label>
                    <Input
                      id="position"
                      name="position"
                      placeholder="Enter position"
                      value={form.position}
                      onChange={handleChange}
                      className="h-11 rounded-xl border-2 border-border focus:border-brand-blue bg-background/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="company" className="text-brand-navy">
                      Company
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      placeholder="Enter company"
                      value={form.company}
                      onChange={handleChange}
                      className="h-11 rounded-xl border-2 border-border focus:border-brand-blue bg-background/50"
                    />
                  </div>

                  {/* Row 4 */}
                  <div className="space-y-1">
                    <Label htmlFor="companyPhone" className="text-brand-navy">
                      Company Phone
                    </Label>
                    <Input
                      id="companyPhone"
                      name="companyPhone"
                      placeholder="Enter company phone"
                      value={form.companyPhone}
                      onChange={handleChange}
                      className="h-11 rounded-xl border-2 border-border focus:border-brand-blue bg-background/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="website" className="text-brand-navy">
                      Website
                    </Label>
                    <Input
                      id="website"
                      name="website"
                      placeholder="Enter website"
                      value={form.website}
                      onChange={handleChange}
                      className="h-11 rounded-xl border-2 border-border focus:border-brand-blue bg-background/50"
                    />
                  </div>

                  {/* Row 5 */}
                  <div className="space-y-1">
                    <Label htmlFor="domain" className="text-brand-navy">
                      Domain
                    </Label>
                    <Input
                      id="domain"
                      name="domain"
                      placeholder="Enter domain"
                      value={form.domain}
                      onChange={handleChange}
                      className="h-11 rounded-xl border-2 border-border focus:border-brand-blue bg-background/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="facebook" className="text-brand-navy">
                      Facebook
                    </Label>
                    <Input
                      id="facebook"
                      name="facebook"
                      placeholder="Enter facebook"
                      value={form.facebook}
                      onChange={handleChange}
                      className="h-11 rounded-xl border-2 border-border focus:border-brand-blue bg-background/50"
                    />
                  </div>

                  {/* Row 6 */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="linkedinCompanyPage"
                      className="text-brand-navy"
                    >
                      LinkedIn Company Page
                    </Label>
                    <Input
                      id="linkedinCompanyPage"
                      name="linkedinCompanyPage"
                      placeholder="Enter company page"
                      value={form.linkedinCompanyPage}
                      onChange={handleChange}
                      className="h-11 rounded-xl border-2 border-border focus:border-brand-blue bg-background/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="state" className="text-brand-navy">
                      State
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      placeholder="Enter state"
                      value={form.state}
                      onChange={handleChange}
                      className="h-11 rounded-xl border-2 border-border focus:border-brand-blue bg-background/50"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="submit"
                    variant="hero"
                    className="flex-1 group"
                    disabled={isSearching}
                  >
                    <Search className="w-5 h-5 mr-2 group-hover:translate-x-0.5 transition-transform" />
                    {isSearching ? "Searching..." : "Search (1000 remaining)"}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    type="button"
                    variant="hero-outline"
                    onClick={runSearch}
                    className="sm:w-48"
                    disabled={isSearching}
                  >
                    Run
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetFormAndResults}
                    className="sm:w-36"
                    disabled={isSearching}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Reset
                  </Button>
                </div>
              </form>

              <div className="grid sm:grid-cols-3 gap-4">
                <Card className="bg-muted/30 border">
                  <CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground">
                      Total Results
                    </div>
                    <div className="text-2xl font-bold text-brand-navy">
                      {totalResults.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 border">
                  <CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground">
                      Execution Time
                    </div>
                    <div className="text-2xl font-bold text-brand-navy">
                      {execMs || 0} ms
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 border">
                  <CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground">Source</div>
                    <div className="text-2xl font-bold text-brand-navy">
                      From Cache
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Search within */}
          <Card className="shadow-lg border border-border/60 bg-white/95 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-brand-navy text-lg">
                Search Within Results
              </CardTitle>
              <CardDescription>
                Quickly filter the current results list.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Type to filter within these results..."
                value={withinFilter}
                onChange={(e) => setWithinFilter(e.target.value)}
                className="h-11 rounded-xl border-2 border-border focus:border-brand-blue bg-background/50"
              />
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="shadow-xl border border-border/60 bg-white/95 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-brand-navy">Results</CardTitle>
              <CardDescription className="text-muted-foreground">
                Showing {totalResults.toLocaleString()} records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto rounded-lg border">
                <table className="w-full text-sm min-w-[1200px] table-auto">
                  <thead className="bg-muted/50">
                    <tr className="text-left">
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">LinkedIn</th>
                      <th className="p-3">Position</th>
                      <th className="p-3">Company</th>
                      <th className="p-3">Company Phone</th>
                      <th className="p-3">Website</th>
                      <th className="p-3">Domain</th>
                      <th className="p-3">Facebook</th>
                      <th className="p-3">Twitter</th>
                      <th className="p-3">LinkedIn Company Page</th>
                      <th className="p-3">Country</th>
                      <th className="p-3">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWithin.map((r, idx) => (
                      <tr key={idx} className="border-t hover:bg-muted/30">
                        <td className="p-3 align-top whitespace-normal break-words">
                          {r.name}
                        </td>
                        <td className="p-3 align-top whitespace-normal break-words">
                          {r.email}
                        </td>
                        <td className="p-3 align-top whitespace-normal break-words">
                          {r.phone}
                        </td>
                        <td className="p-3 align-top whitespace-normal break-all text-brand-blue">
                          {r.linkedin}
                        </td>
                        <td className="p-3 align-top whitespace-normal break-words">
                          {r.position}
                        </td>
                        <td className="p-3 align-top whitespace-normal break-words">
                          {r.company}
                        </td>
                        <td className="p-3 align-top whitespace-normal break-words">
                          {r.companyPhone}
                        </td>
                        <td className="p-3 align-top whitespace-normal break-all">
                          {r.website}
                        </td>
                        <td className="p-3 align-top whitespace-normal break-words">
                          {r.domain}
                        </td>
                        <td className="p-3 align-top whitespace-normal break-all">
                          {r.facebook}
                        </td>
                        <td className="p-3 align-top whitespace-normal break-all">
                          {r.twitter}
                        </td>
                        <td className="p-3 align-top whitespace-normal break-all">
                          {r.linkedinCompanyPage}
                        </td>
                        <td className="p-3 align-top whitespace-normal break-words">
                          {r.country}
                        </td>
                        <td className="p-3 align-top whitespace-normal break-words">
                          {r.state}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalResults === 0 && (
                <div className="text-center text-muted-foreground py-10">
                  No results found. Try changing your search or switching to{" "}
                  {logic === "AND" ? "OR" : "AND"}.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right - Usage */}
        <div className="space-y-6">
          <Card className="shadow-xl border border-border/60 bg-white/95 backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-brand-navy">Nikhil Sahni</CardTitle>
              <CardDescription>Signed In</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="space-y-2">
                <div className="text-sm font-medium text-brand-navy">
                  Daily Usage
                </div>
                <div className="rounded-xl border p-4 bg-muted/30">
                  <div className="text-sm text-muted-foreground">
                    Daily Search Limit
                  </div>
                  <div className="flex items-center gap-6 mt-3">
                    <div>
                      <div className="text-2xl font-bold text-brand-navy">
                        {queryCount}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Searches Today
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-brand-navy">
                        {Math.max(0, 1000 - queryCount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Remaining
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
