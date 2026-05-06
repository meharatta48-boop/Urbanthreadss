import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { SERVER_URL } from "../services/api";
import { resolveMediaUrl } from "../utils/mediaUrl";

const CACHE_KEY = "ut_settings_cache";
// Increment this whenever new fields are added to the settings model
// This forces all browsers to refetch fresh settings and clears old cache
const CACHE_VERSION = "v5_light_fix"; // bumped: dark defaults fix — clears old cache
const CACHE_VER_KEY = "ut_settings_ver";

const SettingsContext = createContext({});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      // If cache version doesn't match, clear old cache
      const storedVer = localStorage.getItem(CACHE_VER_KEY);
      if (storedVer !== CACHE_VERSION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const storedVer = localStorage.getItem(CACHE_VER_KEY);
      if (storedVer === CACHE_VERSION && localStorage.getItem(CACHE_KEY)) {
        return false;
      }
    } catch (err) {
      console.warn("Settings cache read skipped:", err);
    }
    return true;
  });

  // Helper: update state + localStorage together
  const save = (newSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(newSettings));
      localStorage.setItem(CACHE_VER_KEY, CACHE_VERSION);
    } catch (err) {
      console.warn("Unable to cache settings", err);
    }
  };


  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await api.get("/settings");
      if (data.success) save(data.settings);
    } catch (err) {
      console.error("Settings load failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // _token kept for backward-compat — not needed, api interceptor handles auth
  const updateSettings = async (payload) => {
    const { data } = await api.put("/settings", payload);
    if (data.success) save(data.settings);
    return data;
  };

  const uploadHeroImages = async (files) => {
    const form = new FormData();
    files.forEach((f) => form.append("images", f));
    const { data } = await api.post("/settings/hero-images", form);
    if (data.success) fetchSettings(); // re-fetch to get latest
    return data;
  };

  const deleteHeroImage = async (imagePath) => {
    const { data } = await api.delete("/settings/hero-images", {
      data: { imagePath },
    });
    if (data.success) fetchSettings();
    return data;
  };

  const uploadBrandImage = async (file) => {
    const form = new FormData();
    form.append("image", file);
    const { data } = await api.post("/settings/brand-image", form);
    if (data.success) fetchSettings();
    return data;
  };

  const uploadLogo = async (file, field = "logoImage") => {
    const form = new FormData();
    form.append("image", file);
    form.append("field", field);
    const { data } = await api.post("/settings/logo", form);
    if (data.success) fetchSettings();
    return data;
  };

  // ── DELETE SINGLE IMAGE (logo / mobileLogo / favicon / brandImage) ──
  // Uses POST to avoid Express body-parsing issues with DELETE requests
  const deleteSettingImage = async (field) => {
    const { data } = await api.post("/settings/delete-image", { field });
    if (data.success) fetchSettings();
    return data;
  };

  // ── DELETE SLIDE IMAGE ──
  const deleteSlideImage = async (slideIndex) => {
    const { data } = await api.post("/settings/delete-slide-image", { slideIndex });
    if (data.success) fetchSettings();
    return data;
  };

  const imgUrl = (path) => resolveMediaUrl(path, SERVER_URL);

  return (
    <SettingsContext.Provider value={{
      settings, loading,
      updateSettings, fetchSettings,
      uploadHeroImages, deleteHeroImage,
      uploadBrandImage, uploadLogo,
      deleteSettingImage, deleteSlideImage,
      imgUrl,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
