import { resolveInRoot, type FsRoot } from "@/lib/fs";
import {
  copyFile,
  mkdir,
  readDir,
  readTextFile,
  remove,
  rename,
  stat,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { tool, type ToolSet } from "ai";
import { z } from "zod";

interface Opts {
  roots: FsRoot[];
}

const folderSchema = z
  .string()
  .describe("Path of a connected folder, as returned by list_folders.");

const entrySchema = z.object({
  name: z.string(),
  isFile: z.boolean(),
  isDirectory: z.boolean(),
  isSymlink: z.boolean(),
});

const findRoot = (roots: FsRoot[], folder: string): FsRoot => {
  const root = roots.find((r) => r.name === folder || r.id === folder);

  if (!root) {
    const available = roots.map((r) => r.name).join(", ") || "none";
    throw new Error(
      `Unknown folder "${folder}". Connected folders: ${available}.`,
    );
  }

  return root;
};

export const fileTools = ({ roots }: Opts): ToolSet => {
  const resolve = (folder: string, path?: string) =>
    resolveInRoot(findRoot(roots, folder), path);

  const folders = roots.map((root) => root.name).join(", ") || "none";

  return {
    list_folders: tool({
      title: "List Folders",
      description: "List the folders the user has connected to this session.",
      inputSchema: z.object({}),
      outputSchema: z.array(z.object({ name: z.string(), path: z.string() })),
      execute: async () => roots.map((r) => ({ name: r.name, path: r.path })),
    }),

    list_folder: tool({
      title: "List Directory",
      description: `List the immediate contents of a directory, including hidden dotfiles. Connected folders: ${folders}.`,
      inputSchema: z.object({
        folder: folderSchema,
        path: z
          .string()
          .optional()
          .describe(
            "Relative path to a directory. Defaults to the folder root.",
          ),
      }),
      outputSchema: z.array(entrySchema),
      execute: async ({ folder, path }) => {
        const entries = await readDir(await resolve(folder, path));
        return entries.map((entry) => ({
          name: entry.name,
          isFile: entry.isFile,
          isDirectory: entry.isDirectory,
          isSymlink: entry.isSymlink,
        }));
      },
    }),

    read_file: tool({
      title: "Read File",
      description: `Read a UTF-8 text file. Connected folders: ${folders}.`,
      inputSchema: z.object({
        folder: folderSchema,
        path: z.string().describe("Relative path to the file."),
      }),
      outputSchema: z.string(),
      execute: async ({ folder, path }) =>
        readTextFile(await resolve(folder, path)),
    }),

    stat: tool({
      title: "Stat Path",
      description: `Get metadata for a file or directory. Connected folders: ${folders}.`,
      inputSchema: z.object({
        folder: folderSchema,
        path: z
          .string()
          .optional()
          .describe("Relative path. Defaults to the folder root."),
      }),
      outputSchema: z.object({
        isFile: z.boolean(),
        isDirectory: z.boolean(),
        isSymlink: z.boolean(),
        size: z.number(),
        mtime: z.number().nullable(),
        readonly: z.boolean(),
      }),
      execute: async ({ folder, path }) => {
        const info = await stat(await resolve(folder, path));
        return {
          isFile: info.isFile,
          isDirectory: info.isDirectory,
          isSymlink: info.isSymlink,
          size: info.size,
          mtime: info.mtime ? info.mtime.getTime() : null,
          readonly: info.readonly,
        };
      },
    }),

    write_file: tool({
      title: "Write File",
      description: `Write text to a file, creating it if needed. Overwrites unless append is true. Parent directories must exist (use make_dir). Connected folders: ${folders}.`,
      inputSchema: z.object({
        folder: folderSchema,
        path: z.string().describe("Relative path to the file."),
        content: z.string(),
        append: z.boolean().optional(),
      }),
      outputSchema: z.object({ success: z.literal(true) }),
      execute: async ({ folder, path, content, append }) => {
        await writeTextFile(await resolve(folder, path), content, {
          append: !!append,
        });
        return { success: true };
      },
    }),

    edit_file: tool({
      title: "Edit File",
      description: `Replace an exact string in a text file. Fails if old is absent, or appears more than once unless replaceAll is true. Connected folders: ${folders}.`,
      inputSchema: z.object({
        folder: folderSchema,
        path: z.string().describe("Relative path to the file."),
        old: z.string().describe("Exact text to find."),
        new: z.string().describe("Replacement text."),
        replaceAll: z.boolean().optional(),
      }),
      outputSchema: z.object({
        success: z.literal(true),
        replacements: z.number(),
      }),
      execute: async ({ folder, path, old, new: replacement, replaceAll }) => {
        if (!old) throw new Error("`old` must not be empty.");

        const file = await resolve(folder, path);
        const content = await readTextFile(file);
        const count = content.split(old).length - 1;

        if (count === 0) {
          throw new Error("`old` was not found in the file.");
        }

        if (count > 1 && !replaceAll) {
          throw new Error(
            `\`old\` appears ${count} times. Add more context or set replaceAll to true.`,
          );
        }

        const updated = replaceAll
          ? content.split(old).join(replacement)
          : content.replace(old, replacement);

        await writeTextFile(file, updated);
        return { success: true, replacements: replaceAll ? count : 1 };
      },
    }),

    make_dir: tool({
      title: "Make Directory",
      description: `Create a directory, including any missing parents. Connected folders: ${folders}.`,
      inputSchema: z.object({
        folder: folderSchema,
        path: z.string().describe("Relative path of the directory to create."),
      }),
      outputSchema: z.object({ success: z.literal(true) }),
      execute: async ({ folder, path }) => {
        await mkdir(await resolve(folder, path), { recursive: true });
        return { success: true };
      },
    }),

    remove_path: tool({
      title: "Remove Path",
      description: `Delete a file or directory (directories are removed recursively). Connected folders: ${folders}.`,
      inputSchema: z.object({
        folder: folderSchema,
        path: z.string().describe("Relative path to remove."),
      }),
      outputSchema: z.object({ success: z.literal(true) }),
      execute: async ({ folder, path }) => {
        await remove(await resolve(folder, path), { recursive: true });
        return { success: true };
      },
    }),

    move_path: tool({
      title: "Move Path",
      description: `Rename or move a file or directory within the same folder. Connected folders: ${folders}.`,
      inputSchema: z.object({
        folder: folderSchema,
        from: z.string().describe("Relative source path."),
        to: z.string().describe("Relative destination path."),
      }),
      outputSchema: z.object({ success: z.literal(true) }),
      execute: async ({ folder, from, to }) => {
        await rename(await resolve(folder, from), await resolve(folder, to));
        return { success: true };
      },
    }),

    copy_path: tool({
      title: "Copy Path",
      description: `Copy a file to a new location within the same folder. Connected folders: ${folders}.`,
      inputSchema: z.object({
        folder: folderSchema,
        from: z.string().describe("Relative source path."),
        to: z.string().describe("Relative destination path."),
      }),
      outputSchema: z.object({ success: z.literal(true) }),
      execute: async ({ folder, from, to }) => {
        await copyFile(await resolve(folder, from), await resolve(folder, to));
        return { success: true };
      },
    }),
  };
};
