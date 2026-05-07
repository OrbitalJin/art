import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSettingsStore } from "@/lib/store/use-settings-store";

export const IdentitiesSettingsTab = () => {
  const userProfile = useSettingsStore((state) => state.userProfile);
  const setUserProfile = useSettingsStore((state) => state.setUserProfile);
  const agentProfile = useSettingsStore((state) => state.agentProfile);
  const setAgentProfile = useSettingsStore((state) => state.setAgentProfile);

  return (
    <>
      <div className="max-w-3xl">
        <h3 className="text-lg font-medium">Identities</h3>
        <p className="text-sm text-muted-foreground">
          Shape who you are and who Art is.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm max-w-3xl">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-base font-medium">Your Identity</p>
            <p className="text-sm text-muted-foreground">
              Help Art know who you are.
            </p>
          </div>
          <div className="space-y-6 pt-2">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <Input
                value={userProfile.name}
                onChange={(e) => setUserProfile({ name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-muted-foreground">
                Occupation
              </label>
              <Input
                value={userProfile.occupation}
                onChange={(e) => setUserProfile({ occupation: e.target.value })}
                placeholder="e.g. Marketing student, Engineer, etc."
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-muted-foreground">
                Languages
              </label>
              <Input
                value={userProfile.languages}
                onChange={(e) => setUserProfile({ languages: e.target.value })}
                placeholder="e.g. English, Japanese, Spanish"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-muted-foreground">
                Current Goals
              </label>
              <Input
                value={userProfile.goals}
                onChange={(e) => setUserProfile({ goals: e.target.value })}
                placeholder="e.g. Learning Japanese, building a web app"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-muted-foreground">
                About You
              </label>
              <Textarea
                value={userProfile.about}
                onChange={(e) => setUserProfile({ about: e.target.value })}
                placeholder="Interests, values, preferences, and anything worth sharing."
                className="min-h-[120px] resize-y"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm max-w-3xl">
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-base font-medium">Who's Art?</p>
            <p className="text-sm text-muted-foreground">
              Shape Art's personality and communication style.
            </p>
          </div>
          <div className="space-y-4 pt-2">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-muted-foreground">
                Personality
              </label>
              <Textarea
                value={agentProfile.personality}
                onChange={(e) =>
                  setAgentProfile({ personality: e.target.value })
                }
                placeholder="e.g. Calm, analytical, intellectually curious"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-muted-foreground">
                Communication Style
              </label>
              <Textarea
                value={agentProfile.communicationStyle}
                onChange={(e) =>
                  setAgentProfile({ communicationStyle: e.target.value })
                }
                placeholder="How Art speaks and presents information."
                className="min-h-[80px] resize-y"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-muted-foreground">
                Background
              </label>
              <Textarea
                value={agentProfile.background}
                onChange={(e) =>
                  setAgentProfile({ background: e.target.value })
                }
                placeholder="What Art knows about itself."
                className="min-h-[80px] resize-y"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-muted-foreground">
                Quirks
              </label>
              <Input
                value={agentProfile.quirks}
                onChange={(e) => setAgentProfile({ quirks: e.target.value })}
                placeholder="e.g. References classical music, asks clarifying questions"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
