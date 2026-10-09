import { useTheme, type ThemeColor } from "@/contexts/theme-context";
import {
  bundledLanguages,
  createHighlighter,
  type BundledLanguage,
  type Highlighter,
} from "shiki";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const themeShikiMap: Record<ThemeColor, string> = {
  "amethyst haze": "tokyo-night",
  "cosmic night": "tokyo-night",
  "midnight bloom": "tokyo-night",
  "pastel dreams": "dracula",
  "violet bloom": "tokyo-night",
  "quantum rose": "synthwave-84",
  "flutter shy": "synthwave-84",
  "sunny sprout": "everforest-dark",
  "dark matter": "kanagawa-dragon",
  "claude plus": "gruvbox-dark-hard",
  "mocha mousse": "gruvbox-dark-hard",
  terminal: "kanagawa-dragon",
  "t3 chat": "dracula-soft",
  vercel: "dark-plus",
  claude: "gruvbox-dark-hard",
  aero: "nord",
  pony: "synthwave-84",
  zen: "dark-plus",
};

const THEMES = [...new Set(Object.values(themeShikiMap))];

const LANGUAGES = [
  "javascript",
  "typescript",
  "jsx",
  "tsx",
  "python",
  "css",
  "html",
  "json",
  "bash",
  "shell",
  "sql",
  "rust",
  "go",
  "java",
  "cpp",
  "c",
  "yaml",
  "xml",
  "markdown",
  "text",
  "diff",
  "r",
  "zig",
  "docker",
  "swift",
  "lua",
];

let highlighterPromise: Promise<Highlighter> | null = null;

const getHighlighter = (): Promise<Highlighter> => {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: THEMES,
      langs: LANGUAGES,
    }).catch((error) => {
      highlighterPromise = null;
      throw error;
    });
  }
  return highlighterPromise;
};

const isBundledLanguage = (value: string): value is BundledLanguage =>
  value in bundledLanguages;

// Returns a language the highlighter can render, loading it on demand.
// Anything unknown falls back to plain text instead of throwing.
const resolveLanguage = async (
  highlighter: Highlighter,
  language: string,
): Promise<string> => {
  if (language === "text") return language;

  const loaded = highlighter.getLoadedLanguages();
  if (loaded.some((name) => name === language)) return language;
  if (!isBundledLanguage(language)) return "text";

  try {
    await highlighter.loadLanguage(language);
    return language;
  } catch {
    return "text";
  }
};

interface CodeBlockContentProps {
  code: string;
  language: string;
  wraps: boolean;
}

export const CodeBlockContent = ({
  code,
  language,
  wraps,
}: CodeBlockContentProps) => {
  const { color } = useTheme();
  const theme = themeShikiMap[color];
  const [html, setHtml] = useState<string | null>(null);

  // Wrapping is pure CSS, so toggling it doesn't re-run the highlighter.
  useEffect(() => {
    let cancelled = false;

    const highlight = async () => {
      try {
        const highlighter = await getHighlighter();
        const lang = await resolveLanguage(highlighter, language);
        if (cancelled) return;

        setHtml(
          highlighter.codeToHtml(code, {
            lang,
            theme,
            rootStyle: "background:transparent;margin:0",
          }),
        );
      } catch {
        if (!cancelled) setHtml(null);
      }
    };

    void highlight();

    return () => {
      cancelled = true;
    };
  }, [code, language, theme]);

  const classes = cn(
    "max-h-[32rem] overflow-auto px-4 py-3 text-[13px] leading-relaxed",
    "[&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-0",
    wraps && "[&_pre]:wrap-anywhere [&_pre]:whitespace-pre-wrap",
  );

  if (html) {
    return (
      <div className={classes} dangerouslySetInnerHTML={{ __html: html }} />
    );
  }

  return (
    <div className={classes}>
      <pre className="text-foreground/80">{code}</pre>
    </div>
  );
};
