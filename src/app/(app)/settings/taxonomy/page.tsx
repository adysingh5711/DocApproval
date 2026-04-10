"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function TaxonomyPage() {
    const { data: session } = useSession();
    const user = useQuery(
        api.users.getByEmail as any,
        session?.user?.email ? { email: session.user.email } : "skip"
    );

    if (user === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!user) return null;

    return <TaxonomyContent userId={user._id} />;
}

function TaxonomyContent({ userId }: { userId: Id<"users"> }) {
    const categoriesList = useQuery(api.categories.getByUser, { userId });
    const addCategory = useMutation(api.categories.addCategory);
    const deleteCategory = useMutation(api.categories.removeCategory);

    const [newCatName, setNewCatName] = useState("");
    const [creating, setCreating] = useState(false);

    const handleCreateCategory = async () => {
        if (!newCatName.trim()) return;
        setCreating(true);
        try {
            await addCategory({ userId, name: newCatName.trim() });
            setNewCatName("");
        } catch (err) {
            console.error(err);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteCategory = async (id: Id<"categories">) => {
        if (!confirm("Delete this category and all its subcategories?")) return;
        try {
            await deleteCategory({ categoryId: id });
        } catch (err) {
            console.error(err);
        }
    };

    if (categoriesList === undefined) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl pb-12">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Content taxonomy</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                    Categories and subcategories for organising your documents.
                </p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">

                {/* Column header */}
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                        {categoriesList.length} {categoriesList.length === 1 ? "category" : "categories"}
                    </p>
                </div>

                {/* Category rows */}
                <div className="divide-y divide-slate-100">
                    {categoriesList.length === 0 && (
                        <div className="px-5 py-10 text-center text-sm text-slate-400">
                            No categories yet. Add one below.
                        </div>
                    )}
                    {categoriesList.map((cat: any) => (
                        <CategoryRow
                            key={cat._id}
                            category={cat}
                            onDelete={() => handleDeleteCategory(cat._id)}
                        />
                    ))}
                </div>

                {/* Add category */}
                <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2 max-w-sm">
                        <Input
                            placeholder="New category name"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                            className="h-9 text-sm border-slate-200 bg-white focus-visible:ring-indigo-500/30"
                        />
                        <Button
                            onClick={handleCreateCategory}
                            disabled={creating || !newCatName.trim()}
                            size="sm"
                            className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shrink-0"
                        >
                            {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus size={14} />}
                            Add
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CategoryRow({ category, onDelete }: { category: any; onDelete: () => void }) {
    const addSub = useMutation(api.categories.addSubcategory);
    const removeSub = useMutation(api.categories.removeSubcategory);
    const [newSub, setNewSub] = useState("");
    const [pending, setPending] = useState(false);

    const handleAddSub = async () => {
        if (!newSub.trim()) return;
        setPending(true);
        try {
            await addSub({ categoryId: category._id, name: newSub.trim() });
            setNewSub("");
        } catch (err) {
            console.error(err);
        } finally {
            setPending(false);
        }
    };

    const handleRemoveSub = async (sub: string) => {
        try {
            await removeSub({ categoryId: category._id, name: sub });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="px-5 py-4 space-y-3">
            {/* Category name + delete */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">{category.name}</span>
                <button
                    onClick={onDelete}
                    className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-all"
                    title="Delete category"
                >
                    <Trash2 size={13} />
                </button>
            </div>

            {/* Subcategory chips */}
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                {category.subcategories.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-0.5">No subcategories yet.</p>
                )}
                {category.subcategories.map((sub: string) => (
                    <span
                        key={sub}
                        className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full text-xs font-medium"
                    >
                        {sub}
                        <button
                            onClick={() => handleRemoveSub(sub)}
                            className="text-indigo-300 hover:text-rose-500 transition-colors"
                        >
                            <X size={10} />
                        </button>
                    </span>
                ))}
            </div>

            {/* Add subcategory */}
            <div className="flex items-center gap-2 max-w-xs">
                <Input
                    placeholder="Add subcategory"
                    className="h-8 text-xs border-slate-200 focus-visible:ring-indigo-500/30"
                    value={newSub}
                    onChange={(e) => setNewSub(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSub()}
                />
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-3 text-xs text-indigo-600 hover:bg-indigo-50 gap-1 shrink-0"
                    onClick={handleAddSub}
                    disabled={pending || !newSub.trim()}
                >
                    {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus size={12} />}
                    Add
                </Button>
            </div>
        </div>
    );
}
