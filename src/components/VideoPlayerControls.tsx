import { Component, createEffect, createSignal } from "solid-js";
import { useKeyDownEvent } from "@solid-primitives/keyboard";
import WaveSurfer from "wavesurfer.js";
import RegionPlugin, { Region } from "wavesurfer.js/dist/plugins/regions.js";

const VideoPlayerControls: Component<{
  videoPlayerRef: HTMLVideoElement;
  wavesurferRef: WaveSurfer;
}> = (props) => {
  const [playSpeed, setPlaySpeed] = createSignal(1);
  const [currentTime, setCurrentTime] = createSignal(0);
  const [nextRegionMap, setNextRegionMap] = createSignal<{
    [id: string]: Region;
  }>();

  const event = useKeyDownEvent();
  // Keyboard Controls
  createEffect(() => {
    const e = event();
    if (e) {
      if (e.key == " ") {
        play();
      }
      e.preventDefault(); // prevent default behavior or last keydown event
    }
  });

  const play = () => {
    props.wavesurferRef.playPause();
  };

  props.videoPlayerRef.onclick = () => play();

  //   Get the relevant video information for the ref
  props.wavesurferRef.on("timeupdate", setCurrentTime);

  // When audio playing /paused, make sure the video syncs
  props.wavesurferRef.on("play", () => {
    props.videoPlayerRef.currentTime = props.wavesurferRef.getCurrentTime();
    props.videoPlayerRef.play();
  });
  props.wavesurferRef.on("pause", () => {
    props.videoPlayerRef.currentTime = props.wavesurferRef.getCurrentTime();
    props.videoPlayerRef.pause();
  });
  props.wavesurferRef.on("seeking", () => {
    props.videoPlayerRef.currentTime = props.wavesurferRef.getCurrentTime();
  });

  const wsRegions = props.wavesurferRef.getActivePlugins()[1] as RegionPlugin;
  const createRegionMap = () => {
    // Check current region and get the next region to be continued playing
    // Loop through all the regions and create a map of the next region to play when the current one ends
    const regionMap: { [id: string]: Region } = {};
    const regions = wsRegions.getRegions();
    regions.forEach((region: Region, idx: number) => {
      regionMap[region.id] = regions[idx + 1];
    });
    setNextRegionMap(regionMap);
  };

  wsRegions.on("region-out", (region: Region) => {
    const map = nextRegionMap();
    if (!map) {
      createRegionMap();
      return;
    }
    map[region.id].play();
  });

  const formatTime = (time: number) => {
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

  return (
    <div class="text-center">
      <button class="btn" onClick={() => props.wavesurferRef.playPause()}>
        {nextRegionMap() ? "Play" : "Play, (loading in the background)"}
      </button>
      <button
        class="btn"
        onClick={() => {
          setPlaySpeed(playSpeed() + 0.25 > 2 ? 1 : playSpeed() + 0.25);
          props.videoPlayerRef!.playbackRate = playSpeed();
        }}
      >
        {playSpeed()}x
      </button>
      <div>
        {formatTime(currentTime())}/
        {formatTime(props.wavesurferRef.getDuration())}
      </div>
    </div>
  );
};

export default VideoPlayerControls;
