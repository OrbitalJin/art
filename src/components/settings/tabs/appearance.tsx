import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTheme, type ThemeColor } from "@/contexts/theme-context";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { cn } from "@/lib/utils";
import { SettingRow, SettingsPage } from "./settings-layout";

const Segmented: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div
    role="radiogroup"
    aria-label={label}
    className="flex items-center rounded-full bg-foreground/5 p-0.5 ring-1 ring-border/50"
  >
    {children}
  </div>
);

const SegmentedItem: React.FC<{
  label: string;
  selected: boolean;
  onSelect: () => void;
}> = ({ label, selected, onSelect }) => {
  const itemClasses = cn(
    "cursor-pointer rounded-full px-3 py-1 text-xs whitespace-nowrap outline-none",
    "transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/50",
    selected
      ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
      : "text-muted-foreground hover:text-foreground",
  );

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={itemClasses}
    >
      {label}
    </button>
  );
};

export const AppearanceSettingTab = () => {
  const { mode, setMode, color, setColor } = useTheme();
  const fontSize = useSettingsStore((state) => state.fontSize);
  const setFontSize = useSettingsStore((state) => state.setFontSize);
  const cornerRadius = useSettingsStore((state) => state.cornerRadius);
  const setCornerRadius = useSettingsStore((state) => state.setCornerRadius);
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);
  const setReducedMotion = useSettingsStore((state) => state.setReducedMotion);

  return (
    <SettingsPage
      title="Appearance"
      description="Customize the look and feel of the app."
    >
      <SettingRow title="Theme" description="Choose a light or dark mode.">
        <Segmented label="Theme">
          <SegmentedItem
            label="Light"
            selected={mode === "light"}
            onSelect={() => setMode("light")}
          />
          <SegmentedItem
            label="Dark"
            selected={mode === "dark"}
            onSelect={() => setMode("dark")}
          />
          <SegmentedItem
            label="System"
            selected={mode === "system"}
            onSelect={() => setMode("system")}
          />
        </Segmented>
      </SettingRow>

      <SettingRow
        title="Accent color"
        description="The color palette used across the app."
      >
        <Select
          value={color}
          onValueChange={(value: ThemeColor) => setColor(value)}
        >
          <SelectTrigger className="w-52" aria-label="Accent color">
            <SelectValue placeholder="Select a theme" />
          </SelectTrigger>
          <SelectContent position="item-aligned">
            <SelectItem value="midnight bloom">Midnight Bloom</SelectItem>
            <SelectItem value="pastel dreams">Pastel Dreams</SelectItem>
            <SelectItem value="amethyst haze">Amethyst Haze</SelectItem>
            <SelectItem value="violet bloom">Violet Bloom</SelectItem>
            <SelectItem value="cosmic night">Cosmic Night</SelectItem>
            <SelectItem value="sunny sprout">Sunny Sprout</SelectItem>
            <SelectItem value="quantum rose">Quantum Rose</SelectItem>
            <SelectItem value="flutter shy">Flutter Shy</SelectItem>
            <SelectItem value="claude plus">Claude Plus</SelectItem>
            <SelectItem value="dark matter">Dark Matter</SelectItem>
            <SelectItem value="mocha mousse">Mocha Mousse</SelectItem>
            <SelectItem value="terminal">Terminal</SelectItem>
            <SelectItem value="vercel">Vercel</SelectItem>
            <SelectItem value="claude">Claude</SelectItem>
            <SelectItem value="pony">Pony</SelectItem>
            <SelectItem value="aero">Aero</SelectItem>
            <SelectItem value="zen">Zen</SelectItem>
            <SelectItem value="t3 chat">T3</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>

      <SettingRow
        title="Font size"
        description="Adjust the text size across the app."
      >
        <Segmented label="Font size">
          <SegmentedItem
            label="Small"
            selected={fontSize === "small"}
            onSelect={() => setFontSize("small")}
          />
          <SegmentedItem
            label="Medium"
            selected={fontSize === "medium"}
            onSelect={() => setFontSize("medium")}
          />
          <SegmentedItem
            label="Large"
            selected={fontSize === "large"}
            onSelect={() => setFontSize("large")}
          />
        </Segmented>
      </SettingRow>

      <SettingRow
        title="Corner radius"
        description="How round corners are across the app."
      >
        <Segmented label="Corner radius">
          <SegmentedItem
            label="None"
            selected={cornerRadius === "none"}
            onSelect={() => setCornerRadius("none")}
          />
          <SegmentedItem
            label="Small"
            selected={cornerRadius === "small"}
            onSelect={() => setCornerRadius("small")}
          />
          <SegmentedItem
            label="Medium"
            selected={cornerRadius === "medium"}
            onSelect={() => setCornerRadius("medium")}
          />
          <SegmentedItem
            label="Large"
            selected={cornerRadius === "large"}
            onSelect={() => setCornerRadius("large")}
          />
        </Segmented>
      </SettingRow>

      <SettingRow
        title="Reduced motion"
        description="Minimize animations throughout the app."
      >
        <Switch
          checked={reducedMotion}
          onCheckedChange={setReducedMotion}
          aria-label="Reduced motion"
        />
      </SettingRow>
    </SettingsPage>
  );
};
