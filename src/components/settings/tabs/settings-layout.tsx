// settings-layout.tsx
import { cn } from "@/lib/utils";

export const CARD_CLASSES = cn(
  "overflow-hidden rounded-xl border border-border/60",
  "divide-y divide-border/50",
);

export const SELECT_TRIGGER_CLASSES = "h-8 w-52 text-[13px] shadow-none";
export const INPUT_CLASSES = "h-8 text-[13px] shadow-none";
export const TEXTAREA_CLASSES = "resize-y text-[13px] shadow-none";

export const SettingsPage: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <div className="flex max-w-3xl flex-col gap-10">
    <header className="flex flex-col gap-1">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </header>
    {children}
  </div>
);

export const SettingsSection: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <section className="flex flex-col gap-3">
    <div className="flex flex-col gap-0.5 px-1">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
    {children}
  </section>
);

export const SettingsCard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className={CARD_CLASSES}>{children}</div>;

export const SettingRow: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <div className="flex items-center justify-between gap-6 px-4 py-3.5">
    <div className="flex min-w-0 flex-col gap-0.5">
      <p className="text-[13px] font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);
