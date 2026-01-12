import { useReducer } from "react";

interface SessionState {
  prompt: string;
  isSending: boolean;
  streamingSessionId: string | null;
  streamState: { content: string; status: "thinking" | "streaming" | "aborted" };
}

type SessionAction =
  | { type: "SET_PROMPT"; payload: string }
  | { type: "START_SENDING"; payload: string }
  | { type: "STREAM_TOKEN"; payload: string }
  | { type: "COMPLETE_STREAM" }
  | { type: "ABORT_STREAM" };

const initialState: SessionState = {
  prompt: "",
  isSending: false,
  streamingSessionId: null,
  streamState: { content: "", status: "thinking" },
};

const sessionReducer = (state: SessionState, action: SessionAction): SessionState => {
  switch (action.type) {
    case "SET_PROMPT":
      return { ...state, prompt: action.payload };
    case "START_SENDING":
      return {
        ...state,
        isSending: true,
        streamingSessionId: action.payload,
        streamState: { content: "", status: "thinking" },
      };
    case "STREAM_TOKEN":
      return {
        ...state,
        streamState: {
          content: state.streamState.content + action.payload,
          status: "streaming",
        },
      };
    case "COMPLETE_STREAM":
      return {
        ...state,
        isSending: false,
        streamingSessionId: null,
      };
    case "ABORT_STREAM":
      return {
        ...state,
        streamState: { ...state.streamState, status: "aborted" },
        isSending: false,
        streamingSessionId: null,
      };
    default:
      return state;
  }
};

export const useSessionState = () => useReducer(sessionReducer, initialState);