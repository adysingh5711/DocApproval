"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocCard, Doc } from "@/components/dashboard/DocCard";
import { AnimatePresence, motion } from "framer-motion";
import Fuse from "fuse.js";

const mockDocs: Doc[] = [
  { id: "doc-1", title: "Q3 Marketing Campaign Brief", status: "APPROVED", category: "Marketing", subcategory: "Campaign Brief", isTracking: false, lastAnalysedAt: "6 Apr 2026" },
  { id: "doc-2", title: "Acme Corp NDA v2", status: "PENDING", category: "Legal", subcategory: "NDA", isTracking: true, lastAnalysedAt: "5 Apr 2026" },
  { id: "doc-3", title: "Q1 Server Costs Report", status: "DECLINED", category: "Finance", subcategory: "Report", isTracking: false, lastAnalysedAt: "2 Apr 2026" },
  { id: "doc-4", title: "Database Migration ADR", status: "PENDING", category: "Engineering", subcategory: "ADR", isTracking: true, lastAnalysedAt: "7 Apr 2026" },
  { id: "doc-5", title: "Candidate Offer Letter - JS", status: "APPROVED", category: "HR", subcategory: "Offer Letter", isTracking: false, lastAnalysedAt: "7 Apr 2026" },
];

const categories = Array.from(new Set(mockDocs.map(d => d.category)));

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const fuse = useMemo(() => new Fuse(mockDocs, { keys: ["title", "category", "subcategory"], threshold: 0.3 }), []);

  const filteredDocs = useMemo(() => {
    let result = mockDocs;
    if (query) {
      result = fuse.search(query).map(res => res.item);
    }
    if (categoryFilter !== "all") {
      result = result.filter(d => d.category === categoryFilter);
    }
    return result;
  }, [query, categoryFilter, fuse]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Manage your document approval library.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input 
            placeholder="Search documents by title or category..." 
            className="pl-9" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || "all")}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredDocs.map(doc => (
            <DocCard key={doc.id} doc={doc} />
          ))}
        </AnimatePresence>
        {filteredDocs.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white border border-dashed rounded-xl">
            No documents found matching your filters.
          </div>
        )}
      </motion.div>
    </div>
  );
}
