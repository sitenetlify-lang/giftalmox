import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { request } from '@/lib/api';

const defaultSettings = {
  system_name: 'GIFT Almox',
  logo_url: '',
  primary_color: '#991b1b',
  secondary_color: '#111827',
};

const SettingsContext = createContext({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const hexToHsl = (hex) => {
    const normalized = (hex || '').replace('#', '');
    if (normalized.length !== 6) return '0 0% 20%';
    const r = parseInt(normalized.slice(0, 2), 16) / 255;
    const g = parseInt(normalized.slice(2, 4), 16) / 255;
    const b = parseInt(normalized.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    const d = max - min;
    if (d !== 0) {
      s = d / (1 - Math.abs(2 * l - 1));
      switch (max) {
        case r: h = 60 * (((g - b) / d) % 6); break;
        case g: h = 60 * ((b - r) / d + 2); break;
        default: h = 60 * ((r - g) / d + 4);
      }
    }
    if (h < 0) h += 360;
    return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const applyTheme = (nextSettings) => {
    const root = document.documentElement;
    const primary = hexToHsl(nextSettings.primary_color || defaultSettings.primary_color);
    const secondary = hexToHsl(nextSettings.secondary_color || defaultSettings.secondary_color);
    root.style.setProperty('--primary', primary);
    root.style.setProperty('--accent', primary);
    root.style.setProperty('--ring', primary);
    root.style.setProperty('--sidebar-primary', primary);
    root.style.setProperty('--secondary', secondary);
    root.style.setProperty('--sidebar-accent', secondary);
    document.title = nextSettings.system_name || defaultSettings.system_name;
  };

  const refreshSettings = async () => {
    const data = await request('/api/settings');
    const merged = { ...defaultSettings, ...data };
    setSettings(merged);
    applyTheme(merged);
    return merged;
  };

  useEffect(() => {
    refreshSettings().finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({ settings, loading, refreshSettings }), [settings, loading]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
