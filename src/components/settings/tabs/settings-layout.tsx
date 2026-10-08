interface SettingsPageProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  title,
  description,
  children,
}) => (
  <div className="flex max-w-3xl flex-col">
    <header className="mb-6 flex flex-col gap-0.5">
      <h2 className="text-lg font-medium tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </header>

    <div className="flex flex-col divide-y divide-border/50">{children}</div>
  </div>
);

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  children,
}) => (
  <section className="flex flex-col gap-4 py-6 first:pt-0">
    <div className="flex flex-col gap-0.5">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
    {children}
  </section>
);

interface SettingRowProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const SettingRow: React.FC<SettingRowProps> = ({
  title,
  description,
  children,
}) => (
  <section className="flex items-center justify-between gap-6 py-6 first:pt-0">
    <div className="flex min-w-0 flex-col gap-0.5">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <div className="shrink-0">{children}</div>
  </section>
);
