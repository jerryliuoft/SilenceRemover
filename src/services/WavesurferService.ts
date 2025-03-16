import WaveSurfer from "wavesurfer.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline.js";
import RegionPlugin from "wavesurfer.js/dist/plugins/regions.js";
import ZoomPlugin from "wavesurfer.js/dist/plugins/zoom.js";
import { addRegions, extractRegions } from "./SilentHelper";
import { Setter } from "solid-js";

interface Props {
  videoPlayerRef: HTMLMediaElement;
  peakData: any;
  duration: number;
  videoName: string;
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

const handleWaveSurferEvents = (
  ws: WaveSurfer,
  wsRegions: any,
  props: Props,
  setReady: (ready: boolean) => void
): void => {
  ws.on("ready", () => {
    console.log("WaveSurfer is ready");
    setReady(true);
  });

  ws.on("loading", (progress: number) => {
    console.log("loading", progress);
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
};

export const initWaveSurfer = (
  wavePlayerRef: HTMLElement,
  props: Props,
  setReady: (ready: boolean) => void
): void => {
  const ws = createWaveSurferInstance(wavePlayerRef, props);
  const wsRegions = registerWaveSurferPlugins(ws);
  handleWaveSurferEvents(ws, wsRegions, props, setReady);
  props.setWavesurferRef(ws);
};
