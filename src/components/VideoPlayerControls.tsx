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
  let addRef: HTMLInputElement;

  const event = useKeyDownEvent();
  // Keyboard Controls
  createEffect(() => {
    const e = event();
    if (e) {
      if (e.key == " ") {
        play();
        e.preventDefault(); // prevent default behavior or last keydown event
      }
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
    // TODO this is highly inefficient, should move it out and calculate else where
    createRegionMap();
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

  const regionOutCB = (region: Region) => {
    const map = nextRegionMap();
    if (!map) {
      createRegionMap();
      return;
    }
    if (map[region.id]) {
      map[region.id].play();
    }
  };
  wsRegions.on("region-out", regionOutCB);

  const regionClickCB = (region: Region) => {
    region.remove();
  };

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
          onClick={() => {
            console.log(currentTime());
            wsRegions.addRegion({
              start: currentTime() - 0.4,
              end: currentTime() + 0.4,
              drag: true,
              resize: true,
              color: "rgba(252, 231, 243, 0.5)",
            });
          }}
          class="pill-btn mr-10"
        >
          Zone add
        </button>
        <button
          type="button"
          onClick={play}
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
            class="pill-btn ml-10 w-10 "
          >
            {playSpeed()}x
          </button>
          <label class="relative inline-flex items-center ml-10 cursor-pointer">
            <input
              type="checkbox"
              class="sr-only peer"
              onClick={(e) => {
                const checked = (e.target as HTMLInputElement).checked;
                const wsRegions =
                  props.wavesurferRef.getActivePlugins()[1] as RegionPlugin;
                if (checked) {
                  wsRegions.on("region-clicked", regionClickCB);
                } else {
                  wsRegions.un("region-clicked", regionClickCB);
                }
              }}
            ></input>
            <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span class="ml-3 text-xs font-semibold text-slate-500">
              Zone delete
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerControls;
