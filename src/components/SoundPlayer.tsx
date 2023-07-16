import { Component, Setter, Show, createSignal } from "solid-js";
import WaveSurfer from "wavesurfer.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline.js";
import RegionPlugin from "wavesurfer.js/dist/plugins/regions.js";

export interface Region {
  start: number;
  end: number;
}

const SoundPlayer: Component<{
  videoUrl: string;
  setWavesurferRef: Setter<WaveSurfer>;
}> = (props) => {
  const [ready, setReady] = createSignal(false);

  const initWaveSurfer = (wavePlayerRef: HTMLElement) => {
    const ws = WaveSurfer.create({
      container: wavePlayerRef!,
      waveColor: "#b45309",
      progressColor: "#065f46",
      minPxPerSec: 50,
      url: props.videoUrl,
      // Set a bar width
      barWidth: 2,
      // Optionally, specify the spacing between bars
      barGap: 1,
      // And the bar radius
      barRadius: 1,
    });
    // Initialize the Timeline plugin
    ws.registerPlugin(Timeline.create());
    const wsRegions = ws.registerPlugin(RegionPlugin.create());

    ws.on("ready", () => {
      setReady(true);
    });

    // Create regions for each non-silent part of the audio
    ws.on("decode", (duration) => {
      const decodedData = ws.getDecodedData();
      if (decodedData) {
        const regions = extractRegions(decodedData.getChannelData(0), duration);

        // Add regions to the waveform
        regions.forEach((region: Region, index) => {
          wsRegions.addRegion({
            start: region.start,
            end: region.end,
            content: index.toString(),
            drag: false,
            resize: true,
            color: "rgba(252, 231, 243, 0.5)",
          });
        });
      }
    });

    props.setWavesurferRef(ws);
  };

  // Find regions separated by silence
  const extractRegions = (audioData, duration) => {
    const minValue = 0.01;
    const minSilenceDuration = 0.1;
    const mergeDuration = 0.2;
    const scale = duration / audioData.length;
    const silentRegions: Region[] = [];

    // Find all silent regions longer than minSilenceDuration
    let start = 0;
    let end = 0;
    let isSilent = false;
    for (let i = 0; i < audioData.length; i++) {
      if (audioData[i] < minValue) {
        if (!isSilent) {
          start = i;
          isSilent = true;
        }
      } else if (isSilent) {
        end = i;
        isSilent = false;
        if (scale * (end - start) > minSilenceDuration) {
          silentRegions.push({
            start: scale * start,
            end: scale * end,
          });
        }
      }
    }

    // Merge silent regions that are close together
    const mergedRegions = [];
    let lastRegion = null;
    for (let i = 0; i < silentRegions.length; i++) {
      if (
        lastRegion &&
        silentRegions[i].start - lastRegion.end < mergeDuration
      ) {
        lastRegion.end = silentRegions[i].end;
      } else {
        lastRegion = silentRegions[i];
        mergedRegions.push(lastRegion);
      }
    }

    // Find regions that are not silent
    const regions = [];
    let lastEnd = 0;
    for (let i = 0; i < mergedRegions.length; i++) {
      regions.push({
        start: lastEnd,
        end: mergedRegions[i].start,
      });
      lastEnd = mergedRegions[i].end;
    }

    return regions;
  };

  return (
    <div class="flex-auto text-center px-2 pt-1 pb-1 ring-2 ring-inset ring-slate-300 rounded-lg">
      <Show when={!ready()}>
        <div
          class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </Show>
      <div ref={initWaveSurfer}></div>
    </div>
  );
};

export default SoundPlayer;
