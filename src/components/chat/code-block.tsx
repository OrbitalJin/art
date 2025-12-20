import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Copy, Check } from "lucide-react";

interface Props extends React.HtmlHTMLAttributes<HTMLElement> {
  inline?: boolean;
  children?: React.ReactNode;
}

export const CodeBlock: React.FC<Props> = ({
  inline,
  className,
  children,
  ...props
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const code = String(children ?? "").replace(/\n$/, "");
  const match = /language-(\w+)/.exec(className || "");
  const language = match?.[1] ?? "text";

  console.log(inline);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  if (inline) {
    return (
      <code
        className={cn(
          "bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm",
          "text-foreground/80 border border-muted-foreground/20",
          className,
        )}
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative my-2 overflow-hidden rounded-md border pointer-events-none">
      <div className="flex items-center justify-between border-b bg-card px-4 py-2">
        <span className="text-xs lowercase">{language}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-80 hover:opacity-100 pointer-events-auto"
          onClick={handleCopy}
        >
          {isCopied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>

      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{
          background: "transparent",
          borderRadius: 0,
          padding: "1rem",
          margin: 0,
          fontSize: "0.8rem",
        }}
        codeTagProps={{
          style: {
            backgroundColor: "transparent",
            fontFamily: "mono",
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};
