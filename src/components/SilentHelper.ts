import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
import { Region } from "./SoundPlayer";
import WaveSurfer from "wavesurfer.js";

export interface SilentConfig {
  minVolume?: number;
  prePadding?: number;
  postPadding?: number;
}

export const analyzeRegions = (ws: WaveSurfer, configs: SilentConfig) => {
  const wsRegions = ws.getActivePlugins()[1] as RegionsPlugin;
  const decodedData = ws.getDecodedData();
  if (decodedData) {
    const regions = extractRegions(
      decodedData.getChannelData(0),
      ws.getDuration(),
      configs.minVolume
    );
    wsRegions.clearRegions();
    addRegions(regions, wsRegions);
  }
};

// Add regions to the waveform
export const addRegions = (regions: Region[], wsRegions: RegionsPlugin) => {
  regions.forEach((region: Region) => {
    wsRegions.addRegion({
      start: region.start - 0.2 < 0 ? 0 : region.start - 0.2,
      end: region.end + 0.2,
      drag: false,
      resize: true,
      color: "rgba(252, 231, 243, 0.5)",
    });
  });
};

// Find regions separated by silence
export const extractRegions = (
  audioData: Float32Array,
  duration: number,
  minVolumePercent: number = 5
) => {
  const mergeDuration = 0.6;
  const minRegionLength = 0.8;
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
