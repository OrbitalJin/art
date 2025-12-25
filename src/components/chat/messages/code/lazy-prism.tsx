import React from "react";
import { Prism } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
  code: string;
  language: string;
  wraps: boolean;
}

const LazyPrism: React.FC<Props> = ({ code, language, wraps }) => {
  return (
    <div className="text-sm p-1">
      <Prism
        style={oneDark}
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
