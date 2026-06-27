import { GitBranch } from "lucide-react";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { MessageScrollerItem } from "@/components/ui/message-scroller";
import { useSessionStore } from "@/lib/store/use-session-store";

const BRANCH_ORIGIN_MARKER_ID = "branch-origin";

export const BranchOriginMarker: React.FC = () => {
  const branchOf = useSessionStore((s) =>
    s.activeId ? s.getFn(s.activeId)?.branchOf : undefined,
  );
  const parentTitle = useSessionStore((s) =>
    branchOf ? s.getFn(branchOf)?.title : undefined,
  );

  if (!branchOf) return null;

  return (
    <MessageScrollerItem messageId={BRANCH_ORIGIN_MARKER_ID} scrollAnchor>
      <div className="py-4 mx-auto max-w-3xl">
        <Marker variant="separator">
          <MarkerIcon>
            <GitBranch className="size-3.5" />
          </MarkerIcon>
          <MarkerContent className="text-xs">
            Branched from {parentTitle ?? "another session"}
          </MarkerContent>
        </Marker>
      </div>
    </MessageScrollerItem>
  );
};
