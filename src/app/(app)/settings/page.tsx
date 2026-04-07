"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Settings, Tag, Mail, Loader2, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = useQuery(api.users.getByEmail as any, session?.user?.email ? { email: session.user.email } : "skip");
  const saveSettings = useMutation(api.users.updateSettings);

  const [activeTab, setActiveTab] = useState<"email" | "taxonomy">("email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setSubject(user.reminderSubject || "");
      setBody(user.reminderBody || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveSettings({
        userId: user._id,
        reminderSubject: subject,
        reminderBody: body,
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500">Configure your personal preferences and automation templates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <div className="bg-white rounded-xl border p-2 shadow-sm space-y-1">
            <button 
              onClick={() => setActiveTab("email")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left",
                activeTab === "email" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <Mail size={18} />
              Email Templates
            </button>
            <button 
              onClick={() => setActiveTab("taxonomy")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left",
                activeTab === "taxonomy" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <Tag size={18} />
              Content Taxonomy
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === "email" ? (
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="text-indigo-600" size={20} />
                  Default Reminder Template
                </CardTitle>
                <CardDescription>
                  Customize the default text for your approval reminder emails. You can still edit these before sending individual emails.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Default Subject</Label>
                  <Input 
                    id="subject" 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Approval Reminder: {Document Title}" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Default Body Content</Label>
                  <div className="relative">
                    <Textarea 
                      id="body" 
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="e.g. Kindly review the document {Document Link}..."
                      className="min-h-[160px] resize-none"
                    />
                  </div>
                  <div className="bg-slate-50 border p-3 rounded-lg text-xs text-slate-500 space-y-2">
                    <p className="font-semibold text-slate-700 uppercase tracking-wider">Available Variables:</p>
                    <div className="flex flex-wrap gap-2">
                      <code className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono border border-indigo-100">{`{Document Title}`}</code>
                      <code className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono border border-indigo-100">{`{Document Link}`}</code>
                    </div>
                    <p>These will be automatically replaced with the actual document details when sending.</p>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t">
                   {showSuccess ? (
                      <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium animate-in fade-in slide-in-from-left-2">
                        <CheckCircle2 size={16} />
                        Settings saved successfully
                      </div>
                   ) : <div />}
                   <Button 
                     onClick={handleSave} 
                     disabled={saving}
                     className="bg-indigo-600 hover:bg-indigo-700 min-w-[120px]"
                   >
                     {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Save Templates"}
                   </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <ContentTaxonomySection userId={user._id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ContentTaxonomySection({ userId }: { userId: Id<"users"> }) {
  const categoriesList = useQuery(api.categories.getByUser, { userId });
  const addCategory = useMutation(api.categories.addCategory);
  const deleteCategory = useMutation(api.categories.removeCategory);
  
  const [newCatName, setNewCatName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreateCategory = async () => {
    if (!newCatName) return;
    setCreating(true);
    try {
      await addCategory({ userId, name: newCatName });
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
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <Tag className="text-indigo-600" size={20} />
          Content Taxonomy
        </h2>
        <p className="text-sm text-slate-500">Manage categories and subcategories for organizing your documents.</p>
      </div>

      <div className="grid gap-6">
        {(categoriesList || []).map((cat: any) => (
          <CategoryCard 
            key={cat._id} 
            category={cat} 
            onDelete={() => handleDeleteCategory(cat._id)} 
          />
        ))}

        <Card className="border-dashed shadow-none bg-slate-50/50 border-2">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
             <div className="text-sm font-medium text-slate-700">Add a new Category</div>
             <div className="flex items-center gap-2 w-full max-w-sm">
                <Input 
                  placeholder="e.g. Legal, Marketing" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                  className="bg-white"
                />
                <Button onClick={handleCreateCategory} disabled={creating || !newCatName} size="sm">
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
      <CardHeader className="pb-3 border-b bg-slate-50/30 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold text-slate-900">{category.name}</CardTitle>
          <CardDescription className="text-xs">Manage subcategories</CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
          onClick={onDelete}
        >
          <Trash2 size={16} />
        </Button>
      </CardHeader>
      <CardContent className="pt-4 bg-white">
        <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
          {category.subcategories.length === 0 && (
            <p className="text-xs text-slate-400 italic py-1">No subcategories defined.</p>
          )}
          {category.subcategories.map((sub: string) => (
            <div key={sub} className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-md text-xs border font-medium text-slate-700 group">
              {sub}
              <button 
                className="text-slate-300 hover:text-rose-600 transition-colors"
                onClick={() => handleRemoveSub(sub)}
              >
                 <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 max-w-sm">
          <Input 
            placeholder="New Subcategory" 
            className="h-8 text-xs" 
            value={newSub}
            onChange={(e) => setNewSub(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSub()}
          />
          <Button 
            size="sm" 
            variant="secondary" 
            className="h-8 whitespace-nowrap text-xs px-3"
            onClick={handleAddSub}
            disabled={pending || !newSub}
          >
            {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus size={14} className="mr-1" />}
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
