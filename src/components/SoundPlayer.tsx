import { Component, Setter, Show, createSignal, onCleanup } from "solid-js";
import WaveSurfer from "wavesurfer.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline.js";
import RegionPlugin from "wavesurfer.js/dist/plugins/regions.js";
import ZoomPlugin from "wavesurfer.js/dist/plugins/zoom.js";
import { addRegions, extractRegions } from "./SilentHelper";

export interface Region {
  start: number;
  end: number;
}

const SoundPlayer: Component<{
  videoUrl: string;
  setWavesurferRef: Setter<WaveSurfer | undefined>;
  videoName: string;
}> = (props) => {
  const [ready, setReady] = createSignal(false);

  const initWaveSurfer = (wavePlayerRef: HTMLElement) => {
    const ws = WaveSurfer.create({
      container: wavePlayerRef!,
      waveColor: "#c084fc",
      progressColor: "#6b21a8",
      minPxPerSec: 50,
      url: props.videoUrl,
      // Set a bar width
      barWidth: 2,
      barGap: 1,
      barRadius: 1,
      normalize: true,
    });
    // KEEP THE PLUGINS IN THIS ORDER, because they are retrieved using an array so order matters
    ws.registerPlugin(Timeline.create());
    const wsRegions = ws.registerPlugin(RegionPlugin.create());
    ws.registerPlugin(
      ZoomPlugin.create({
        scale: 0.25,
        maxZoom: 100,
      })
    );

    ws.on("ready", () => {
      setReady(true);
    });

    // Create regions for each non-silent part of the audio
    ws.on("decode", (duration) => {
      const decodedData = ws.getDecodedData();
      const config = {
        minVolume: 5,
        minDuration: 0.8,
        prePadding: 0.2,
        postPadding: 0.2,
      };
      if (decodedData) {
        const store = JSON.parse(localStorage.getItem("zones") || "{}");
        if (store && store.file === props.videoName) {
          for (const key in store.region) {
            const cur = store.region[key];
            wsRegions.addRegion(cur);
          }
        } else {
          localStorage.clear();
          const regions = extractRegions(
            decodedData.getChannelData(0),
            duration,
            config
          );
          addRegions(regions, wsRegions, config, duration);
        }
      }
    });

    props.setWavesurferRef(ws);

    // Cleanup on component unmount
    onCleanup(() => {
      ws.destroy();
    });
  };

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
      <div ref={initWaveSurfer}></div>
    </div>
  );
};

export default SoundPlayer;
