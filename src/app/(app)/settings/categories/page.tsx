"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([
    { name: "Legal", subcategories: ["Contract", "NDA", "Policy"] },
    { name: "Finance", subcategories: ["Invoice", "Budget", "Report"] },
    { name: "Engineering", subcategories: ["RFC", "ADR", "Spec"] },
  ]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Categories</h1>
        <p className="text-slate-500">Manage tags for organizing your documents.</p>
      </div>

      <div className="grid gap-6">
        {categories.map((cat, i) => (
          <Card key={cat.name} className="shadow-sm">
            <CardHeader className="pb-3 border-b bg-slate-50/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{cat.name}</CardTitle>
                <CardDescription>Manage subcategories for {cat.name}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600">
                <Trash2 size={18} />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {cat.subcategories.map(sub => (
                  <div key={sub} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-md text-sm border font-medium text-slate-700">
                    {sub}
                    <button className="text-slate-400 hover:text-rose-600">
                       <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 max-w-sm">
                <Input placeholder="New Subcategory" className="h-8 text-sm" />
                <Button size="sm" variant="secondary" className="h-8">
                  <Plus size={16} className="mr-1" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-dashed shadow-none bg-slate-50 border-2">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
             <div className="font-medium text-slate-700">Need a new Category?</div>
             <div className="flex items-center gap-2 w-full max-w-sm">
                <Input placeholder="Category Name" />
                <Button>
                  <Plus size={16} className="mr-1" /> Create
                </Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
