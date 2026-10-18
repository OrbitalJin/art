import { Composio } from "@composio/core";
import { homedir } from "node:os";
import { join } from "node:path";

const IDENTIFIER = "com.horijin.dev";

async function readComposioKey(): Promise<string | undefined> {
  if (Bun.env.COMPOSIO_API_KEY) return Bun.env.COMPOSIO_API_KEY;
  const candidates = [
    process.env.SETTINGS_STORE_PATH,
    join(homedir(), ".local", "share", IDENTIFIER, "settings.json"), // linux
  ].filter(Boolean) as string[];

  for (const path of candidates) {
    const file = Bun.file(path);
    if (!(await file.exists())) continue;
    const raw = await file.json();
    const persisted = raw["settings-storage"];
    return persisted["state"]["composioApiKey"];
  }
  return undefined;
}

const slug = Bun.argv[2];

const apiKey = await readComposioKey();

if (!apiKey || !slug) {
  throw new Error("Set COMPOSIO_API_KEY and pass a tool slug.");
}

const composio = new Composio({ apiKey });

const definition = await composio.tools.getRawComposioToolBySlug(slug);

console.log(
  JSON.stringify(
    {
      slug: definition.slug,
      version: definition.version,
      description: definition.description,
      input: definition.inputParameters,
      output: definition.outputParameters,
    },
    null,
    2,
  ),
);
