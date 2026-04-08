"use client";

import { useState, useEffect, useRef } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Mail,
  MessageSquare,
  Video,
  Calendar,
  Copy,
  ExternalLink,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Global Profile Store (Simple singleton for session) ---
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

const notify = () => listeners.forEach(l => l());

const store = {
  getProfile: (email: string) => profileCache[email],
  setProfile: (email: string, person: Person) => {
    profileCache[email] = person;
    notify();
  },
  getActiveEmail: () => activeEmail,
  setActiveEmail: (email: string | null) => {
    activeEmail = email;
    notify();
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};

// --- Helper component for the Trigger Avatar ---
export function ReviewerAvatar({ email, name, className }: { email: string, name: string, className?: string }) {
  const [profile, setProfile] = useState<Person | null>(store.getProfile(email));

  useEffect(() => {
    return store.subscribe(() => {
      setProfile(store.getProfile(email));
    });
  }, [email]);

  return (
    <Avatar className={className}>
      <AvatarImage src={profile?.photoUrl || undefined} className="object-cover" />
      <AvatarFallback className="bg-indigo-50 text-indigo-700 text-xs font-bold">
        {name.split(" ").map(n => n[0]).join("").toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

// --- Main Hover Component ---
export function GoogleProfileHover({
  email,
  name,
  children,
  initialProfile
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

  // Prefill store if initialProfile is provided
  useEffect(() => {
    if (initialProfile && !store.getProfile(email)) {
      store.setProfile(email, initialProfile);
    }
  }, [email, initialProfile]);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setProfile(store.getProfile(email));
      setActive(store.getActiveEmail() === email);
    });
    return unsub;
  }, [email]);

  const fetchProfile = async () => {
    if (fetchPromise.current) return fetchPromise.current;
    if (store.getProfile(email)) return Promise.resolve();

    setLoading(true);
    fetchPromise.current = (async () => {
      try {
        const res = await fetch(`/api/user/profile?email=${encodeURIComponent(email)}&t=${Date.now()}`, {
          cache: 'no-store'
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const person = data.person || {
          name: name,
          email: email,
          photoUrl: null,
          jobTitle: null,
          company: null,
          contactsUrl: null,
          chatDmUrl: null
        };
        store.setProfile(email, person);
      } catch (err) {
        console.error("Error fetching profile:", err);
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

    const show = () => {
      if (isOver.current) {
        store.setActiveEmail(email);
      }
    };

    if (!profile && !loading) {
      fetchProfile().then(show);
    } else if (profile) {
      hoverTimeout.current = setTimeout(show, 150);
    }
  };

  const handleMouseLeave = () => {
    isOver.current = false;
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    
    hoverTimeout.current = setTimeout(() => {
      if (store.getActiveEmail() === email) {
        store.setActiveEmail(null);
      }
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
      <HoverCardTrigger
        asChild
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </HoverCardTrigger>

      <HoverCardContent
        side="bottom"
        align="start"
        sideOffset={4}
        alignOffset={0}
        className="p-0 border-none bg-transparent shadow-none z-[100] w-fit"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          style={{
            boxShadow: "0 1px 2px 0 rgba(60,64,67,0.30), 0 1px 3px 1px rgba(60,64,67,0.15)",
            borderRadius: "8px",
            backgroundColor: "#fff",
            width: "320px",
            overflow: "hidden"
          }}
        >
          {profile ? (
            <>
              {/* Main Content Area (Avatar + Info) */}
              <div className="flex p-4 pb-3">
                <Avatar className="h-16 w-16 mr-4 shrink-0">
                  <AvatarImage src={profile.photoUrl || undefined} className="object-cover" />
                  <AvatarFallback className="bg-indigo-600 text-white text-xl font-medium">
                    {profile.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="text-[18px] font-medium text-[#202124] leading-6 truncate font-sans">
                    {profile.name}
                  </h3>
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-[14px] text-[#5f6368] leading-5 truncate font-sans">
                      {profile.email}
                    </span>
                    <button
                      className="p-1 text-[#5f6368] hover:bg-slate-100 rounded-full transition-colors shrink-0 flex items-center gap-1"
                      onClick={copyEmail}
                      title="Copy email"
                    >
                      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      {copied && <span className="text-[10px] text-green-600 font-medium">Copied!</span>}
                    </button>
                  </div>
                  {(profile.jobTitle || profile.company) && (
                    <p className="text-[14px] text-[#5f6368] mt-1 truncate">
                      {[profile.jobTitle, profile.company].filter(Boolean).join(" • ")}
                    </p>
                  )}
                </div>
              </div>

              {/* Verified Badge / Metadata Area */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                  Google Workspace Profile
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 p-2 px-3 border-t border-[#dadce0] bg-slate-50/30">
                
                {/* Mail */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-[#5f6368] hover:bg-black/5"
                  title="Send email"
                  onClick={() => window.open(`mailto:${email}`, "_blank")}
                >
                  <Mail size={18} />
                </Button>

                {/* Chat */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-[#5f6368] hover:bg-black/5 disabled:opacity-40"
                  title="Open Google Chat DM"
                  disabled={!profile.chatDmUrl}
                  onClick={() => profile.chatDmUrl && window.open(profile.chatDmUrl, "_blank")}
                >
                  <MessageSquare size={18} />
                </Button>

                {/* Meet */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-[#5f6368] hover:bg-black/5"
                  title="Start Google Meet call"
                  onClick={() =>
                    window.open(
                      `https://meet.google.com/new?calleeId=${encodeURIComponent(email)}&authuser=0`,
                      "_blank"
                    )
                  }
                >
                  <Video size={18} />
                </Button>

                {/* Calendar */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-[#5f6368] hover:bg-black/5"
                  title="Schedule calendar event"
                  onClick={() =>
                    window.open(
                      `https://calendar.google.com/calendar/r/eventedit?add=${encodeURIComponent(email)}&authuser=0`,
                      "_blank"
                    )
                  }
                >
                  <Calendar size={18} />
                </Button>

                {/* Open Profile */}
                <div className="ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[13px] font-medium text-indigo-600 hover:bg-indigo-50 px-2"
                    onClick={() =>
                      window.open(
                        profile.contactsUrl ?? `https://contacts.google.com/search/${encodeURIComponent(email)}`,
                        "_blank"
                      )
                    }
                  >
                    Open profile
                    <ExternalLink size={14} className="ml-1.5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 flex flex-col items-center justify-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 animate-pulse" />
              <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-48 bg-slate-50 rounded animate-pulse" />
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
