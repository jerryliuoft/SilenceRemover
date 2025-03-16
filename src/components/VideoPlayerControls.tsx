import { Component, Show, createEffect, createSignal } from "solid-js";
import { useKeyDownEvent } from "@solid-primitives/keyboard";
import WaveSurfer from "wavesurfer.js";
import RegionPlugin, { Region } from "wavesurfer.js/dist/plugins/regions.js";
import { IoPauseOutline } from "solid-icons/io";
import { IoPlayOutline } from "solid-icons/io";
import { formatTime } from "../services/SilentHelper";

const VideoPlayerControls: Component<{
  videoPlayerRef: HTMLVideoElement;
  wavesurferRef: WaveSurfer;
  videoName: string;
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

  const wsRegions = props.wavesurferRef.getActivePlugins()[1] as RegionPlugin;
  const createRegionMap = () => {
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
    setNextRegionMap(regionMap);
  };

  // Save it to disk to be restored when user refreshes page
  createEffect(() => {
    if (!nextRegionMap() || props.videoName.length < 1) {
      return;
    }
    localStorage.setItem(
      "zones",
      JSON.stringify({
        file: props.videoName,
        region: wsRegions.getRegions(),
      })
    );
  });

  const regionOutCB = (region: Region) => {
    const map = nextRegionMap();
    if (!map) {
      createRegionMap();
      return;
    }
    if (props.wavesurferRef.isPlaying()) {
      if (map[region.id]) {
        map[region.id].play();
      } else {
        props.wavesurferRef.pause();
      }
    }
  };
  wsRegions.on("region-out", regionOutCB);
  wsRegions.on("region-created", createRegionMap);
  wsRegions.on("destroy", createRegionMap);
  wsRegions.on("region-updated", createRegionMap);

  const removeRegion = (region: Region) => {
    region.remove();
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
            wsRegions.addRegion({
              start: currentTime() - 0.4,
              end: currentTime() + 0.4,
              drag: true,
              resize: true,
              color: "rgba(236, 252, 203, 0.5)",
            });
          }}
          class="rounded-lg text-xs leading-6 font-semibold px-2 ring-2 ring-inset ring-slate-500 text-slate-500 hover:bg-slate-800 hover:text-slate-50 mr-10"
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
            class="rounded-lg text-xs leading-6 font-semibold px-2 ring-2 ring-inset ring-slate-500 text-slate-500 hover:bg-slate-800 hover:text-slate-50 ml-10 w-10 "
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
                  wsRegions.on("region-clicked", removeRegion);
                } else {
                  wsRegions.un("region-clicked", removeRegion);
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
