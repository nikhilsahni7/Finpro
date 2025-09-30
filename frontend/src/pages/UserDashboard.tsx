/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty */
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  getMe,
  getUserLastSearch,
  logout,
  searchApi,
  type ContactRow,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ArrowRight, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const { clear } = useAuth();
  const [me, setMe] = useState<{
    email: string;
    name: string;
    searches_today: number;
    daily_limit: number;
  } | null>(null);
  const [lastFromCache, setLastFromCache] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const info = await getMe();
        setMe({
          email: info.email,
          name: info.name,
          searches_today: info.searches_today,
          daily_limit: info.daily_limit,
        });
      } catch {}
    })();
  }, []);

  const [form, setForm] = useState<SearchForm>(initialForm);
  const [logic, setLogic] = useState<SearchLogic>("AND");
  const [rows, setRows] = useState<ContactRow[]>([]);
  const [execMs, setExecMs] = useState<number>(0);
  const [queryCount, setQueryCount] = useState<number>(0);
  const [withinFilter, setWithinFilter] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const pageSize = 100; // Increased from 50 to 100 for better UX
  const formRef = useRef<HTMLFormElement | null>(null);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);

  // Preload last search results from cache
  useEffect(() => {
    (async () => {
      try {
        const last = await getUserLastSearch();
        if (last && Array.isArray(last.rows) && last.rows.length > 0) {
          setRows(last.rows);
          setTotal(last.total);
          // Prefill form and logic if params present
          const p: any = last.params || {};
          setForm((f) => ({
            ...f,
            name: p.name || "",
            email: p.email || "",
            phone: p.phone || "",
            linkedin: p.linkedin || "",
            position: p.position || "",
            company: p.company || "",
            companyPhone: p.companyPhone || "",
            website: p.website || "",
            domain: p.domain || "",
            facebook: p.facebook || "",
            linkedinCompanyPage: p.linkedinCompanyPage || "",
            state: p.state || "",
          }));
          if (p.logic === "AND" || p.logic === "OR") setLogic(p.logic);
          setLastFromCache(true);
        }
      } catch {
        /* empty */
      }
    })();
  }, []);

  const scrollTable = useCallback((direction: "left" | "right") => {
    if (tableScrollRef.current) {
      const containerWidth = tableScrollRef.current.clientWidth;
      const scrollAmount = containerWidth * 0.8;
      const currentScroll = tableScrollRef.current.scrollLeft;
      const targetScroll =
        direction === "left"
          ? Math.max(0, currentScroll - scrollAmount)
          : currentScroll + scrollAmount;

      tableScrollRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  }, []);

  // Add keyboard navigation for horizontal scrolling only
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Only handle if focus is on or within the table
      if (
        e.target === tableScrollRef.current ||
        tableScrollRef.current?.contains(e.target as Node)
      ) {
        if (e.key === "ArrowLeft" && (e.shiftKey || e.ctrlKey)) {
          e.preventDefault();
          scrollTable("left");
        } else if (e.key === "ArrowRight" && (e.shiftKey || e.ctrlKey)) {
          e.preventDefault();
          scrollTable("right");
        }
      }
    },
    [scrollTable]
  );

  // Add event listener for keyboard navigation
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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
    setTotal(0);
    setExecMs(0);
    setLastFromCache(false);
  };

  const runSearch = async () => {
    setIsSearching(true);
    setLastFromCache(false);
    const start = performance.now();
    try {
      const { rows, total } = await searchApi({
        logic,
        page,
        pageSize,
        name: form.name || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        linkedin: form.linkedin || undefined,
        position: form.position || undefined,
        company: form.company || undefined,
        companyPhone: form.companyPhone || undefined,
        website: form.website || undefined,
        domain: form.domain || undefined,
        facebook: form.facebook || undefined,
        linkedinCompanyPage: form.linkedinCompanyPage || undefined,
      });
      setRows(rows ?? []);
      setTotal(total ?? 0);
    } catch (err) {
      setRows([]);
      setTotal(0);
    } finally {
      setExecMs(Math.max(0, Math.round(performance.now() - start)));
      setQueryCount((c) => c + 1);
      setIsSearching(false);
    }
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

  const displayedResults = filteredWithin.length;
  const totalResults = total; // Total from database

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Top app header */}
      <div className="w-full px-6 md:px-12 lg:px-16 xl:px-20 2xl:px-24 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <div className="w-5 h-5 bg-white rounded-sm shadow-sm"></div>
            </div>
            <span className="text-2xl font-bold text-brand-navy tracking-tight group-hover:text-brand-blue transition-colors truncate">
              FINPRO
            </span>
          </Link>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <div className="max-w-[200px] truncate text-sm text-muted-foreground">
              Signed In
            </div>
            <div
              className="max-w-[220px] truncate font-medium text-brand-navy"
              title={me?.name || me?.email}
            >
              {me?.name || me?.email || ""}
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted/60 text-xs">
              Searches Today:
              <strong className="ml-1">{me?.searches_today ?? 0}</strong>
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted/60 text-xs">
              Remaining:
              <strong className="ml-1">
                {Math.max(
                  0,
                  (me?.daily_limit ?? 0) - (me?.searches_today ?? 0)
                )}
              </strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/user/history")}
            >
              History
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout();
                clear();
                navigate("/signin", { replace: true });
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Status banner */}
      <div className="px-6 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
        <div className="rounded-xl border border-border/60 bg-white/90 backdrop-blur-md p-4 md:p-5 flex items-center gap-3 text-sm text-muted-foreground">
          <SlidersHorizontal className="w-4 h-4 text-brand-blue" />
          <span>
            {lastFromCache
              ? "Showing your last search from this device. Run a new search to refresh."
              : "Connected to backend. Use the form to run a new search."}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-6 md:px-12 lg:px-16 xl:px-20 2xl:px-24 pb-10">
        <div className="space-y-6">
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
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      Alternate Number
                    </Label>
                    <Input
                      id="companyPhone"
                      name="companyPhone"
                      placeholder="Enter alternate number"
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
                    {isSearching ? "Searching..." : "Search"}
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
            </CardContent>
          </Card>

          {/* Search Summary */}
          <Card className="shadow-lg border border-border/60 bg-white/95 backdrop-blur-md">
            <CardContent className="pt-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <Card className="bg-muted/30 border">
                  <CardContent className="pt-4">
                    <div className="text-xs text-muted-foreground">
                      Showing / Total Results
                    </div>
                    <div className="text-2xl font-bold text-brand-navy">
                      {displayedResults.toLocaleString()} /{" "}
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
                      Backend
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-brand-navy">Results</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {totalResults > 0 ? (
                      <>
                        Showing top {displayedResults.toLocaleString()} of{" "}
                        {totalResults.toLocaleString()} total records
                      </>
                    ) : (
                      "No results"
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full"
                    title="Use Shift/Ctrl + Arrow keys or scroll buttons"
                  >
                    Scroll horizontally to see all columns →
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => scrollTable("left")}
                      className="h-8 w-8 p-0"
                    >
                      ←
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => scrollTable("right")}
                      className="h-8 w-8 p-0"
                    >
                      →
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                ref={tableScrollRef}
                className="overflow-x-auto rounded-lg border scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 transition-all duration-200"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#cbd5e1 #f1f5f9",
                }}
              >
                <table className="w-full text-xs lg:text-sm min-w-[1800px] table-auto">
                  <thead className="bg-muted/50">
                    <tr className="text-left">
                      <th className="p-2 min-w-[120px]">Name</th>
                      <th className="p-2 min-w-[200px]">Email</th>
                      <th className="p-2 min-w-[120px]">Phone</th>
                      <th className="p-2 min-w-[150px]">LinkedIn</th>
                      <th className="p-2 min-w-[120px]">Position</th>
                      <th className="p-2 min-w-[120px]">Company</th>
                      <th className="p-2 min-w-[120px]">Alternate Number</th>
                      <th className="p-2 min-w-[120px]">Website</th>
                      <th className="p-2 min-w-[100px]">Domain</th>
                      <th className="p-2 min-w-[120px]">Facebook</th>
                      <th className="p-2 min-w-[120px]">Twitter</th>
                      <th className="p-2 min-w-[180px]">
                        LinkedIn Company Page
                      </th>
                      <th className="p-2 min-w-[100px]">Country</th>
                      <th className="p-2 min-w-[100px]">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWithin.map((r, idx) => (
                      <tr key={idx} className="border-t hover:bg-muted/30">
                        <td className="p-2 align-top whitespace-normal break-words">
                          {r.name}
                        </td>
                        <td className="p-2 align-top whitespace-normal break-words">
                          {r.email}
                        </td>
                        <td className="p-2 align-top whitespace-normal break-words">
                          {r.phone}
                        </td>
                        <td className="p-2 align-top whitespace-normal break-all">
                          {r.linkedin ? (
                            <a
                              className="text-brand-blue underline"
                              href={r.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {r.linkedin}
                            </a>
                          ) : null}
                        </td>
                        <td className="p-2 align-top whitespace-normal break-words">
                          {r.position}
                        </td>
                        <td className="p-2 align-top whitespace-normal break-words">
                          {r.company}
                        </td>
                        <td className="p-2 align-top whitespace-normal break-words">
                          {r.companyPhone}
                        </td>
                        <td className="p-2 align-top whitespace-normal break-all">
                          {r.website ? (
                            <a
                              className="text-brand-blue underline"
                              href={r.website}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {r.website}
                            </a>
                          ) : null}
                        </td>
                        <td className="p-2 align-top whitespace-normal break-words">
                          {r.domain ? (
                            <a
                              className="text-brand-blue underline"
                              href={
                                r.domain.startsWith("http")
                                  ? r.domain
                                  : `http://${r.domain}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {r.domain}
                            </a>
                          ) : null}
                        </td>
                        <td className="p-2 align-top whitespace-normal break-all">
                          {r.facebook ? (
                            <a
                              className="text-brand-blue underline"
                              href={r.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {r.facebook}
                            </a>
                          ) : null}
                        </td>
                        <td className="p-2 align-top whitespace-normal break-all">
                          {r.twitter ? (
                            <a
                              className="text-brand-blue underline"
                              href={r.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {r.twitter}
                            </a>
                          ) : null}
                        </td>
                        <td className="p-2 align-top whitespace-normal break-all">
                          {r.linkedinCompanyPage ? (
                            <a
                              className="text-brand-blue underline"
                              href={r.linkedinCompanyPage}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {r.linkedinCompanyPage}
                            </a>
                          ) : null}
                        </td>
                        <td className="p-2 align-top whitespace-normal break-words">
                          {r.country}
                        </td>
                        <td className="p-2 align-top whitespace-normal break-words">
                          {r.state}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {displayedResults === 0 && (
                <div className="text-center text-muted-foreground py-10">
                  {totalResults > 0
                    ? "No results match your filter. Clear the 'Search Within Results' box."
                    : `No results found. Try changing your search or switching to ${
                        logic === "AND" ? "OR" : "AND"
                      }.`}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
