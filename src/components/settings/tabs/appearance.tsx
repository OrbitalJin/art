import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Switch } from "@/components/ui/switch";
import {
  useTheme,
  type ThemeColor,
  type ThemeMode,
} from "@/contexts/theme-context";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useSettingsStore,
  type CornerRadius,
  type FontSize,
} from "@/lib/store/use-settings-store";
import { useEffect } from "react";

const THEME_COLORS: Array<{ value: ThemeColor; label: string }> = [
  { value: "midnight bloom", label: "Midnight Bloom" },
  { value: "pastel dreams", label: "Pastel Dreams" },
  { value: "amethyst haze", label: "Amethyst Haze" },
  { value: "violet bloom", label: "Violet Bloom" },
  { value: "cosmic night", label: "Cosmic Night" },
  { value: "sunny sprout", label: "Sunny Sprout" },
  { value: "quantum rose", label: "Quantum Rose" },
  { value: "flutter shy", label: "Flutter Shy" },
  { value: "claude plus", label: "Claude Plus" },
  { value: "t3 chat", label: "T3 Chat" },
  { value: "terminal", label: "Terminal" },
  { value: "claude", label: "Claude" },
  { value: "pony", label: "Pony" },
  { value: "zen", label: "Zen" },
] as const;

const FONT_SIZE_OPTIONS: Array<{
  value: FontSize;
  label: string;
  size: string;
}> = [
  { value: "small", label: "Small", size: "14px" },
  { value: "medium", label: "Medium", size: "16px" },
  { value: "large", label: "Large", size: "18px" },
] as const;

export const AppearanceSettingTab = () => {
  const { mode, setMode, color, setColor } = useTheme();
  const fontSize = useSettingsStore((state) => state.fontSize);
  const setFontSize = useSettingsStore((state) => state.setFontSize);
  const cornerRadius = useSettingsStore((state) => state.cornerRadius);
  const setCornerRadius = useSettingsStore((state) => state.setCornerRadius);
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);
  const setReducedMotion = useSettingsStore((state) => state.setReducedMotion);
  const compactMode = useSettingsStore((state) => state.compactMode);
  const setCompactMode = useSettingsStore((state) => state.setCompactMode);

  useEffect(() => {
    const root = window.document.documentElement;
    const sizeMap: Record<FontSize, string> = {
      small: "14px",
      medium: "16px",
      large: "18px",
    };
    root.style.fontSize = sizeMap[fontSize];
  }, [fontSize]);

  useEffect(() => {
    const root = window.document.documentElement;
    const radiusMap: Record<CornerRadius, string> = {
      none: "0rem",
      small: "0.25rem",
      medium: "0.5rem",
      large: "1rem",
    };
    root.style.setProperty("--radius", radiusMap[cornerRadius]);
  }, [cornerRadius]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }
  }, [reducedMotion]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (compactMode) {
      root.classList.add("compact-mode");
    } else {
      root.classList.remove("compact-mode");
    }
  }, [compactMode]);

  return (
    <>
      <div className="max-w-3xl">
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize the look and feel of the application.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm max-w-3xl">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-base font-medium">Interface Theme</p>
            <p className="text-sm text-muted-foreground">
              Select your preferred background mode.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {[
              { id: "light" as ThemeMode, icon: Sun, label: "Light" },
              { id: "dark" as ThemeMode, icon: Moon, label: "Dark" },
              {
                id: "system" as ThemeMode,
                icon: Monitor,
                label: "System",
              },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setMode(t.id)}
                className={cn(
                  "flex items-center gap-3 sm:flex-col sm:justify-between rounded-md border-2 p-4 transition-all",
                  mode === t.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-muted bg-popover hover:bg-accent text-muted-foreground",
                )}
              >
                <t.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-sm font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm max-w-3xl">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-base font-medium">Accent Color</p>
            <p className="text-sm text-muted-foreground">
              Select the color palette for the application.
            </p>
          </div>
          <div className="pt-2">
            <Select
              value={color}
              onValueChange={(val: ThemeColor) => setColor(val)}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                {THEME_COLORS.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    <span>{theme.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm max-w-3xl">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-base font-medium">Font Size</p>
            <p className="text-sm text-muted-foreground">
              Adjust the text size across the application.
            </p>
          </div>
          <div className="pt-2">
            <Select
              value={fontSize}
              onValueChange={(val: FontSize) => setFontSize(val)}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span>{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm max-w-3xl">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-base font-medium">Corner Radius</p>
            <p className="text-sm text-muted-foreground">
              Control the roundness of corners across the app.
            </p>
          </div>
          <div className="pt-2">
            <Select
              value={cornerRadius}
              onValueChange={(val: CornerRadius) => setCornerRadius(val)}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select corner radius" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span>None</span>
                </SelectItem>
                <SelectItem value="small">
                  <span>Small</span>
                </SelectItem>
                <SelectItem value="medium">
                  <span>Medium</span>
                </SelectItem>
                <SelectItem value="large">
                  <span>Large</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm max-w-3xl">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-base font-medium">Reduced Motion</p>
            <p className="text-sm text-muted-foreground">
              Minimize animations throughout the app.
            </p>
          </div>
          <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm max-w-3xl">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-base font-medium">Compact Mode</p>
            <p className="text-sm text-muted-foreground">
              Use tighter spacing for denser layouts.
            </p>
          </div>
          <Switch checked={compactMode} onCheckedChange={setCompactMode} />
        </div>
      </div>
    </>
  );
};
