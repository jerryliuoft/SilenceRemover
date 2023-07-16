import { Component, Show, createEffect, createSignal } from "solid-js";
import { FFmpeg, createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg"; // https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/docs/api.md
import WaveSurfer from "wavesurfer.js";
import RegionPlugin from "wavesurfer.js/dist/plugins/regions.js";

const VideoRender: Component<{
  video: File;
  wavesurferRef: WaveSurfer;
}> = (props) => {
  let ffmpeg: FFmpeg;
  const [download, setDownload] = createSignal<string>("");

  //Loading in ffmpeg when this component renders
  createEffect(() => {
    ffmpeg = createFFmpeg({
      log: true,
    });
  });

  const regionToCommand = (regions: Region[]) => {
    const cmd = regions.map((reg) => {
      return `between(t,${reg.start},${reg.end})`;
    });
    return cmd.join("+");
  };

  const work = async () => {
    const wsRegions = props.wavesurferRef.getActivePlugins()[1] as RegionPlugin;
    const regions = wsRegions.getRegions();

    await ffmpeg.load();
    ffmpeg.FS("writeFile", "video.mp4", await fetchFile(props.video));

    const regionCmd = regionToCommand(regions);

    await ffmpeg.run(
      "-i",
      "video.mp4",
      "-vf",
      "select='" + regionCmd + "',setpts=N/FRAME_RATE/TB",
      "-af",
      "aselect='" + regionCmd + "',asetpts=N/SR/TB",
      "out.mp4"
    );

    const data = ffmpeg.FS("readFile", "out.mp4");
    const dataBlob = new Blob([data.buffer], { type: "video/mp4" });
    const sound = URL.createObjectURL(dataBlob);
    setDownload(sound);
  };

  return (
    <div>
      <button class="btn" onClick={work}>
        render video
      </button>
      <Show when={download()}>
        <a href={download()}>click me to download</a>
      </Show>
      <div class="space-y-2">
        <div class="relative">
          <div class="bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              class="bg-cyan-500 dark:bg-cyan-400 w-1/2 h-2"
              role="progressbar"
              aria-label="music progress"
              aria-valuenow="1456"
              aria-valuemin="0"
              aria-valuemax="4550"
            ></div>
          </div>
          <div class="ring-cyan-500 dark:ring-cyan-400 ring-2 absolute left-1/2 top-1/2 w-4 h-4 -mt-2 -ml-2 flex items-center justify-center bg-white rounded-full shadow">
            <div class="w-1.5 h-1.5 bg-cyan-500 dark:bg-cyan-400 rounded-full ring-1 ring-inset ring-slate-900/5"></div>
          </div>
        </div>
        <div class="flex justify-between text-sm leading-6 font-medium tabular-nums">
          <div class="text-cyan-500 dark:text-slate-100">24:16</div>
          <div class="text-slate-500 dark:text-slate-400">75:50</div>
        </div>
      </div>
    </div>
  );
};

export default VideoRender;
