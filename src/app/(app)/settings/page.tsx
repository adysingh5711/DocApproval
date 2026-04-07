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
import { Settings, Tag, Mail, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = useQuery(api.users.getByEmail as any, session?.user?.email ? { email: session.user.email } : "skip");
  const saveSettings = useMutation(api.users.updateSettings);

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
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium bg-indigo-50 text-indigo-700 rounded-lg">
              <Mail size={18} />
              Email Templates
            </button>
            <Link href="/settings/categories">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-left">
                <Tag size={18} />
                Content Taxonomy
              </button>
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
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
        </div>
      </div>
    </div>
  );
}
