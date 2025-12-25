import React, { useState, memo, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, TextWrap, TextAlignStart } from "lucide-react";
import { useCopy } from "@/hooks/use-copy";

const LazyPrism = React.lazy(
  () => import("@/components/chat/messages/code/lazy-prism"),
);

interface CodeBlockProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

const CodeBlockComponent = ({ className, children }: CodeBlockProps) => {
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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setWraps((v) => !v)}
          >
            {wraps ? <TextWrap /> : <TextAlignStart />}
          </Button>

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

      <Suspense
        fallback={
          <pre className="p-4 text-xs font-mono overflow-x-auto bg-muted/40">
            {code}
          </pre>
        }
      >
        <LazyPrism code={code} language={language} wraps={wraps} />
      </Suspense>
    </div>
  );
};

export const CodeBlock = memo(CodeBlockComponent, (prev, next) => {
  return prev.children === next.children && prev.className === next.className;
});
