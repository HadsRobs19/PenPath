import { supabase } from "./Client";

// Get current user ID synchronously from cached session
function getCurrentUserId() {
  // Try to get from Supabase's cached session in localStorage
  const storageKey = Object.keys(localStorage).find(key =>
    key.startsWith('sb-') && key.endsWith('-auth-token')
  );

  if (storageKey) {
    try {
      const session = JSON.parse(localStorage.getItem(storageKey));
      return session?.user?.id || null;
    } catch {
      return null;
    }
  }
  return null;
}

// Create a user-scoped key
function scopedKey(key, userId) {
  const uid = userId || getCurrentUserId();
  return uid ? `${key}_${uid}` : key;
}

// User-scoped localStorage operations
export const userStorage = {
  getItem(key) {
    return localStorage.getItem(scopedKey(key));
  },

  setItem(key, value) {
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn(`userStorage.setItem: No user ID, storing globally for key: ${key}`);
    }
    localStorage.setItem(scopedKey(key, userId), value);
  },

  removeItem(key) {
    localStorage.removeItem(scopedKey(key));
  },

  // Clear all user-specific data for the current user
  clearUserData() {
    const userId = getCurrentUserId();
    if (!userId) return;

    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.endsWith(`_${userId}`)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  },

  // Get current user ID (async, for when you need certainty)
  async getUserId() {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  }
};

// Keys used throughout the app
export const STORAGE_KEYS = {
  SETTINGS: "penpath_settings",
  AVATAR_URL: "penpath_avatar_url",
  COLORS_READING: "colors_readingComplete",
  COLORS_WRITING: "colors_writingComplete",
  LESSON1_COMPLETE: "lesson1Complete",
  LESSON2_COMPLETE: "lesson2Complete",
  COLORS_LESSON: "colorsLessonComplete",
  ANIMALS_LESSON: "animalsLessonComplete",
};
