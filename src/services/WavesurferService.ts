import WaveSurfer from "wavesurfer.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline.js";
import RegionPlugin, { Region } from "wavesurfer.js/dist/plugins/regions.js";
import ZoomPlugin from "wavesurfer.js/dist/plugins/zoom.js";
import { addRegions, extractRegions } from "./SilentHelper";
import { Setter } from "solid-js";

interface Props {
  videoPlayerRef: HTMLMediaElement;
  peakData: any;
  duration: number;
  setWavesurferRef: Setter<WaveSurfer | undefined>;
}

const createWaveSurferInstance = (
  wavePlayerRef: HTMLElement,
  props: Props
): WaveSurfer => {
  return WaveSurfer.create({
    container: wavePlayerRef!,
    waveColor: "#c084fc",
    progressColor: "#6b21a8",
    minPxPerSec: 50,
    media: props.videoPlayerRef,
    peaks: props.peakData,
    duration: props.duration,
    barWidth: 2,
    barGap: 1,
    barRadius: 1,
    normalize: true,
  });
};

const registerWaveSurferPlugins = (ws: WaveSurfer): any => {
  ws.registerPlugin(Timeline.create());
  const wsRegions = ws.registerPlugin(RegionPlugin.create());
  ws.registerPlugin(
    ZoomPlugin.create({
      scale: 0.25,
      maxZoom: 100,
    })
  );
  return wsRegions;
};

export const setupWaveSurferEvents = (ws: WaveSurfer, wsRegions: any): void => {
  let timeSortedRegionById: { [id: string]: Region } | undefined = undefined;

  const playNextRegion = (
    region: Region,
    ws: WaveSurfer,
    timeSortedRegionById: { [id: string]: Region }
  ) => {
    if (ws.isPlaying()) {
      if (timeSortedRegionById[region.id]) {
        ws.pause();
        console.log(`Playing next region with ID: ${region.id}`);
        timeSortedRegionById[region.id].play(true);
      } else {
        console.log(
          `Pausing WaveSurfer, no next region found for ID: ${region.id}`
        );
        console.log("nextRegionMap", timeSortedRegionById);
        ws.pause();
      }
    }
  };

  const sortRegionMap = () => {
    // Check current region and get the next region to be continued playing
    // Loop through all the regions and create a map of the next region to play when the current one ends
    const regionMap: { [id: string]: Region } = {};
    const regions = wsRegions.getRegions().sort((a, b) => {
      if (a.start < b.start) {
        return -1;
      } else if (a.start > b.start) {
        return 1;
      } else {
        return 0;
      }
    });
    regions.forEach((region: Region, idx: number) => {
      regionMap[region.id] = regions[idx + 1];
    });
    return regionMap;
  };

  wsRegions.on("region-out", (region: Region) => {
    console.log("region-out", region);
    if (!timeSortedRegionById) {
      updateRegionMap();
    } else {
      playNextRegion(region, ws, timeSortedRegionById);
    }
  });

  const updateRegionMap = () => {
    timeSortedRegionById = sortRegionMap();
  };

  wsRegions.on("region-created", updateRegionMap);
  wsRegions.on("destroy", updateRegionMap);
  wsRegions.on("region-updated", updateRegionMap);
};

const handleWaveSurferEvents = (
  ws: WaveSurfer,
  wsRegions: any,
  setProgress: (progress: number) => void
): void => {
  ws.on("ready", () => {
    console.log("WaveSurfer is ready");
    setProgress(100);
  });

  ws.on("loading", (progress: number) => {
    console.log("loading", progress);
    setProgress(75 + progress * 0.25);
  });

  ws.on("decode", (duration: number) => {
    const decodedData = ws.getDecodedData();
    const config = {
      minVolume: 5,
      minDuration: 0.8,
      prePadding: 0.2,
      postPadding: 0.2,
    };
    if (decodedData) {
      const regions = extractRegions(
        decodedData.getChannelData(0),
        duration,
        config
      );
      addRegions(regions, wsRegions, config, duration);
    }
  });
};

export const initWaveSurfer = (
  wavePlayerRef: HTMLElement,
  props: Props,
  setProgress: (progress: number) => void
): void => {
  console.log("Initializing WaveSurfer...");
  const ws = createWaveSurferInstance(wavePlayerRef, props);
  console.log("WaveSurfer instance created");
  const wsRegions = registerWaveSurferPlugins(ws);
  console.log("WaveSurfer plugins registered");
  handleWaveSurferEvents(ws, wsRegions, setProgress);
  console.log("WaveSurfer events handled");
  props.setWavesurferRef(ws);
};
