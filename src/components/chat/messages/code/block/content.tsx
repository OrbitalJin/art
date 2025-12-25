import React, { Suspense } from "react";
import { CodeBlockPreview } from "./preview";

const LazyPrism = React.lazy(
  () => import("@/components/chat/messages/code/lazy-prism"),
);

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
  return (
    <Suspense fallback={<CodeBlockPreview code={code} />}>
      <LazyPrism code={code} language={language} wraps={wraps} />
    </Suspense>
  );
};
