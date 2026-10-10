import { useTheme, type ThemeColor } from "@/contexts/theme-context";
import {
  createHighlighterCore,
  type HighlighterCore,
} from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
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

// Lazy language/theme registrations keep each grammar in its own chunk so the
// chat bundle only carries the languages actually used at runtime.
const LANGUAGES = [
  () => import("@shikijs/langs/javascript"),
  () => import("@shikijs/langs/typescript"),
  () => import("@shikijs/langs/jsx"),
  () => import("@shikijs/langs/tsx"),
  () => import("@shikijs/langs/python"),
  () => import("@shikijs/langs/css"),
  () => import("@shikijs/langs/html"),
  () => import("@shikijs/langs/json"),
  () => import("@shikijs/langs/bash"),
  () => import("@shikijs/langs/shell"),
  () => import("@shikijs/langs/sql"),
  () => import("@shikijs/langs/rust"),
  () => import("@shikijs/langs/go"),
  () => import("@shikijs/langs/java"),
  () => import("@shikijs/langs/cpp"),
  () => import("@shikijs/langs/c"),
  () => import("@shikijs/langs/yaml"),
  () => import("@shikijs/langs/xml"),
  () => import("@shikijs/langs/markdown"),
  () => import("@shikijs/langs/diff"),
  () => import("@shikijs/langs/r"),
  () => import("@shikijs/langs/zig"),
  () => import("@shikijs/langs/docker"),
  () => import("@shikijs/langs/swift"),
  () => import("@shikijs/langs/lua"),
];

const THEMES = [
  () => import("@shikijs/themes/tokyo-night"),
  () => import("@shikijs/themes/dracula"),
  () => import("@shikijs/themes/synthwave-84"),
  () => import("@shikijs/themes/everforest-dark"),
  () => import("@shikijs/themes/kanagawa-dragon"),
  () => import("@shikijs/themes/gruvbox-dark-hard"),
  () => import("@shikijs/themes/dracula-soft"),
  () => import("@shikijs/themes/dark-plus"),
  () => import("@shikijs/themes/nord"),
];

let highlighterPromise: Promise<HighlighterCore> | null = null;

const getHighlighter = (): Promise<HighlighterCore> => {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: THEMES,
      langs: LANGUAGES,
      engine: createOnigurumaEngine(import("shiki/wasm")),
    }).catch((error) => {
      highlighterPromise = null;
      throw error;
    });
  }
  return highlighterPromise;
};

// Returns a language the highlighter can render. Anything unknown falls back to
// plain text instead of throwing.
const resolveLanguage = (highlighter: HighlighterCore, language: string) => {
  if (language === "text") return "text";
  if (highlighter.getLoadedLanguages().some((name) => name === language)) {
    return language;
  }
  return "text";
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
        const lang = resolveLanguage(highlighter, language);
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
