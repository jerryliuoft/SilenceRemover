import { Component, Setter } from "solid-js";
import WaveSurfer from "wavesurfer.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline.js";
import RegionPlugin from "wavesurfer.js/dist/plugins/regions.js";

export interface Region {
  start: number;
  end: number;
}

const SoundPlayer: Component<{
  //   videoPlayerRef: HTMLVideoElement;
  videoUrl: string;
  setWavesurferRef: Setter<WaveSurfer>;
  setRegions: Setter<Region[]>;
}> = (props) => {
  const initWaveSurfer = (wavePlayerRef: HTMLElement) => {
    const ws = WaveSurfer.create({
      container: wavePlayerRef!,
      waveColor: "rgb(200, 0, 200)",
      progressColor: "rgb(100, 0, 100)",
      // Pass the video element in the `media` param
      //   media: props.videoPlayerRef,
      minPxPerSec: 50,
      url: props.videoUrl,
    });
    // Initialize the Timeline plugin
    ws.registerPlugin(Timeline.create());
    const wsRegions = ws.registerPlugin(RegionPlugin.create());

    ws.on("ready", () => {
      console.log("READY!");
    });

    // Create regions for each non-silent part of the audio
    ws.on("decode", (duration) => {
      const decodedData = ws.getDecodedData();
      if (decodedData) {
        const regions = extractRegions(decodedData.getChannelData(0), duration);
        props.setRegions(regions); // Send it back up to be proccessed by ffmpeg if finalized

        // Add regions to the waveform
        regions.forEach((region: Region, index) => {
          wsRegions.addRegion({
            start: region.start,
            end: region.end,
            content: index.toString(),
            drag: false,
            resize: false,
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

  return <div ref={initWaveSurfer}></div>;
};

export default SoundPlayer;
