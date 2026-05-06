import { Badge } from "../ui/badge";

interface Props {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  tone?: "default" | "success" | "error" | "info";
}

export const StatusCard: React.FC<Props> = ({
  icon,
  title,
  description,
  badge,
  tone = "default",
}) => {
  const toneClass = {
    default: "border bg-muted/20",
    success:
      "border-green-200 bg-green-50/60 dark:border-green-900 dark:bg-green-950/20",
    error: "border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/20",
    info: "border-blue-200 bg-blue-50/60 dark:border-blue-900 dark:bg-blue-950/20",
  }[tone];

  return (
    <div className={`rounded-xl p-4 ${toneClass}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-muted-foreground">{icon}</div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{title}</p>
            {badge ? <Badge variant="secondary">{badge}</Badge> : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
};
