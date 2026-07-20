export type CaptureKind = "text" | "link" | "image";
export type CaptureFilter = "all" | "starred" | "unstarred" | "text" | "link";

export interface Capture {
  id: string;
  kind: CaptureKind;
  title: string;
  content: string;
  source: string;
  starred: boolean;
  createdAt: number;
}

export interface AddCaptureInput {
  kind: CaptureKind;
  content: string;
  title?: string;
  source: string;
}
