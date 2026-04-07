"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function CategoriesPage() {
  const { data: session } = useSession();
  const user = useQuery(api.users.getByEmail as any, session?.user?.email ? { email: session.user.email } : "skip");
  const categoriesList = useQuery(api.categories.getByUser, user?._id ? { userId: user._id } : "skip");

  const addCategory = useMutation(api.categories.addCategory);
  const deleteCategory = useMutation(api.categories.removeCategory);
  
  const [newCatName, setNewCatName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreateCategory = async () => {
    if (!newCatName || !user) return;
    setCreating(true);
    try {
      await addCategory({ userId: user._id, name: newCatName });
      setNewCatName("");
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCategory = async (id: Id<"categories">) => {
    if (!confirm("Are you sure you want to delete this category and all its subcategories?")) return;
    try {
      await deleteCategory({ categoryId: id });
    } catch (err) {
      console.error(err);
    }
  };

  if (categoriesList === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Categories</h1>
        <p className="text-slate-500">Manage tags for organizing your documents.</p>
      </div>

      <div className="grid gap-6">
        {(categoriesList || []).map((cat: any) => (
          <CategoryCard 
            key={cat._id} 
            category={cat} 
            onDelete={() => handleDeleteCategory(cat._id)} 
          />
        ))}

        <Card className="border-dashed shadow-none bg-slate-50 border-2">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
             <div className="font-medium text-slate-700">Need a new Category?</div>
             <div className="flex items-center gap-2 w-full max-w-sm">
                <Input 
                  placeholder="Category Name (e.g. Legal)" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                />
                <Button onClick={handleCreateCategory} disabled={creating || !newCatName}>
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={16} className="mr-1" />}
                  Create
                </Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CategoryCard({ category, onDelete }: { category: any, onDelete: () => void }) {
  const addSub = useMutation(api.categories.addSubcategory);
  const removeSub = useMutation(api.categories.removeSubcategory);
  const [newSub, setNewSub] = useState("");
  const [pending, setPending] = useState(false);

  const handleAddSub = async () => {
    if (!newSub) return;
    setPending(true);
    try {
      await addSub({ categoryId: category._id, name: newSub });
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
    <Card className="shadow-sm border border-slate-200 overflow-hidden">
      <CardHeader className="pb-3 border-b bg-slate-50/50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold text-slate-900">{category.name}</CardTitle>
          <CardDescription>Manage subcategories for {category.name}</CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
          onClick={onDelete}
        >
          <Trash2 size={18} />
        </Button>
      </CardHeader>
      <CardContent className="pt-4 bg-white">
        <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
          {category.subcategories.length === 0 && (
            <p className="text-sm text-slate-400 italic py-1">No subcategories defined.</p>
          )}
          {category.subcategories.map((sub: string) => (
            <div key={sub} className="flex items-center gap-2 bg-indigo-50/50 px-3 py-1.5 rounded-md text-sm border border-indigo-100 font-medium text-indigo-900 group">
              {sub}
              <button 
                className="text-slate-300 hover:text-rose-600 transition-colors"
                onClick={() => handleRemoveSub(sub)}
              >
                 <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 max-w-sm">
          <Input 
            placeholder="New Subcategory" 
            className="h-9 text-sm" 
            value={newSub}
            onChange={(e) => setNewSub(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSub()}
          />
          <Button 
            size="sm" 
            variant="secondary" 
            className="h-9 whitespace-nowrap"
            onClick={handleAddSub}
            disabled={pending || !newSub}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={16} className="mr-1" />}
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
