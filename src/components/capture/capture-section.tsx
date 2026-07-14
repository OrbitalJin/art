interface Props {
  title: string;
  count: number;
  children: React.ReactNode;
}

export const CaptureSection: React.FC<Props> = ({
  title,
  count,
  children,
}) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 px-2 pt-3 pb-1 text-xs font-medium text-muted-foreground select-none">
        <span>{title}</span>
        <span className="text-muted-foreground/60">({count})</span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
};
