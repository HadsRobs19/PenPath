import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "penpath_settings";

const defaults = {
  theme: "blue",
  fontSize: 2,
  inkColor: "#1A1A1A",
  inkThickness: 30,
  notifications: true,
};

const themeMap = {
  blue:  { accent: "#A8D8EA", bg: "#EBF7FC" },
  pink:  { accent: "#F5C1D0", bg: "#FDF0F4" },
  green: { accent: "#C8E6C9", bg: "#F0FAF0" },
};

export const FONT_SIZES = [14, 18, 22, 26, 30];

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

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
