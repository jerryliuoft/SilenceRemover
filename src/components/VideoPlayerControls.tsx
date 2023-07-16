import { Component, Show, createEffect, createSignal } from "solid-js";
import { useKeyDownEvent } from "@solid-primitives/keyboard";
import WaveSurfer from "wavesurfer.js";
import RegionPlugin, { Region } from "wavesurfer.js/dist/plugins/regions.js";
import { IoPauseOutline } from "solid-icons/io";
import { IoPlayOutline } from "solid-icons/io";

const VideoPlayerControls: Component<{
  videoPlayerRef: HTMLVideoElement;
  wavesurferRef: WaveSurfer;
}> = (props) => {
  const [playSpeed, setPlaySpeed] = createSignal(1);
  const [currentTime, setCurrentTime] = createSignal(0);
  const [duration, setduration] = createSignal(0);
  const [playing, setPlaying] = createSignal(false);
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
    setPlaying(props.wavesurferRef.isPlaying());
    if (duration() === 0) {
      // When Control loads, none of these values are populated yet, so populating now
      setduration(props.wavesurferRef.getDuration());
    }
  };

  props.videoPlayerRef.onclick = () => play();

  //   Get the relevant video information for the ref
  props.wavesurferRef.on("timeupdate", setCurrentTime);

  // When audio playing /paused, make sure the video syncs
  props.wavesurferRef.on("play", () => {
    props.videoPlayerRef.currentTime = props.wavesurferRef.getCurrentTime();
    props.videoPlayerRef.play();
    setPlaying(true);
  });
  props.wavesurferRef.on("pause", () => {
    props.videoPlayerRef.currentTime = props.wavesurferRef.getCurrentTime();
    props.videoPlayerRef.pause();
    setPlaying(false);
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
    <div class="text-center mb-3">
      <div class=" text-slate-500 dark:bg-slate-600 dark:text-slate-200 rounded-b-xl flex items-center">
        <div class="flex-auto flex flex-row-reverse">
          <div class="mr-6 w-28">
            {formatTime(currentTime())}/{formatTime(duration())}
          </div>
        </div>
        <button
          type="button"
          onClick={() => props.wavesurferRef.playPause()}
          class="bg-white text-slate-900 dark:bg-slate-100 dark:text-slate-700 flex-none -my-2 mx-auto w-20 h-20 rounded-full ring-1 ring-slate-900/5 shadow-md flex items-center justify-center"
          aria-label="Pause"
        >
          <Show
            when={playing()}
            fallback={<IoPlayOutline class="ml-2" size={42} />}
          >
            <IoPauseOutline size={42} />
          </Show>
        </button>
        <div class="flex-auto flex items-center">
          <button
            type="button"
            onClick={() => {
              setPlaySpeed(playSpeed() + 0.25 > 2 ? 1 : playSpeed() + 0.25);
              props.videoPlayerRef!.playbackRate = playSpeed();
              props.wavesurferRef.setPlaybackRate(playSpeed());
            }}
            class="ml-10 w-10 rounded-lg text-xs leading-6 font-semibold px-2 ring-2 ring-inset ring-slate-500 text-slate-500 dark:text-slate-100 dark:ring-0 dark:bg-slate-500"
          >
            {playSpeed()}x
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerControls;
