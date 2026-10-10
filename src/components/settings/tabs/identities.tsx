// identities-settings-tab.tsx
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { cn } from "@/lib/utils";
import {
  INPUT_CLASSES,
  SettingsCard,
  SettingsPage,
  SettingsSection,
  TEXTAREA_CLASSES,
} from "./settings-layout";

const Field: React.FC<{
  id: string;
  label: string;
  children: React.ReactNode;
}> = ({ id, label, children }) => (
  <div className="flex flex-col gap-2 px-4 py-4">
    <label htmlFor={id} className="text-[13px] font-medium text-foreground">
      {label}
    </label>
    {children}
  </div>
);

export const IdentitiesSettingsTab = () => {
  const userProfile = useSettingsStore((state) => state.userProfile);
  const setUserProfile = useSettingsStore((state) => state.setUserProfile);
  const agentProfile = useSettingsStore((state) => state.agentProfile);
  const setAgentProfile = useSettingsStore((state) => state.setAgentProfile);

  const aboutClasses = cn(TEXTAREA_CLASSES, "min-h-[120px]");
  const personalityClasses = cn(TEXTAREA_CLASSES, "min-h-[72px]");
  const communicationClasses = cn(TEXTAREA_CLASSES, "min-h-[80px]");
  const backgroundClasses = cn(TEXTAREA_CLASSES, "min-h-[80px]");

  return (
    <SettingsPage
      title="Identities"
      description="Shape who you are and who Art is."
    >
      <SettingsSection title="You" description="Help Art know who you are.">
        <SettingsCard>
          <Field id="user-name" label="Name">
            <Input
              id="user-name"
              className={INPUT_CLASSES}
              value={userProfile.name}
              onChange={(e) => setUserProfile({ name: e.target.value })}
              placeholder="Enter your name"
            />
          </Field>

          <Field id="user-occupation" label="Occupation">
            <Input
              id="user-occupation"
              className={INPUT_CLASSES}
              value={userProfile.occupation}
              onChange={(e) => setUserProfile({ occupation: e.target.value })}
              placeholder="e.g. Marketing student, Engineer, etc."
            />
          </Field>

          <Field id="user-languages" label="Languages">
            <Input
              id="user-languages"
              className={INPUT_CLASSES}
              value={userProfile.languages}
              onChange={(e) => setUserProfile({ languages: e.target.value })}
              placeholder="e.g. English, Japanese, Spanish"
            />
          </Field>

          <Field id="user-goals" label="Current goals">
            <Input
              id="user-goals"
              className={INPUT_CLASSES}
              value={userProfile.goals}
              onChange={(e) => setUserProfile({ goals: e.target.value })}
              placeholder="e.g. Learning Japanese, building a web app"
            />
          </Field>

          <Field id="user-about" label="About you">
            <Textarea
              id="user-about"
              className={aboutClasses}
              value={userProfile.about}
              onChange={(e) => setUserProfile({ about: e.target.value })}
              placeholder="Interests, values, preferences, and anything worth sharing."
            />
          </Field>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection
        title="Art"
        description="Shape Art's personality and communication style."
      >
        <SettingsCard>
          <Field id="agent-personality" label="Personality">
            <Textarea
              id="agent-personality"
              className={personalityClasses}
              value={agentProfile.personality}
              onChange={(e) => setAgentProfile({ personality: e.target.value })}
              placeholder="e.g. Calm, analytical, intellectually curious"
            />
          </Field>

          <Field id="agent-communication" label="Communication style">
            <Textarea
              id="agent-communication"
              className={communicationClasses}
              value={agentProfile.communicationStyle}
              onChange={(e) =>
                setAgentProfile({ communicationStyle: e.target.value })
              }
              placeholder="How Art speaks and presents information."
            />
          </Field>

          <Field id="agent-background" label="Background">
            <Textarea
              id="agent-background"
              className={backgroundClasses}
              value={agentProfile.background}
              onChange={(e) => setAgentProfile({ background: e.target.value })}
              placeholder="What Art knows about itself."
            />
          </Field>

          <Field id="agent-quirks" label="Quirks">
            <Input
              id="agent-quirks"
              className={INPUT_CLASSES}
              value={agentProfile.quirks}
              onChange={(e) => setAgentProfile({ quirks: e.target.value })}
              placeholder="e.g. References classical music, asks clarifying questions"
            />
          </Field>
        </SettingsCard>
      </SettingsSection>
    </SettingsPage>
  );
};
