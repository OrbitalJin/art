interface Props {
  code: string;
  onExpand(): void;
}

export const CodeBlockPreview = ({ code, onExpand }: Props) => {
  return (
    <div
      className="p-4 cursor-pointer hover:bg-muted/5 transition-colors relative"
      onClick={onExpand}
    >
      <pre className="text-sm font-mono text-muted-foreground/60 overflow-hidden pointer-events-none select-none opacity-70">
        {code}
      </pre>

      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background/10 to-transparent" />
    </div>
  );
};
