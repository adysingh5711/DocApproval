"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocCard, Doc } from "@/components/dashboard/DocCard";
import { AnimatePresence, motion } from "framer-motion";
import Fuse from "fuse.js";

import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = useQuery(api.users.getByEmail as any, session?.user?.email ? { email: session.user.email } : "skip");
  const rawDocs = useQuery(api.documents.getByUserWithTracking, user?._id ? { userId: user._id } : "skip");

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const docsMap: Doc[] = useMemo(() => {
    if (!rawDocs) return [];
    return rawDocs.map((d: any) => ({
      id: d.fileId,
      title: d.title,
      status: d.latestApprovalSnapshot?.status || "PENDING",
      category: d.category || "Uncategorized",
      subcategory: d.subcategory || "None",
      isTracking: d.isTracking || false,
      lastAnalysedAt: new Date(d.lastAnalysedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    }));
  }, [rawDocs]);

  const categories = useMemo(() => Array.from(new Set(docsMap.map((d) => d.category))), [docsMap]);

  const fuse = useMemo(() => new Fuse(docsMap, { keys: ["title", "category", "subcategory"], threshold: 0.3 }), [docsMap]);

  const filteredDocs = useMemo(() => {
    let result = docsMap;
    if (query) {
      result = fuse.search(query).map(res => res.item);
    }
    if (categoryFilter !== "all") {
      result = result.filter(d => d.category === categoryFilter);
    }
    return result;
  }, [query, categoryFilter, fuse, docsMap]);

  if (rawDocs === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

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
