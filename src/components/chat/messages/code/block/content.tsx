import { cn } from "@/lib/utils";
import React, { Suspense } from "react";

const LazyPrism = React.lazy(
  () => import("@/components/chat/messages/code/lazy-prism"),
);

import { useState } from "react";

export const CodeBlockContent = ({
  code,
  language,
  wraps,
}: {
  code: string;
  language: string;
  wraps: boolean;
}) => {
  const [ready, setReady] = useState(false);

  return (
    <div className="relative">
      <pre
        className={cn(
          "absolute inset-0 p-3 text-sm transition-opacity duration-300",
          ready ? "opacity-0 pointer-events-none" : "opacity-70",
        )}
        style={{
          fontFamily: "monospace",
        }}
      >
        {code}
      </pre>

      <Suspense fallback={null}>
        <div
          className={cn(
            "transition-opacity duration-300",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          <LazyPrism
            code={code}
            language={language}
            wraps={wraps}
            onReady={() => setReady(true)}
          />
        </div>
      </Suspense>
    </div>
  );
};
