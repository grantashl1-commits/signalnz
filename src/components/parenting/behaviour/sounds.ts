// Custom sound effects for behaviour points
import positiveUrl from "@/assets/parenting/positive.mp3";
import negativeUrl from "@/assets/parenting/negative.mp3";

let positiveAudio: HTMLAudioElement | null = null;
let negativeAudio: HTMLAudioElement | null = null;

function getAudio(kind: "positive" | "negative"): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  try {
    if (kind === "positive") {
      if (!positiveAudio) {
        positiveAudio = new Audio(positiveUrl);
        positiveAudio.preload = "auto";
        positiveAudio.volume = 0.7;
      }
      return positiveAudio;
    } else {
      if (!negativeAudio) {
        negativeAudio = new Audio(negativeUrl);
        negativeAudio.preload = "auto";
        negativeAudio.volume = 0.7;
      }
      return negativeAudio;
    }
  } catch {
    return null;
  }
}

function play(kind: "positive" | "negative") {
  const a = getAudio(kind);
  if (!a) return;
  try {
    a.currentTime = 0;
    void a.play().catch(() => {});
  } catch {}
}

export function playChime() {
  play("positive");
}

export function playBuzz() {
  play("negative");
}
