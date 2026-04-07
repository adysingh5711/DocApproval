"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useQuery } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "../../../../convex/_generated/api";

export default function AnalysePage() {
  const { data: session } = useSession();
  const user = useQuery(api.users.getByEmail as any, session?.user?.email ? { email: session.user.email } : "skip");
  const categoriesList = useQuery(api.categories.getByUser, user?._id ? { userId: user._id } : "skip");

  const router = useRouter();
  const [url, setUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCategory = categoriesList?.find(c => c._id === categoryId);

  const handleAnalyse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Regex to capture fileId
    const match = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (!match) {
      setError("Invalid Google Docs URL. Please check the link and try again.");
      return;
    }
    const fileId = match[1];

    if (!categoryId || !subcategory) {
      setError("Please select both category and subcategory.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fileId, 
          category: selectedCategory?.name || "", 
          subcategory 
        }),
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analyse Document</h1>
        <p className="text-slate-500">Submit a new Google Doc URL for approval tracking.</p>
      </div>

      <Card className="border shadow-sm">
        <form onSubmit={handleAnalyse}>
          <CardHeader>
            <CardTitle className="text-xl">Document Details</CardTitle>
            <CardDescription>Enter the link to the document and map it to your content taxonomy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="doc-url">Document Link</Label>
              <Input 
                id="doc-url" 
                placeholder="https://docs.google.com/document/d/.../edit" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={categoryId} 
                  onValueChange={(val) => { setCategoryId(val || ""); setSubcategory(""); }}
                  disabled={categoriesList === undefined}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder={categoriesList === undefined ? "Loading..." : "Select Category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(categoriesList || []).map(cat => (
                      <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                    ))}
                    {categoriesList !== undefined && categoriesList.length === 0 && (
                      <SelectItem value="none" disabled>No categories found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Select 
                  value={subcategory} 
                  onValueChange={(val) => setSubcategory(val || "")}
                  disabled={!categoryId || categoriesList === undefined}
                >
                  <SelectTrigger id="subcategory">
                    <SelectValue placeholder={!categoryId ? "Pick a category first" : "Select Subcategory"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(selectedCategory?.subcategories || []).map(sub => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100">
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto relative group overflow-hidden">
                <motion.div 
                  initial={false}
                  animate={{ y: loading ? -30 : 0 }}
                  className="flex items-center gap-2"
                >
                  Analyse Document
                </motion.div>
                <motion.div 
                  initial={{ y: 30 }}
                  animate={{ y: loading ? 0 : 30 }}
                  className="absolute inset-0 flex items-center justify-center gap-1"
                >
                  <div className="h-1.5 w-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-1.5 w-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-1.5 w-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </motion.div>
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
