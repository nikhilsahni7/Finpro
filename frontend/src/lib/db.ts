import Dexie, { type Table } from "dexie";

export type Contact = {
  id?: number;
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
  twitter: string;
  linkedinCompanyPage: string;
  country: string;
  state: string;
};

class FinproDB extends Dexie {
  contacts!: Table<Contact, number>;

  constructor() {
    super("finpro-db");
    this.version(1).stores({
      // Index a few frequently searched fields; others can still be filtered in memory
      contacts:
        "++id, name, email, phone, company, position, domain, state, linkedin",
    });
  }
}

export const db = new FinproDB();

export async function seedContactsBatch(rows: Contact[]) {
  if (!rows.length) return;
  await db.contacts.bulkPut(rows);
}

export type SearchParams = {
  logic: "AND" | "OR";
  page: number;
  pageSize: number;
} & Partial<
  Pick<
    Contact,
    | "name"
    | "email"
    | "phone"
    | "linkedin"
    | "position"
    | "company"
    | "companyPhone"
    | "website"
    | "domain"
    | "facebook"
    | "linkedinCompanyPage"
    | "state"
  >
>;

function includes(a: string, b: string) {
  if (!b) return true;
  return (a || "").toLowerCase().includes(b.toLowerCase());
}

export async function searchContacts(params: SearchParams) {
  const { page, pageSize, logic, ...filters } = params;
  // Start from a broad set using a cheap indexed filter first when possible
  const coll = db.contacts.toCollection();

  // Fetch a reasonably sized window, then refine in-memory; for demo scale this is fine
  const windowSize = pageSize * 10;
  const windowRows = await coll.limit(windowSize).toArray();

  const entries = Object.entries(filters).filter(([, v]) => v && v.trim());
  const filtered = entries.length
    ? windowRows.filter((r) => {
        const checks = entries.map(([k, v]) => {
          const val = String(v);
          switch (k as keyof typeof filters) {
            case "name":
              return includes(r.name, val);
            case "email":
              return includes(r.email, val);
            case "phone":
              return includes(r.phone, val);
            case "linkedin":
              return includes(r.linkedin, val);
            case "position":
              return includes(r.position, val);
            case "company":
              return includes(r.company, val);
            case "companyPhone":
              return includes(r.companyPhone, val);
            case "website":
              return includes(r.website, val);
            case "domain":
              return includes(r.domain, val);
            case "facebook":
              return includes(r.facebook, val);
            case "linkedinCompanyPage":
              return includes(r.linkedinCompanyPage, val);
            case "state":
              return includes(r.state, val);
            default:
              return true;
          }
        });
        return logic === "AND" ? checks.every(Boolean) : checks.some(Boolean);
      })
    : windowRows;

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return { total, page, pageSize, rows: filtered.slice(start, end) };
}
