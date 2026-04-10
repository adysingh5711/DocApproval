"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const STATUSES = [
  { id: "PENDING", label: "Pending", dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "APPROVED", label: "Approved", dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "DECLINED", label: "Declined", dot: "bg-rose-400", badge: "bg-rose-50 text-rose-700 border-rose-200" },
  { id: "CANCELLED", label: "Cancelled", dot: "bg-slate-300", badge: "bg-slate-50 text-slate-500 border-slate-200" },
];

interface FilterItem { id: string; name: string; }
interface FilterPanelProps {
  categories: FilterItem[];
  subCategories: FilterItem[];
  onApply: (filters: any) => void;
  onReset: () => void;
}

function Section({ title }: { title: string }) {
  return (
    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pt-1">
      {title}
    </p>
  );
}

export function FilterPanel({ categories, subCategories, onApply, onReset }: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    statuses: [] as string[],
    categories: [] as string[],
    subCategories: [] as string[],
  });

  const totalActive =
    selectedFilters.statuses.length +
    selectedFilters.categories.length +
    selectedFilters.subCategories.length;

  const fuseCategories = useMemo(() => new Fuse(categories, { keys: ["name"] }), [categories]);
  const fuseSubCategories = useMemo(() => new Fuse(subCategories, { keys: ["name"] }), [subCategories]);

  const filteredCategories = search
    ? fuseCategories.search(search).map((r) => r.item)
    : categories;
  const filteredSubCategories = search
    ? fuseSubCategories.search(search).map((r) => r.item)
    : subCategories;

  const toggle = (type: "statuses" | "categories" | "subCategories", id: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter((i) => i !== id)
        : [...prev[type], id],
    }));
  };

  const handleReset = () => {
    setSelectedFilters({ statuses: [], categories: [], subCategories: [] });
    setSearch("");
    onReset();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={(props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
          <Button
            {...props}
            variant="outline"
            className={`gap-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-all ${totalActive > 0
                ? "border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-50"
                : ""
              }`}
          >
            <SlidersHorizontal size={14} />
            Filters
            {totalActive > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                {totalActive}
              </span>
            )}
          </Button>
        )}
      />

      <PopoverContent
        className="w-72 p-0 shadow-lg border border-slate-100 rounded-xl overflow-hidden"
        align="end"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-900">Filters</span>
          {totalActive > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X size={11} />
              Clear all
            </button>
          )}
        </div>

        <div className="p-4 space-y-5 max-h-[380px] overflow-y-auto custom-scrollbar">

          {/* Status */}
          <div className="space-y-2">
            <Section title="Status" />
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => {
                const active = selectedFilters.statuses.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggle("statuses", s.id)}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${active
                        ? s.badge + " ring-1 ring-offset-1 ring-current"
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${active ? s.dot : "bg-slate-300"}`} />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search for categories */}
          {(categories.length > 0 || subCategories.length > 0) && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search categories..."
                className="pl-8 h-8 text-xs border-slate-200 focus-visible:ring-indigo-500/30 bg-slate-50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}

          {/* Categories */}
          {filteredCategories.length > 0 && (
            <div className="space-y-2">
              <Section title="Category" />
              <div className="space-y-1">
                {filteredCategories.map((c) => {
                  const active = selectedFilters.categories.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggle("categories", c.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${active
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      <span>{c.name}</span>
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subcategories */}
          {filteredSubCategories.length > 0 && (
            <div className="space-y-2">
              <Section title="Subcategory" />
              <div className="space-y-1">
                {filteredSubCategories.map((sc) => {
                  const active = selectedFilters.subCategories.includes(sc.id);
                  return (
                    <button
                      key={sc.id}
                      onClick={() => toggle("subCategories", sc.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${active
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      <span>{sc.name}</span>
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
          <Button
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm h-9"
            onClick={() => { onApply(selectedFilters); setOpen(false); }}
          >
            Apply
          </Button>
          <Button
            variant="ghost"
            className="flex-1 text-slate-500 hover:bg-slate-100 text-sm h-9"
            onClick={handleReset}
          >
            Reset
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
