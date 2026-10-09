// preview.tsx
interface Props {
  code: string;
  lineCount: number;
  onExpand?: () => void;
}

const fadeOut = "linear-gradient(to bottom, black 35%, transparent)";

export const CodeBlockPreview = ({ code, lineCount, onExpand }: Props) => {
  const label = `Show all ${lineCount.toLocaleString()} lines`;

  return (
    <button
      type="button"
      onClick={onExpand}
      aria-label={label}
      className="group relative block w-full cursor-pointer px-4 pt-3 pb-10 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
    >
      <pre
        className="pointer-events-none m-0 overflow-hidden font-mono text-[13px] leading-relaxed text-muted-foreground/70 select-none"
        style={{ maskImage: fadeOut, WebkitMaskImage: fadeOut }}
      >
        {code}
      </pre>

      <span className="absolute inset-x-0 bottom-2.5 text-center text-[11px] text-muted-foreground transition-colors duration-150 group-hover:text-foreground">
        {label}
      </span>
    </button>
  );
};
