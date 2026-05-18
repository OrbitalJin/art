import { useCallback, useEffect, useReducer, useRef } from "react";
import { useTimer } from "react-timer-hook";

const playBeep = (frequency = 880, duration = 200) => {
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  gainNode.gain.value = 0.05;

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start();

  setTimeout(() => {
    oscillator.stop();
    void context.close();
  }, duration);
};

interface Opts {
  focusTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  sessionCount: number;
}

export type SessionVariant = "focus" | "shortBreak" | "longBreak";

type State = {
  variant: SessionVariant;
  currentSession: number;
};

type Action = { type: "ADVANCE"; sessionCount: number } | { type: "RESET" };

const initialState: State = {
  variant: "focus",
  currentSession: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADVANCE": {
      if (state.variant === "focus") {
        const nextSession = state.currentSession + 1;
        const nextVariant =
          nextSession >= action.sessionCount ? "longBreak" : "shortBreak";

        return {
          variant: nextVariant,
          currentSession: nextSession,
        };
      }

      if (state.variant === "shortBreak") {
        return {
          ...state,
          variant: "focus",
        };
      }

      return {
        variant: "focus",
        currentSession: 0,
      };
    }

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

export const useIntervalTimer = ({
  focusTime,
  shortBreakTime,
  longBreakTime,
  sessionCount,
}: Opts) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const prevVariantRef = useRef<SessionVariant>(state.variant);
  const didMountRef = useRef(false);

  const getTimeForVariant = useCallback(
    (v: SessionVariant) => {
      switch (v) {
        case "longBreak":
          return longBreakTime;
        case "shortBreak":
          return shortBreakTime;
        default:
          return focusTime;
      }
    },
    [focusTime, shortBreakTime, longBreakTime],
  );

  const generateExpiry = useCallback(
    (v: SessionVariant) => {
      const time = new Date();
      time.setSeconds(time.getSeconds() + getTimeForVariant(v) * 60);
      return time;
    },
    [getTimeForVariant],
  );

  const { seconds, minutes, isRunning, pause, resume, restart } = useTimer({
    autoStart: false,
    expiryTimestamp: generateExpiry("focus"),
    onExpire: () => {
      dispatch({ type: "ADVANCE", sessionCount });
      playBeep();
    },
  });

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      prevVariantRef.current = state.variant;
      return;
    }

    restart(generateExpiry(state.variant), false);
    prevVariantRef.current = state.variant;
  }, [state.variant, restart, generateExpiry]);

  const skip = useCallback(() => {
    dispatch({ type: "ADVANCE", sessionCount });
    playBeep();
  }, [sessionCount]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
    restart(generateExpiry("focus"), false);
  }, [restart, generateExpiry]);

  return {
    skip,
    variant: state.variant,
    current: state.currentSession,
    seconds,
    minutes,
    isRunning,
    pause,
    resume,
    reset,
    totalSessions: sessionCount,
  };
};
