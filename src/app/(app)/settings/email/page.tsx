"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { DEFAULT_SUBJECT, DEFAULT_BODY } from "@/components/analyse/EmailModal";


export default function EmailTemplatesPage() {
    const { data: session } = useSession();
    const user = useQuery(
        api.users.getByEmail as any,
        session?.user?.email ? { email: session.user.email } : "skip"
    );
    const saveSettings = useMutation(api.users.updateSettings);

    const [subject, setSubject] = useState(DEFAULT_SUBJECT);
    const [body, setBody] = useState(DEFAULT_BODY);
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
            await saveSettings({ userId: user._id, reminderSubject: subject, reminderBody: body });
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
                <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl pb-12">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Email templates</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                    Pre-fills the reminder email when you nudge a reviewer. Editable before each send.
                </p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium text-slate-700">
                        Subject
                    </Label>
                    <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Approval reminder: {Document Title}"
                        className="border-slate-200 focus-visible:ring-indigo-500/30 text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="body" className="text-sm font-medium text-slate-700">
                        Body
                    </Label>
                    <Textarea
                        id="body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="e.g. Kindly review the document at {Document Link}..."
                        className="min-h-[140px] resize-none border-slate-200 focus-visible:ring-indigo-500/30 text-sm"
                    />
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 space-y-2">
                        <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest">
                            Available variables
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {["{Document Title}", "{Document Link}"].map((v) => (
                                <code
                                    key={v}
                                    className="bg-white text-indigo-700 px-2 py-0.5 rounded-lg text-xs font-mono border border-indigo-200"
                                >
                                    {v}
                                </code>
                            ))}
                        </div>
                        <p className="text-xs text-indigo-400 leading-relaxed">
                            Replaced automatically with real document details on send.
                        </p>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    {showSuccess ? (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 size={14} />
                            Saved
                        </span>
                    ) : (
                        <span />
                    )}
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 min-w-[120px] h-9 text-sm"
                    >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save template"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
