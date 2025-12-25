import React, { useEffect } from "react";
import { Prism } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
  code: string;
  language: string;
  wraps: boolean;
  onReady?: () => void;
}

const LazyPrism: React.FC<Props> = ({ code, language, wraps, onReady }) => {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return (
    <Prism
      style={oneDark}
      language={language}
      PreTag="div"
      customStyle={{
        background: "transparent",
        padding: "1rem",
        margin: 0,
        fontSize: "0.8rem",
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
  );
};
export default LazyPrism;
