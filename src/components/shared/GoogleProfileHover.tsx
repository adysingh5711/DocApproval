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
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Global Profile Store (Simple singleton for session) ---
interface Person {
  name: string;
  photoUrl: string | null;
  email: string;
  jobTitle: string | null;
  company: string | null;
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
  children
}: {
  email: string;
  name: string;
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<Person | null>(store.getProfile(email));
  const [active, setActive] = useState(store.getActiveEmail() === email);
  const [loading, setLoading] = useState(false);

  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const fetchPromise = useRef<Promise<void> | null>(null);

  useEffect(() => {
    return store.subscribe(() => {
      setProfile(store.getProfile(email));
      setActive(store.getActiveEmail() === email);
    });
  }, [email]);

  const fetchProfile = async () => {
    if (fetchPromise.current) return fetchPromise.current;
    if (store.getProfile(email)) return;

    setLoading(true);
    fetchPromise.current = (async () => {
      try {
        const res = await fetch(`/api/user/profile?email=${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const person = data.person || {
          name: name,
          email: email,
          photoUrl: null,
          jobTitle: null,
          company: null
        };
        store.setProfile(email, person);
      } catch (err) {
        console.error("Error fetching profile:", err);
        store.setProfile(email, { name, email, photoUrl: null, jobTitle: null, company: null });
      } finally {
        setLoading(false);
        fetchPromise.current = null;
      }
    })();
    return fetchPromise.current;
  };

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);

    const show = () => {
      // Ensure only this one is active
      store.setActiveEmail(email);
    };

    if (!profile && !loading) {
      fetchProfile().then(show);
    } else if (profile) {
      show();
    }
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      if (store.getActiveEmail() === email) {
        store.setActiveEmail(null);
      }
    }, 300);
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

      <AnimatePresence>
        {active && profile && (
          <HoverCardContent
            side="bottom"
            align="start"
            sideOffset={4}
            alignOffset={0}
            className="p-0 border-none bg-transparent shadow-none z-[100] w-fit"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.218 }}
              style={{
                boxShadow: "0 1px 2px 0 rgba(60,64,67,0.30), 0 1px 3px 1px rgba(60,64,67,0.15)",
                borderRadius: "8px",
                backgroundColor: "#fff",
                width: "320px",
                overflow: "hidden"
              }}
            >
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
                      className="p-1 text-[#5f6368] hover:bg-slate-100 rounded-full transition-colors shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(profile.email);
                      }}
                    >
                      <Copy size={14} />
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-[#5f6368] hover:bg-black/5"
                  onClick={() => window.open(`mailto:${email}`)}
                >
                  <Mail size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-[#5f6368] hover:bg-black/5"
                >
                  <MessageSquare size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-[#5f6368] hover:bg-black/5"
                >
                  <Video size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-[#5f6368] hover:bg-black/5"
                >
                  <Calendar size={18} />
                </Button>
                <div className="ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[13px] font-medium text-indigo-600 hover:bg-indigo-50 px-2"
                    onClick={() => window.open(`https://contacts.google.com/search/${encodeURIComponent(email)}`)}
                  >
                    Open profile
                    <ExternalLink size={14} className="ml-1.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </HoverCardContent>
        )}
      </AnimatePresence>
    </HoverCard>
  );
}
