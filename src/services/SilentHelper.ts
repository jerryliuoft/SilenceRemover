import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
import { Region } from "../components/SoundPlayer";
import WaveSurfer from "wavesurfer.js";

export interface SilentConfig {
  minVolume: number;
  minDuration: number;
  prePadding: number;
  postPadding: number;
}

export const analyzeRegions = (ws: WaveSurfer, configs: SilentConfig) => {
  const wsRegions = ws.getActivePlugins()[1] as RegionsPlugin;
  const decodedData = ws.getDecodedData();
  if (decodedData) {
    const regions = extractRegions(
      decodedData.getChannelData(0),
      ws.getDuration(),
      configs
    );

    wsRegions.clearRegions();
    return addRegions(regions, wsRegions, configs, ws.getDuration());
  }
  return 0;
};

// Add regions to the waveform
export const addRegions = (
  regions: Region[],
  wsRegions: RegionsPlugin,
  configs: SilentConfig,
  duration: number
) => {
  let length = 0;
  regions.forEach((region: Region) => {
    const paddedStart = region.start - configs.prePadding;
    const paddedEnd = region.end + configs.postPadding;
    const start = paddedStart < 0 ? 0 : paddedStart;
    const end = paddedEnd > duration ? duration : paddedEnd;
    length += end - start;
    wsRegions.addRegion({
      start,
      end,
      drag: false,
      resize: true,
      color: "rgba(236, 252, 203, 0.5)",
    });
  });
  return length;
};

// Find regions separated by silence
export const extractRegions = (
  audioData: Float32Array,
  duration: number,
  configs: SilentConfig
) => {
  const minVolumePercent = configs.minVolume; // 5
  const mergeDuration =
    configs.postPadding + configs.prePadding > 0.6
      ? configs.postPadding + configs.prePadding
      : 0.6;
  const minRegionLength = configs.minDuration; //0.8;
  const scale = duration / audioData.length;

  // Find high and lowest volume to calculate the threshold to filter on
  let high = 0;
  audioData.forEach((adata) => {
    if (adata > high) {
      high = adata;
    }
  });
  const minVolume = high * (minVolumePercent / 100);
  const audibleRegions = findAllAudibleRegions(
    audioData,
    minVolume,
    scale,
    mergeDuration
  );

  // remove regions that are too short
  const filteredRegions: Region[] = [];
  audibleRegions.forEach((region) => {
    if (region.end - region.start > minRegionLength) {
      filteredRegions.push(region);
    }
  });
  return filteredRegions;
};

const findAllAudibleRegions = (
  audioData: Float32Array,
  minVolume: number,
  scale: number,
  mergeDuration: number
) => {
  const audibleRegions: Region[] = [];
  // Find all regions with sound above threshold
  let start = 0;
  let end = 0;

  // Find all audible regions
  for (let i = 1; i < audioData.length; i++) {
    if (audioData[i] > minVolume) {
      // Above threshold
      if (audioData[i - 1] < minVolume) {
        start = i;
      } else {
        // do nothing same sound level as before
      }
    } else {
      // Below threshold
      if (audioData[i - 1] < minVolume) {
        // do nothing same sound level as before
      } else {
        end = i;
        const lastRegion = audibleRegions[audibleRegions.length - 1];
        // merge with last region if the time between them is too short
        if (lastRegion && start * scale - lastRegion.end < mergeDuration) {
          //update last region instead of adding a new one
          lastRegion.end = scale * end;
        } else {
          audibleRegions.push({
            start: scale * start,
            end: scale * end,
          });
        }
      }
    }
  }

  // Check if there's a region need to be added at the end
  const lastRegion = audibleRegions[audibleRegions.length - 1];
  if (start * scale > lastRegion.end) {
    if (start * scale - lastRegion.end < mergeDuration) {
      lastRegion.end = scale * end;
    } else {
      audibleRegions.push({
        start: scale * start,
        end: scale * end,
      });
    }
  }

  return audibleRegions;
};

export const formatTime = (time: number) => {
  const formatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
  });
  const miliSeconds = Math.floor((time % 1) * 100);
  const seconds = Math.floor(time % 60);
  const minutes = Math.floor(time / 60) % 60;
  const hours = Math.floor(time / 3600);

  if (hours === 0) {
    return `${minutes}:${formatter.format(seconds)}:${miliSeconds}`;
  } else {
    return `${hours}:${formatter.format(minutes)}:${formatter.format(
      seconds
    )}${miliSeconds}`;
  }
};
