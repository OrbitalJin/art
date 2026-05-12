import {
  useSettingsStore,
  type CornerRadius,
  type FontSize,
} from "@/lib/store/use-settings-store";
import { useEffect } from "react";

export const useAppearanceEffects = () => {
  const fontSize = useSettingsStore((state) => state.fontSize);
  const cornerRadius = useSettingsStore((state) => state.cornerRadius);
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);

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
    const sizeMap: Record<FontSize, string> = {
      small: "14px",
      medium: "16px",
      large: "18px",
    };
    root.style.fontSize = sizeMap[fontSize];
  }, [fontSize]);
};
