"use client";

import { useState, useMemo } from "react";
import { Search, FileText, PlusCircle, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
      _id: d._id, // Pass Convex internal ID for deletion
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
      <div className="space-y-8 animate-pulse">
        <div className="flex flex-col gap-2">
           <div className="h-8 w-48 bg-slate-200 rounded" />
           <div className="h-4 w-64 bg-slate-100 rounded" />
        </div>
        <div className="h-16 w-full bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[1,2,3,4].map(i => <div key={i} className="h-48 bg-slate-50 rounded-xl border border-dashed" />)}
        </div>
      </div>
    );
  }

  const isTrulyEmpty = rawDocs.length === 0;

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

      {isTrulyEmpty ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-6 max-w-2xl mx-auto shadow-sm"
        >
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shadow-inner">
            <PlusCircle size={40} />
          </div>
          <div className="space-y-2 px-6">
            <h2 className="text-2xl font-bold text-slate-900">Your library is empty</h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              Get started by submitting your first Google Doc for analysis and tracking. 
              We&apos;ll help you monitor approvals in real-time.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/analyse">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
                Analyse My First Doc
              </Button>
            </Link>
          </div>
        </motion.div>
      ) : (
        <>
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredDocs.map(doc => (
                <DocCard key={doc.id} doc={doc} />
              ))}
            </AnimatePresence>
            {filteredDocs.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-500 bg-white border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                   <Search size={24} />
                </div>
                <div>
                   <p className="font-medium text-slate-900">No documents found</p>
                   <p className="text-sm">Try adjusting your search query or filters.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setQuery(""); setCategoryFilter("all"); }}>
                   Clear Filters
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
