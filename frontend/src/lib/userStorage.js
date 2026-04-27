import { supabase } from "./Client";

// Get current user ID synchronously from cached session
function getCurrentUserId() {
  // Try to get from Supabase's cached session in localStorage
  // Supabase stores auth data with key pattern: sb-<project-ref>-auth-token
  const storageKey = Object.keys(localStorage).find(key =>
    key.startsWith('sb-') && key.endsWith('-auth-token')
  );

  if (storageKey) {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      // Supabase: the stored value may have different structures
      // Try multiple paths to find the user ID
      const userId = stored?.user?.id ||           // Direct user object
                     stored?.session?.user?.id ||  // Session wrapper
                     stored?.currentSession?.user?.id || // Alternative format
                     null;
      return userId;
    } catch (e) {
      console.warn("userStorage: Failed to parse Supabase session", e);
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
    const userId = getCurrentUserId();
    // Try user-scoped key first
    if (userId) {
      const scopedValue = localStorage.getItem(`${key}_${userId}`);
      if (scopedValue !== null) {
        return scopedValue;
      }
      // Fallback: check global key and migrate if found
      const globalValue = localStorage.getItem(key);
      if (globalValue !== null) {
        // Migrate to user-scoped storage
        localStorage.setItem(`${key}_${userId}`, globalValue);
        localStorage.removeItem(key);
        return globalValue;
      }
      return null;
    }
    // No user ID - use global key
    return localStorage.getItem(key);
  },

  setItem(key, value) {
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn(`userStorage.setItem: No user ID, storing globally for key: ${key}`);
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(`${key}_${userId}`, value);
    }
  },

  removeItem(key) {
    const userId = getCurrentUserId();
    if (userId) {
      localStorage.removeItem(`${key}_${userId}`);
    }
    // Also remove global key if it exists
    localStorage.removeItem(key);
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
