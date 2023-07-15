import { Component, Show, createEffect, createSignal } from "solid-js";
import { FFmpeg, createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg"; // https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/docs/api.md
import { Region } from "./SoundPlayer";
import WaveSurfer from "wavesurfer.js";
import RegionPlugin from "wavesurfer.js/dist/plugins/regions.js";

const VideoRender: Component<{
  regions: Region[];
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
    </div>
  );
};

export default VideoRender;
