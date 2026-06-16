import { tool, type ToolSet } from "ai";
import { z } from "zod";
import { useIntervalStore } from "@/lib/store/use-interval-store";

export const playerTools = (): ToolSet => {
  return {
    toggle_playing_state: tool({
      title: "Toggle Playing State",
      description: "Toggle the playing state of the audio player",
      inputSchema: z.object({}),
      execute: async () => {
        useIntervalStore.getState().togglePlay();
      },
    }),

    set_playing: tool({
      title: "Set Playing State",
      description: "Explicitly set the playing state of the audio player",
      inputSchema: z.object({
        playing: z.boolean().describe("Whether the audio should be playing"),
      }),
      execute: async ({ playing }) => {
        useIntervalStore.getState().setPlaying(playing);
      },
    }),

    set_volume: tool({
      title: "Set Volume",
      description: "Set the audio player volume",
      inputSchema: z.object({
        volume: z
          .number()
          .min(0)
          .max(1)
          .describe("Volume level between 0 (silent) and 1 (full)"),
      }),
      execute: async ({ volume }) => {
        useIntervalStore.getState().setVolume(volume);
      },
    }),

    toggle_muted: tool({
      title: "Toggle Muted",
      description: "Mute or unmute the audio player",
      inputSchema: z.object({}),
      execute: async () => {
        useIntervalStore.getState().toggleMute();
      },
    }),

    set_muted: tool({
      title: "Set Muted",
      description: "Explicitly set the muted state of the audio player",
      inputSchema: z.object({
        muted: z.boolean().describe("Whether the audio should be muted"),
      }),
      execute: async ({ muted }) => {
        useIntervalStore.getState().setMuted(muted);
      },
    }),

    set_loop: tool({
      title: "Set Loop",
      description: "Explicitly set the loop state of the audio player",
      inputSchema: z.object({
        loop: z.boolean().describe("Whether playback should loop"),
      }),
      execute: async ({ loop }) => {
        useIntervalStore.getState().setLoop(loop);
      },
    }),

    add_to_playlist: tool({
      title: "Add to Playlist",
      description: "Add a YouTube URL to the playlist",
      inputSchema: z.object({
        url: z.string().url().describe("YouTube URL to add to the playlist"),
      }),
      execute: async ({ url }) => {
        useIntervalStore.getState().addToPlaylist(url);
      },
    }),

    remove_from_playlist: tool({
      title: "Remove from Playlist",
      description: "Remove a track from the playlist by its index",
      inputSchema: z.object({
        index: z
          .number()
          .int()
          .min(0)
          .describe("Index of the track to remove from the playlist"),
      }),
      execute: async ({ index }) => {
        useIntervalStore.getState().removeFromPlaylist(index);
      },
    }),

    clear_playlist: tool({
      title: "Clear Playlist",
      description: "Remove all tracks from the playlist",
      inputSchema: z.object({}),
      execute: async () => {
        useIntervalStore.getState().clearPlaylist();
      },
    }),

    play_next: tool({
      title: "Play Next Track",
      description: "Skip to the next track in the playlist",
      inputSchema: z.object({}),
      execute: async () => {
        useIntervalStore.getState().playNext();
      },
    }),

    play_previous: tool({
      title: "Play Previous Track",
      description: "Go back to the previous track in the playlist",
      inputSchema: z.object({}),
      execute: async () => {
        useIntervalStore.getState().playPrevious();
      },
    }),

    play_at: tool({
      title: "Play Track at Index",
      description:
        "Jump to and play a specific track in the playlist by its index",
      inputSchema: z.object({
        index: z.number().int().min(0).describe("Index of the track to play"),
      }),
      execute: async ({ index }) => {
        useIntervalStore.getState().playAt(index);
      },
    }),
  } satisfies ToolSet;
};
