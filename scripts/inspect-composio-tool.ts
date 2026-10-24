import { Composio } from "@composio/core";
import PocketBase from "pocketbase";
import { homedir } from "node:os";
import { join } from "node:path";

const IDENTIFIER = "com.horijin.dev";
const PB_URL = "https://pb.x1c.dev";

async function readArtKey(): Promise<string | undefined> {
  if (Bun.env.ART_KEY) return Bun.env.ART_KEY;
  const candidates = [
    process.env.SETTINGS_STORE_PATH,
    join(homedir(), ".local", "share", IDENTIFIER, "settings.json"), // linux
  ].filter(Boolean) as string[];

  for (const path of candidates) {
    const file = Bun.file(path);
    if (!(await file.exists())) continue;
    const raw = await file.json();
    const persisted = raw["settings-storage"];
    return persisted["state"]["artKey"];
  }
  return undefined;
}

const slug = Bun.argv[2];

const artKey = await readArtKey();

if (!artKey || !slug) {
  throw new Error("Set ART_KEY and pass a tool slug.");
}

const apiKey =
  Bun.env.COMPOSIO_API_KEY ??
  (
    await new PocketBase(PB_URL).collection("keys").getOne<{ composio: string }>(
      artKey,
    )
  ).composio;

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
