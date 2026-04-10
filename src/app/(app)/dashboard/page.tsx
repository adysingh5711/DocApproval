"use client";

import { useState, useMemo } from "react";
import { Search, FileText, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterPanel } from "@/components/analyse/FilterPanel";
import { DocCard, Doc } from "@/components/dashboard/DocCard";
import { AnimatePresence, motion } from "framer-motion";
import Fuse from "fuse.js";
import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = useQuery(
    api.users.getByEmail as any,
    session?.user?.email ? { email: session.user.email } : "skip"
  );
  const rawDocs = useQuery(
    api.documents.getByUserWithTracking,
    user?._id ? { userId: user._id } : "skip"
  );

  const [query, setQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    statuses: [] as string[],
    categories: [] as string[],
    subCategories: [] as string[],
  });

  const docsMap: Doc[] = useMemo(() => {
    if (!rawDocs) return [];
    return rawDocs.map((d: any) => ({
      id: d.fileId,
      _id: d._id,
      title: d.title,
      status: d.latestApprovalSnapshot?.status || "PENDING",
      category: d.category || "Uncategorized",
      subcategory: d.subcategory || "None",
      isTracking: d.isTracking || false,
      lastAnalysedAt: new Date(d.lastAnalysedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    }));
  }, [rawDocs]);

  const categories = useMemo(
    () => Array.from(new Set(docsMap.map((d) => d.category))),
    [docsMap]
  );
  const subCategories = useMemo(
    () => Array.from(new Set(docsMap.map((d) => d.subcategory))),
    [docsMap]
  );

  const fuse = useMemo(
    () =>
      new Fuse(docsMap, {
        keys: ["title", "category", "subcategory"],
        threshold: 0.3,
      }),
    [docsMap]
  );

  const filteredDocs = useMemo(() => {
    let result = docsMap;
    if (query) result = fuse.search(query).map((r) => r.item);
    if (selectedFilters.statuses.length > 0)
      result = result.filter((d) => selectedFilters.statuses.includes(d.status));
    if (selectedFilters.categories.length > 0)
      result = result.filter((d) =>
        selectedFilters.categories.includes(d.category)
      );
    if (selectedFilters.subCategories.length > 0)
      result = result.filter((d) =>
        selectedFilters.subCategories.includes(d.subcategory)
      );
    return result;
  }, [query, selectedFilters, fuse, docsMap]);

  // ── Summary counts ──
  const pending = docsMap.filter((d) => d.status === "PENDING").length;
  const approved = docsMap.filter((d) => d.status === "APPROVED").length;
  const tracking = docsMap.filter((d) => d.isTracking).length;

  // ── Loading skeleton ──
  if (rawDocs === undefined) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 flex-1 bg-slate-100 rounded-xl" />
          ))}
        </div>
        <div className="h-10 w-full bg-slate-100 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-xl border border-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  const isTrulyEmpty = rawDocs.length === 0;

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Documents
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Your approval library
          </p>
        </div>
        <Link href="/analyse">
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm"
          >
            <PlusCircle size={15} />
            Analyse a doc
          </Button>
        </Link>
      </div>

      {/* ── Stat bar (only when docs exist) ── */}
      {!isTrulyEmpty && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Pending", value: pending, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
            { label: "Approved", value: approved, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { label: "Tracking", value: tracking, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} border ${stat.border} rounded-xl px-5 py-4`}
            >
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Search + filter ── */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search by title or category..."
            className="pl-9 bg-white border-slate-200 focus-visible:ring-indigo-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <FilterPanel
          categories={categories.map((c) => ({ id: c, name: c }))}
          subCategories={subCategories.map((s) => ({ id: s, name: s }))}
          onApply={(filters) => setSelectedFilters(filters)}
          onReset={() =>
            setSelectedFilters({
              statuses: [],
              categories: [],
              subCategories: [],
            })
          }
        />
      </div>

      {/* ── Empty state ── */}
      {isTrulyEmpty ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center space-y-5"
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
            <FileText size={26} />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">
              No documents yet
            </h2>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              Analyse your first Google Doc to start tracking approvals.
            </p>
          </div>
          <Link href="/analyse">
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              <PlusCircle size={14} />
              Analyse my first doc
            </Button>
          </Link>
        </motion.div>
      ) : (
        <>
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filteredDocs.map((doc) => (
                <DocCard key={doc.id} doc={doc} />
              ))}
            </AnimatePresence>

            {filteredDocs.length === 0 && (
              <div className="col-span-full py-16 text-center flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <Search size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    No results
                  </p>
                  <p className="text-xs text-slate-500">
                    Try a different search or clear your filters.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setQuery("");
                    setSelectedFilters({
                      statuses: [],
                      categories: [],
                      subCategories: [],
                    });
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
