import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Copy, Check, TextWrap, TextAlignStart } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopy } from "@/hooks/use-copy";

interface CodeBlockProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const CodeBlock = ({ className, children }: CodeBlockProps) => {
  const code = String(children ?? "").replace(/\n$/, "");
  const match = /language-(\w+)/.exec(className || "");
  const language = match?.[1] ?? "text";

  const [wraps, setWraps] = useState(true);
  const { copied, copy } = useCopy(code);

  return (
    <div className="relative my-2 overflow-hidden rounded-md border">
      <div className="flex items-center justify-between border-b bg-card px-4 py-1">
        <span className="text-xs lowercase">{language}</span>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setWraps((v) => !v)}
              >
                {wraps ? <TextWrap /> : <TextAlignStart />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{wraps ? "Unwrap" : "Wrap"}</TooltipContent>
          </Tooltip>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={copy}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      <SyntaxHighlighter
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
      </SyntaxHighlighter>
    </div>
  );
};
