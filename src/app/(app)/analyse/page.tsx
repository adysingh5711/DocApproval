"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, FileSearch, ArrowRight, Loader2, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "../../../../convex/_generated/api";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Paste a Google Docs link",
    body: "Any doc with an active approval request. We extract the file ID automatically.",
  },
  {
    step: "02",
    title: "Tag it to your taxonomy",
    body: "Pick a category and subcategory so your library stays organised from day one.",
  },
  {
    step: "03",
    title: "Get a live approval trail",
    body: "Reviewer responses, timestamps, and status - all synced automatically.",
  },
];

// ── Inline add input row (shared by both pickers) ─────────────────────────────
function InlineAddRow({
  placeholder,
  onAdd,
  onCancel,
}: {
  placeholder: string;
  onAdd: (val: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!value.trim()) return;
    setSaving(true);
    await onAdd(value.trim());
    setValue("");
    setSaving(false);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2.5">
      <Input
        autoFocus
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
          if (e.key === "Escape") { onCancel(); }
        }}
        className="h-7 text-xs border-slate-200 bg-white focus-visible:ring-indigo-500/30 flex-1"
      />
      <Button
        type="button"
        size="sm"
        onClick={handleAdd}
        disabled={saving || !value.trim()}
        className="h-7 px-2.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
      >
        {saving ? <Loader2 size={11} className="animate-spin" /> : "Add"}
      </Button>
      <button
        type="button"
        onClick={onCancel}
        className="text-xs text-slate-400 hover:text-slate-600 shrink-0"
      >
        Cancel
      </button>
    </div>
  );
}

// ── Category picker with inline add ──────────────────────────────────────────
function CategoryPickerPanel({
  categories,
  selectedCategory,
  onSelectCategory,
  userId,
  disabled,
}: {
  categories: any[];
  selectedCategory: string;
  onSelectCategory: (val: string) => void;
  userId: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const addCategory = useMutation(api.categories.addCategory);

  const handleAdd = async (name: string) => {
    await addCategory({ userId: userId as any, name });
    onSelectCategory(name);
    setShowInput(false);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700">Category</Label>
      <div
        className={`border rounded-xl overflow-hidden transition-all ${disabled ? "border-slate-100 opacity-50 pointer-events-none" : "border-slate-200"
          }`}
      >
        <button
          type="button"
          onClick={() => { setOpen((o) => !o); setShowInput(false); }}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-white hover:bg-slate-50 transition-colors text-sm"
        >
          <span className={selectedCategory ? "text-slate-900 font-medium" : "text-slate-400"}>
            {selectedCategory || (disabled ? "Loading..." : "Select category")}
          </span>
          {open
            ? <ChevronUp size={14} className="text-slate-400 shrink-0" />
            : <ChevronDown size={14} className="text-slate-400 shrink-0" />
          }
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden border-t border-slate-100"
            >
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-50">
                {categories.length === 0 && (
                  <p className="px-3 py-3 text-xs text-slate-400 italic">No categories yet.</p>
                )}
                {categories.map((cat) => {
                  const active = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => { onSelectCategory(cat.name); setOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${active
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      <span>{cat.name}</span>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Add footer */}
              <div className="border-t border-slate-100 bg-slate-50/50">
                {!showInput ? (
                  <button
                    type="button"
                    onClick={() => setShowInput(true)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Plus size={12} />
                    Add new category
                  </button>
                ) : (
                  <InlineAddRow
                    placeholder="Category name"
                    onAdd={handleAdd}
                    onCancel={() => setShowInput(false)}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Subcategory picker with inline add ────────────────────────────────────────
function SubcategoryPickerPanel({
  categoryId,
  subcategories,
  selected,
  onSelect,
  disabled,
}: {
  categoryId: string | undefined;
  subcategories: string[];
  selected: string;
  onSelect: (val: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const addSubcategory = useMutation(api.categories.addSubcategory);

  const handleAdd = async (name: string) => {
    if (!categoryId) return;
    await addSubcategory({ categoryId: categoryId as any, name });
    onSelect(name);
    setShowInput(false);
    setOpen(false);
  };

  const placeholder = !categoryId ? "Pick a category first" : "Select subcategory";

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700">Subcategory</Label>
      <div
        className={`border rounded-xl overflow-hidden transition-all ${disabled ? "border-slate-100 opacity-50 pointer-events-none" : "border-slate-200"
          }`}
      >
        <button
          type="button"
          onClick={() => { setOpen((o) => !o); setShowInput(false); }}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-white hover:bg-slate-50 transition-colors text-sm"
        >
          <span className={selected ? "text-slate-900 font-medium" : "text-slate-400"}>
            {selected || placeholder}
          </span>
          {open
            ? <ChevronUp size={14} className="text-slate-400 shrink-0" />
            : <ChevronDown size={14} className="text-slate-400 shrink-0" />
          }
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden border-t border-slate-100"
            >
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-50">
                {subcategories.length === 0 && (
                  <p className="px-3 py-3 text-xs text-slate-400 italic">No subcategories yet.</p>
                )}
                {subcategories.map((sub) => {
                  const active = selected === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => { onSelect(sub); setOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${active
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      <span>{sub}</span>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Add footer */}
              <div className="border-t border-slate-100 bg-slate-50/50">
                {!showInput ? (
                  <button
                    type="button"
                    onClick={() => setShowInput(true)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Plus size={12} />
                    Add new subcategory
                  </button>
                ) : (
                  <InlineAddRow
                    placeholder="Subcategory name"
                    onAdd={handleAdd}
                    onCancel={() => setShowInput(false)}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AnalysePage() {
  const { data: session } = useSession();
  const user = useQuery(
    api.users.getByEmail as any,
    session?.user?.email ? { email: session.user.email } : "skip"
  );
  const categoriesList = useQuery(
    api.categories.getByUser,
    user?._id ? { userId: user._id } : "skip"
  );

  const router = useRouter();
  const [url, setUrl] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCategory = categoriesList?.find((c) => c.name === categoryName);

  const handleAnalyse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const match = url.match(/\/d\/([a-zA-Z0-9_-]{25,})\//);
    if (!match) {
      setError("Invalid Google Docs/Drive URL. Please check the link and try again.");
      return;
    }
    const fileId = match[1];

    if (!categoryName || !subcategory) {
      setError("Please select both a category and subcategory.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, category: categoryName, subcategory }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to analyse document.");
        setLoading(false);
        return;
      }
      router.push(`/analyse/${fileId}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        {/* ── Left context panel ── */}
        <div className="hidden lg:flex lg:col-span-2 flex-col gap-8 pt-1">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">
              How it works
            </p>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
              Three steps to a full approval trail.
            </h2>
          </div>
          <div className="space-y-4">
            {HOW_IT_WORKS.map((s) => (
              <div
                key={s.step}
                className="relative bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-5 overflow-hidden"
              >
                <span className="absolute -top-2 -right-1 text-7xl font-bold text-indigo-100 select-none pointer-events-none leading-none">
                  {s.step}
                </span>
                <span className="relative text-xs font-bold text-indigo-500">{s.step}</span>
                <h3 className="relative text-sm font-semibold text-slate-900 mt-1">{s.title}</h3>
                <p className="relative text-xs text-slate-500 leading-relaxed mt-1">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right form ── */}
        <div className="lg:col-span-3">
          <div className="mb-6 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Analyse a document
            </h1>
            <p className="text-sm text-slate-500">
              Submit a Google Doc URL to start tracking its approval.
            </p>
          </div>

          <form
            onSubmit={handleAnalyse}
            className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6"
          >
            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="doc-url" className="text-sm font-medium text-slate-700">
                Document link
              </Label>
              <div className="relative">
                <FileSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="doc-url"
                  placeholder="https://docs.google.com/document/d/.../edit"
                  className="pl-9 border-slate-200 focus-visible:ring-indigo-500/30 text-sm"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CategoryPickerPanel
                categories={categoriesList || []}
                selectedCategory={categoryName}
                onSelectCategory={(val) => { setCategoryName(val); setSubcategory(""); }}
                userId={user?._id ?? ""}
                disabled={categoriesList === undefined}
              />
              <SubcategoryPickerPanel
                categoryId={selectedCategory?._id}
                subcategories={selectedCategory?.subcategories || []}
                selected={subcategory}
                onSelect={setSubcategory}
                disabled={!categoryName}
              />
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100"
                >
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 min-w-[160px] h-10"
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" /> Analysing...</>
                ) : (
                  <>Analyse document <ArrowRight size={15} /></>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
