import { Component, Setter, Show, createEffect, createSignal } from "solid-js";
import { FFmpeg, createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg"; // https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/docs/api.md
import WaveSurfer from "wavesurfer.js";
import RegionPlugin, { Region } from "wavesurfer.js/dist/plugins/regions.js";

const VideoRender: Component<{
  video: File;
  wavesurferRef: WaveSurfer;
  setDownload: Setter<string>;
}> = (props) => {
  let ffmpeg: FFmpeg;

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
    props.setDownload(sound);
  };
  return (
    <button class="btn bg-red-100 hover:bg-red-300 m-2" onClick={work}>
      Render video
    </button>
  );
};

export default VideoRender;
