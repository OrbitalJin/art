import { useTheme, type ThemeColor } from "@/contexts/theme-context";
import { createHighlighter, type Highlighter } from "shiki";
import { useEffect, useState } from "react";

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
  terminal: "kanagawa-dragon",
  "t3 chat": "dracula-soft",
  claude: "gruvbox-dark-hard",
  aero: "nord",
  pony: "synthwave-84",
  zen: "dark-plus",
};

const THEMES = [
  "dracula",
  "material-theme-darker",
  "solarized-light",
  "gruvbox-dark-hard",
  "min-dark",
  "dracula-soft",
  "everforest-dark",
  "synthwave-84",
  "tokyo-night",
  "solarized-dark",
  "kanagawa-dragon",
  "nord",
  "dark-plus",
];

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
  "graphql",
  "docker",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "scala",
  "r",
  "perl",
  "lua",
  "haskell",
  "elixir",
  "clojure",
  "zig",
  "solidity",
  "powershell",
];

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: THEMES,
      langs: LANGUAGES,
    });
  }
  return highlighterPromise;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const highlighter = await getHighlighter();

        if (cancelled) return;

        const loadedLangs = highlighter.getLoadedLanguages();
        const normalizedLang = language.toLowerCase();

        try {
          if (
            normalizedLang !== "text" &&
            !(loadedLangs as readonly string[]).includes(normalizedLang)
          ) {
            await highlighter.loadLanguage(
              normalizedLang as Parameters<Highlighter["loadLanguage"]>[0],
            );
          }
        } catch {
          // language not available — fall through to plain text
        }

        if (cancelled) return;

        const styled = highlighter.codeToHtml(code, {
          lang: normalizedLang,
          theme,
          rootStyle: `margin:0;background:transparent;font-family:monospace${wraps ? ";white-space:pre-wrap;word-break:break-word" : ""}`,
        });

        setHtml(styled);
      } catch {
        if (!cancelled) {
          setHtml(
            `<pre style="margin:0;background:transparent;font-family:monospace">${escapeHtml(code)}</pre>`,
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, language, theme, wraps]);

  return (
    <div
      className="text-sm p-4 overflow-x-auto"
      dangerouslySetInnerHTML={{
        __html:
          html ??
          `<pre style="margin:0;background:transparent;font-family:monospace">${escapeHtml(code)}</pre>`,
      }}
    />
  );
};
