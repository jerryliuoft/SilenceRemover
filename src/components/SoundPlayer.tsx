import { Component, Setter, Show, createSignal, onCleanup } from "solid-js";
import WaveSurfer from "wavesurfer.js";
import { initWaveSurfer } from "../services/WavesurferService"; // Import the function

export interface Region {
  start: number;
  end: number;
}

const SoundPlayer: Component<{
  duration: number;
  setWavesurferRef: Setter<WaveSurfer | undefined>;
  videoName: string;
  videoPlayerRef: HTMLMediaElement;
  peakData: number[][];
}> = (props) => {
  console.log("SoundPlayer rendering");
  const [ready, setReady] = createSignal(false);

  return (
    <div class="flex-auto text-center px-2 pt-1 pb-1 ring-2 ring-inset ring-slate-300 rounded-lg">
      <Show when={!ready()}>
        <div
          class="mt-12 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
        <p class="text-sm text-slate-500">
          Give it like 10 seconds or so, bigger the file, longer the load,
          unless you got a very expensive pc, then I'm jealous
        </p>
      </Show>
      <div ref={(el) => initWaveSurfer(el, props, setReady)}></div>
    </div>
  );
};

export default SoundPlayer;
