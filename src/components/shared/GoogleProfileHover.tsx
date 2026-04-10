"use client";

import { useState, useEffect, useRef } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, MessageSquare, Video, Calendar, Copy, ExternalLink, Check } from "lucide-react";

// ── Store (unchanged) ─────────────────────────────────────────────────────────
interface Person {
  name: string;
  photoUrl: string | null;
  email: string;
  jobTitle: string | null;
  company: string | null;
  contactsUrl: string | null;
  chatDmUrl: string | null;
}

const profileCache: Record<string, Person> = {};
const listeners: Set<() => void> = new Set();
let activeEmail: string | null = null;
const notify = () => listeners.forEach((l) => l());

const store = {
  getProfile: (email: string) => profileCache[email],
  setProfile: (email: string, person: Person) => { profileCache[email] = person; notify(); },
  getActiveEmail: () => activeEmail,
  setActiveEmail: (email: string | null) => { activeEmail = email; notify(); },
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

// ── ReviewerAvatar (unchanged) ────────────────────────────────────────────────
export function ReviewerAvatar({ email, name, className }: { email: string; name: string; className?: string }) {
  const [profile, setProfile] = useState<Person | null>(store.getProfile(email));

  useEffect(() => {
    return store.subscribe(() => setProfile(store.getProfile(email)));
  }, [email]);

  return (
    <Avatar className={className}>
      <AvatarImage src={profile?.photoUrl || undefined} className="object-cover" />
      <AvatarFallback className="bg-indigo-50 text-indigo-700 text-xs font-bold">
        {name.split(" ").map((n) => n[0]).join("").toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

// ── Action icon button ────────────────────────────────────────────────────────
function ActionBtn({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-30 disabled:pointer-events-none"
    >
      {icon}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function GoogleProfileHover({
  email,
  name,
  children,
  initialProfile,
}: {
  email: string;
  name: string;
  children: React.ReactNode;
  initialProfile?: Person | null;
}) {
  const [profile, setProfile] = useState<Person | null>(store.getProfile(email) || initialProfile || null);
  const [active, setActive] = useState(store.getActiveEmail() === email);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const fetchPromise = useRef<Promise<void> | null>(null);
  const isOver = useRef(false);

  useEffect(() => {
    if (initialProfile) store.setProfile(email, initialProfile);
  }, [email, initialProfile]);

  useEffect(() => {
    return store.subscribe(() => {
      setProfile(store.getProfile(email));
      setActive(store.getActiveEmail() === email);
    });
  }, [email]);

  const fetchProfile = async () => {
    if (fetchPromise.current) return fetchPromise.current;
    if (store.getProfile(email)) return Promise.resolve();
    setLoading(true);
    fetchPromise.current = (async () => {
      try {
        const res = await fetch(`/api/user/profile?email=${encodeURIComponent(email)}&t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        store.setProfile(email, data.person || { name, email, photoUrl: null, jobTitle: null, company: null, contactsUrl: null, chatDmUrl: null });
      } catch {
        store.setProfile(email, { name, email, photoUrl: null, jobTitle: null, company: null, contactsUrl: null, chatDmUrl: null });
      } finally {
        setLoading(false);
        fetchPromise.current = null;
      }
    })();
    return fetchPromise.current;
  };

  const handleMouseEnter = () => {
    isOver.current = true;
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    const show = () => { if (isOver.current) store.setActiveEmail(email); };
    if (!profile && !loading) fetchProfile().then(show);
    else if (profile) hoverTimeout.current = setTimeout(show, 150);
  };

  const handleMouseLeave = () => {
    isOver.current = false;
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      if (store.getActiveEmail() === email) store.setActiveEmail(null);
    }, 300);
  };

  const copyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <HoverCard open={active} onOpenChange={(open) => !open && store.setActiveEmail(null)}>
      <HoverCardTrigger onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div className="inline-block">{children}</div>
      </HoverCardTrigger>

      <HoverCardContent
        side="bottom"
        align="start"
        sideOffset={6}
        className="p-0 border-none bg-transparent shadow-none z-[100] w-fit"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="w-[300px] bg-white border border-slate-100 rounded-2xl shadow-lg overflow-hidden">
          {profile ? (
            <>
              {/* Avatar + name block */}
              <div className="px-5 pt-5 pb-4 flex items-start gap-4">
                <Avatar className="h-14 w-14 shrink-0 ring-2 ring-slate-100">
                  <AvatarImage src={profile.photoUrl || undefined} className="object-cover" />
                  <AvatarFallback className="bg-indigo-600 text-white text-lg font-semibold">
                    {profile.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 pt-0.5 space-y-0.5">
                  <p className="text-sm font-semibold text-slate-900 truncate leading-snug">
                    {profile.name}
                  </p>
                  {(profile.jobTitle || profile.company) && (
                    <p className="text-xs text-slate-500 truncate">
                      {[profile.jobTitle, profile.company].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <button
                    onClick={copyEmail}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors group/copy mt-0.5"
                  >
                    <span className="truncate max-w-[160px]">{profile.email}</span>
                    {copied
                      ? <Check size={11} className="text-emerald-500 shrink-0" />
                      : <Copy size={11} className="shrink-0 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                    }
                  </button>
                </div>
              </div>

              {/* Source badge */}
              <div className="px-5 pb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Google Workspace
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Action row */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  <ActionBtn
                    icon={<Mail size={15} />}
                    label="Send email"
                    onClick={() => window.open(`mailto:${email}`, "_blank")}
                  />
                  <ActionBtn
                    icon={<MessageSquare size={15} />}
                    label="Open Google Chat DM"
                    disabled={!profile.chatDmUrl}
                    onClick={() => profile.chatDmUrl && window.open(profile.chatDmUrl, "_blank")}
                  />
                  <ActionBtn
                    icon={<Video size={15} />}
                    label="Start Google Meet"
                    onClick={() => window.open(`https://meet.google.com/new?calleeId=${encodeURIComponent(email)}&authuser=0`, "_blank")}
                  />
                  <ActionBtn
                    icon={<Calendar size={15} />}
                    label="Schedule event"
                    onClick={() => window.open(`https://calendar.google.com/calendar/r/eventedit?add=${encodeURIComponent(email)}&authuser=0`, "_blank")}
                  />
                </div>

                <button
                  onClick={() => window.open(profile.contactsUrl ?? `https://contacts.google.com/search/${encodeURIComponent(email)}`, "_blank")}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Profile
                  <ExternalLink size={11} />
                </button>
              </div>
            </>
          ) : (
            /* Skeleton */
            <div className="px-5 py-5 flex items-start gap-4">
              <div className="h-14 w-14 rounded-full bg-slate-100 animate-pulse shrink-0" />
              <div className="flex-1 pt-1 space-y-2">
                <div className="h-3.5 w-28 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-3 w-36 bg-slate-50 rounded-lg animate-pulse" />
                <div className="h-3 w-24 bg-slate-50 rounded-lg animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}


