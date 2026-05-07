import { useTheme, type ThemeColor } from "@/contexts/theme-context";
import React from "react";
import { Prism } from "react-syntax-highlighter";
import {
  dracula,
  duotoneSpace,
  gruvboxDark,
  materialDark,
  nord,
  solarizedlight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

const themePrismMap: Record<ThemeColor, typeof dracula> = {
  "amethyst haze": dracula,
  "cosmic night": dracula,
  "midnight bloom": dracula,
  "pastel dreams": dracula,
  "violet bloom": dracula,
  "quantum rose": materialDark,
  "flutter shy": solarizedlight,
  "sunny sprout": gruvboxDark,
  "dark matter": duotoneSpace,
  "claude plus": dracula,
  terminal: duotoneSpace,
  "t3 chat": dracula,
  claude: gruvboxDark,
  aero: nord,
  pony: materialDark,
  zen: duotoneSpace,
};

interface Props {
  code: string;
  language: string;
  wraps: boolean;
}

const LazyPrism: React.FC<Props> = ({ code, language, wraps }) => {
  const { color } = useTheme();
  return (
    <div className="text-sm p-1">
      <Prism
        style={themePrismMap[color]}
        language={language}
        PreTag="div"
        customStyle={{
          background: "transparent",
          margin: 0,
        }}
        codeTagProps={{
          style: {
            whiteSpace: wraps ? "pre-wrap" : "pre",
            wordBreak: "break-word",
            backgroundColor: "transparent",
            fontFamily: "monospace",
          },
        }}
      >
        {code}
      </Prism>
    </div>
  );
};
export default LazyPrism;
