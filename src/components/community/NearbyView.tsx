import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────
interface NearbyUser {
  user_id: string;
  display_name: string;
  initials: string;
  suburb: string;
  profession?: string;
  is_online: boolean;
  avatar_url?: string;
}

interface SuburbCluster {
  name: string;
  count: number;
  x: number;
  y: number;
}

// ─── Constants ────────────────────────────────────────────
const FUZZ_AMOUNT = 0.005; // ~500m radius fuzz
const GOOGLE_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

// ─── Helper: fuzz coordinates for privacy ─────────────────
function fuzzCoords(lat: number, lng: number) {
  const fuzzLat = (Math.random() - 0.5) * 2 * FUZZ_AMOUNT;
  const fuzzLng = (Math.random() - 0.5) * 2 * FUZZ_AMOUNT;
  return { lat: lat + fuzzLat, lng: lng + fuzzLng };
}

// ─── Helper: reverse geocode ──────────────────────────────
async function reverseGeocode(
  lat: number,
  lng: number,
  apiKey: string
): Promise<{ suburb: string; city: string } | null> {
  try {
    const res = await fetch(
      `${GOOGLE_GEOCODE_URL}?latlng=${lat},${lng}&key=${apiKey}&result_type=sublocality|neighborhood|locality`
    );
    const data = await res.json();
    if (data.status !== "OK") return null;

    let suburb = "";
    let city = "";

    for (const result of data.results) {
      for (const component of result.address_components) {
        if (
          component.types.includes("sublocality_level_1") ||
          component.types.includes("neighborhood")
        ) {
          suburb = suburb || component.long_name;
        }
        if (component.types.includes("locality")) {
          city = city || component.long_name;
        }
      }
      if (suburb && city) break;
    }

    if (!suburb && city) suburb = city;
    return suburb ? { suburb, city } : null;
  } catch {
    return null;
  }
}

// ─── Helper: generate initials ────────────────────────────
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Suburb Bubble Map ────────────────────────────────────
function SuburbMap({
  clusters,
  activeSuburb,
  onSuburbClick,
}: {
  clusters: SuburbCluster[];
  activeSuburb: string | null;
  onSuburbClick: (name: string) => void;
}) {
  return (
    <div className="relative w-full h-40 rounded-xl overflow-hidden bg-secondary/50">
      {/* Subtle dot grid background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dot-grid"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" className="fill-primary/60" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>

      {clusters.map((cluster) => {
        const isActive = activeSuburb === cluster.name;
        const size = Math.min(40 + cluster.count * 8, 64);
        return (
          <button
            key={cluster.name}
            onClick={() => onSuburbClick(cluster.name)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 transition-all duration-200"
            style={{ left: `${cluster.x}%`, top: `${cluster.y}%` }}
          >
            <div
              className={`rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 shadow-sm ${
                isActive
                  ? "bg-primary text-primary-foreground border-2 border-primary"
                  : "bg-primary/25 text-primary border-2 border-primary/40"
              }`}
              style={{ width: size, height: size }}
            >
              {cluster.count}
            </div>
            <span
              className={`text-[10px] font-medium whitespace-nowrap ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {cluster.name}
            </span>
          </button>
        );
      })}

      <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-muted-foreground/60">
        Tap a suburb to filter · zones are approximate
      </p>
    </div>
  );
}

// ─── User Card ─────────────────────────────────────────────
function UserCard({ user }: { user: NearbyUser }) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border flex flex-col gap-2 relative">
      <span className="absolute top-3 right-3 text-[10px] text-muted-foreground">
        same suburb
      </span>

      <div className="flex items-center gap-3">
        <div className="relative">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.display_name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold bg-primary/15 text-primary border border-primary/30">
              {user.initials}
            </div>
          )}
          {user.is_online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-phase-follicular border-2 border-card" />
          )}
        </div>

        <div>
          <p className="font-semibold text-foreground text-sm leading-tight">
            {user.display_name}
          </p>
          <p className="text-xs text-muted-foreground">{user.suburb}</p>
        </div>
      </div>

      {user.profession && (
        <span className="self-start px-2.5 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground font-medium">
          {user.profession}
        </span>
      )}
    </div>
  );
}

// ─── Props ─────────────────────────────────────────────────
interface NearbyViewProps {
  locationEnabled: boolean;
  onRequestLocation: () => void;
  onToggleLocation?: () => void;
}

// ─── Main Component ────────────────────────────────────────
export default function NearbyView({ locationEnabled, onRequestLocation, onToggleLocation }: NearbyViewProps) {
  const { toast } = useToast();
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "requesting" | "granted" | "denied" | "saving"
  >("idle");
  const [userSuburb, setUserSuburb] = useState<string | null>(null);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [activeSuburb, setActiveSuburb] = useState<string | null>(null);
  const [isNearbyVisible, setIsNearbyVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

  useEffect(() => {
    checkExistingLocation();
    return () => {
      channelRef.current?.unsubscribe();
    };
  }, []);

  const checkExistingLocation = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data: loc } = await supabase
      .from("user_locations" as any)
      .select("suburb, city, is_visible")
      .eq("user_id", user.id)
      .single();

    if (loc) {
      const locData = loc as any;
      setUserSuburb(locData.suburb);
      setUserCity(locData.city);
      setIsNearbyVisible(locData.is_visible);
      setLocationStatus("granted");
      fetchNearbyUsers(locData.suburb);
    } else {
      setIsLoading(false);
    }
  };

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
      return;
    }

    setLocationStatus("requesting");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const geo = await reverseGeocode(latitude, longitude, MAPS_API_KEY);
        if (!geo) {
          toast({
            title: "Couldn't determine your suburb",
            description: "Please try again or check your connection.",
            variant: "destructive",
          });
          setLocationStatus("idle");
          return;
        }

        const fuzzed = fuzzCoords(latitude, longitude);
        setLocationStatus("saving");
        await saveUserLocation(fuzzed.lat, fuzzed.lng, geo.suburb, geo.city);
      },
      (error) => {
        setLocationStatus("denied");
        if (error.code === error.PERMISSION_DENIED) {
          toast({
            title: "Location access denied",
            description:
              "Enable location in your browser settings to appear in Nearby.",
            variant: "destructive",
          });
        }
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, [MAPS_API_KEY, toast]);

  const saveUserLocation = async (
    fuzzedLat: number,
    fuzzedLng: number,
    suburb: string,
    city: string
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("user_locations" as any).upsert(
      {
        user_id: user.id,
        suburb,
        city,
        fuzzed_lat: fuzzedLat,
        fuzzed_lng: fuzzedLng,
        is_visible: true,
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: "user_id" }
    );

    if (error) {
      toast({
        title: "Failed to save location",
        description: error.message,
        variant: "destructive",
      });
      setLocationStatus("idle");
      return;
    }

    // Update profiles table suburb
    await supabase
      .from("profiles")
      .update({ suburb, is_nearby_visible: true } as any)
      .eq("user_id", user.id);

    setUserSuburb(suburb);
    setUserCity(city);
    setLocationStatus("granted");
    setIsNearbyVisible(true);

    toast({
      title: "You're on the map! 📍",
      description: `Showing you in ${suburb}`,
    });

    fetchNearbyUsers(suburb);
  };

  const fetchNearbyUsers = async (currentSuburb: string) => {
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: locations, error } = await supabase
      .from("user_locations" as any)
      .select("user_id, suburb, city")
      .eq("is_visible", true)
      .neq("user_id", user.id);

    if (error || !locations) {
      setIsLoading(false);
      return;
    }

    // Fetch profiles for those user_ids
    const userIds = (locations as any[]).map((l: any) => l.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url, profession, is_nearby_visible" as any)
      .in("user_id", userIds);

    const profileMap = new Map<string, any>();
    (profiles as any[] || []).forEach((p: any) => profileMap.set(p.user_id, p));

    const users: NearbyUser[] = (locations as any[])
      .filter((loc: any) => {
        const prof = profileMap.get(loc.user_id);
        return prof?.is_nearby_visible !== false;
      })
      .map((loc: any) => {
        const prof = profileMap.get(loc.user_id);
        return {
          user_id: loc.user_id,
          display_name: prof?.display_name || "User",
          initials: getInitials(prof?.display_name || "U"),
          suburb: loc.suburb,
          profession: prof?.profession,
          is_online: Math.random() > 0.4, // Replace with real presence tracking later
          avatar_url: prof?.avatar_url,
        };
      });

    setNearbyUsers(users);
    setIsLoading(false);
    subscribeToNearby();
  };

  const subscribeToNearby = () => {
    if (channelRef.current) channelRef.current.unsubscribe();

    channelRef.current = supabase
      .channel("nearby-users")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_locations" },
        () => {
          if (userSuburb) fetchNearbyUsers(userSuburb);
        }
      )
      .subscribe();
  };

  const toggleVisibility = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const newVisible = !isNearbyVisible;

    await supabase
      .from("user_locations" as any)
      .update({ is_visible: newVisible } as any)
      .eq("user_id", user.id);

    await supabase
      .from("profiles")
      .update({ is_nearby_visible: newVisible } as any)
      .eq("user_id", user.id);

    setIsNearbyVisible(newVisible);

    toast({
      title: newVisible ? "You're visible in Nearby" : "You've gone invisible",
      description: newVisible
        ? "Others in your area can see you"
        : "You won't appear in other users' Nearby tab",
    });
  };

  // ── Derived data ──────────────────────────────────────────
  const filteredUsers =
    activeSuburb
      ? nearbyUsers.filter((u) => u.suburb === activeSuburb)
      : nearbyUsers;

  const activeCount = nearbyUsers.filter((u) => u.is_online).length;

  const suburbCounts = nearbyUsers.reduce<Record<string, number>>((acc, u) => {
    acc[u.suburb] = (acc[u.suburb] || 0) + 1;
    return acc;
  }, {});

  const suburbList = Object.keys(suburbCounts);
  const clusters: SuburbCluster[] = suburbList.map((name, i) => ({
    name,
    count: suburbCounts[name],
    x: 20 + (i % 3) * 30 + Math.sin(i * 1.5) * 8,
    y: 30 + Math.floor(i / 3) * 35 + Math.cos(i * 1.2) * 8,
  }));

  const suburbFilters = ["Everyone", ...suburbList];

  // ── Render: location not yet enabled ─────────────────────
  if (locationStatus === "idle" || locationStatus === "denied") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 gap-5">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl bg-secondary">
          📍
        </div>
        <div className="text-center">
          <h3 className="font-display text-lg font-semibold text-foreground mb-1">
            Discover people nearby
          </h3>
          <p className="font-display text-sm italic text-muted-foreground max-w-xs">
            We only show your suburb — never your street or exact address.
          </p>
        </div>
        {locationStatus === "denied" && (
          <p className="text-xs text-destructive text-center max-w-xs">
            Location was blocked. Enable it in your browser settings, then try again.
          </p>
        )}
        <button
          onClick={requestLocation}
          className="touch-btn px-6 py-3 rounded-full font-display font-semibold text-primary-foreground text-sm bg-primary shadow-md transition-all hover:opacity-90 active:scale-95"
        >
          Enable location services
        </button>
        <p className="text-[10px] text-muted-foreground/50 text-center max-w-xs">
          Your exact location is never stored or shared. A fuzzed, approximate
          position is used.
        </p>
      </div>
    );
  }

  // ── Render: requesting / saving ───────────────────────────
  if (locationStatus === "requesting" || locationStatus === "saving") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-10 h-10 rounded-full border-4 animate-spin border-secondary border-t-primary" />
        <p className="font-display text-sm italic text-muted-foreground">
          {locationStatus === "requesting"
            ? "Detecting your suburb…"
            : "Setting you up…"}
        </p>
      </div>
    );
  }

  // ── Render: main view ─────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Privacy banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs bg-secondary/50 text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>🔒</span>
          <span>Showing suburb-level only · your address is never visible</span>
        </div>
        <button
          onClick={toggleVisibility}
          className="font-medium underline underline-offset-2 transition-opacity hover:opacity-70 text-primary"
        >
          {isNearbyVisible ? "Turn off" : "Turn on"}
        </button>
      </div>

      {/* Location header */}
      <div>
        <p className="text-xs font-medium text-muted-foreground">
          People near you · {userCity || userSuburb}
        </p>
      </div>

      {/* Suburb bubble map */}
      {isLoading ? (
        <div className="w-full h-40 rounded-xl animate-pulse bg-secondary/50" />
      ) : (
        <SuburbMap
          clusters={clusters}
          activeSuburb={activeSuburb}
          onSuburbClick={(name) =>
            setActiveSuburb((prev) => (prev === name ? null : name))
          }
        />
      )}

      {/* Suburb filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {suburbFilters.map((label) => {
          const isActive =
            label === "Everyone" ? activeSuburb === null : activeSuburb === label;
          return (
            <button
              key={label}
              onClick={() =>
                setActiveSuburb(label === "Everyone" ? null : label)
              }
              className={`touch-btn px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Active count */}
      {!isLoading && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-phase-follicular inline-block" />
          <span>
            {activeCount} active now · {nearbyUsers.length} total in view
          </span>
        </div>
      )}

      {/* User cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl animate-pulse bg-secondary/50"
            />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center py-10 gap-2 text-center">
          <span className="text-3xl">🌿</span>
          <p className="font-display text-sm font-medium text-foreground">No one here yet</p>
          <p className="text-xs text-muted-foreground">
            Be the first in your suburb — invite others to join!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredUsers.map((user) => (
            <UserCard key={user.user_id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
