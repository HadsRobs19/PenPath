import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/Client";
import { userStorage, STORAGE_KEYS } from "../lib/userStorage";

// Check if camera should be disabled via environment variable (for Raspberry Pi)
const isCameraDisabledByEnv = import.meta.env.VITE_DISABLE_CAMERA === "true";

const defaults = {
  theme: "blue",
  fontSize: 2,
  inkColor: "#1A1A1A",
  inkThickness: 30,
  notifications: true,
  cameraEnabled: !isCameraDisabledByEnv,
};

const themeMap = {
  blue:  { accent: "#4FC3F7", bg: "#B2F7FF" },
  pink:  { accent: "#FF80AB", bg: "#f8c1d5ff" },
  green: { accent: "#69F0AE", bg: "#c6facbff" },
};

export const FONT_SIZES = [14, 18, 22, 26, 30];

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaults);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings for current user
  const loadUserSettings = useCallback(() => {
    try {
      const stored = userStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        setSettings({ ...defaults, ...JSON.parse(stored) });
      } else {
        setSettings(defaults);
      }
    } catch {
      setSettings(defaults);
    }
    setIsLoaded(true);
  }, []);

  // Listen for auth state changes to reload settings when user changes
  useEffect(() => {
    // Don't load immediately - wait for Supabase to restore session first
    // This prevents loading settings before user ID is available
    const initSettings = async () => {
      // Give Supabase a moment to restore session from localStorage
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        loadUserSettings();
      } else {
        // No session yet, load defaults
        setSettings(defaults);
        setIsLoaded(true);
      }
    };

    initSettings();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      // INITIAL_SESSION fires when Supabase first restores a session from storage
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED" || event === "INITIAL_SESSION") {
        loadUserSettings();
      }
    });

    return () => subscription?.unsubscribe();
  }, [loadUserSettings]);

  // Save settings when they change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      userStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  useEffect(() => {
    const { accent, bg } = themeMap[settings.theme] ?? themeMap.blue;
    const root = document.documentElement;
    root.style.setProperty("--theme-accent", accent);
    root.style.setProperty("--theme-bg", bg);
    root.style.setProperty("--base-font-size", `${FONT_SIZES[settings.fontSize]}px`);
    root.style.setProperty("--ink-color", settings.inkColor);
    root.style.setProperty("--ink-thickness", String(settings.inkThickness));
  }, [settings.theme, settings.fontSize, settings.inkColor, settings.inkThickness]);

  function update(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <SettingsContext.Provider value={{ settings, update }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
