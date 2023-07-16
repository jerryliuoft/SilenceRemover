import { Component, Show, createEffect, createSignal } from "solid-js";
import { FFmpeg, createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg"; // https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/docs/api.md
import WaveSurfer from "wavesurfer.js";
import RegionPlugin, { Region } from "wavesurfer.js/dist/plugins/regions.js";

const VideoRender: Component<{
  video: File;
  wavesurferRef: WaveSurfer;
}> = (props) => {
  let ffmpeg: FFmpeg;
  const [message, setMessage] = createSignal("");
  const [progress, setProgress] = createSignal(0);
  const [download, setDownload] = createSignal<string>("");

  //Loading in ffmpeg when this component renders
  createEffect(() => {
    ffmpeg = createFFmpeg({
      log: true,
    });
    ffmpeg.setLogger(({ type, message }) => {
      if (type !== "info") {
        setMessage(message);
      }
    });
    ffmpeg.setProgress(({ ratio }) => {
      if (ratio >= 0 && ratio <= 1) {
        setProgress(ratio * 100);
      }
      if (ratio === 1) {
        setTimeout(() => {
          setProgress(0);
        }, 1000);
      }
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
    <>
      <Show when={message()}>
        <p class="font-medium text-slate-700 mt-4 h-32 m-2">{message()}</p>
        <Show
          when={download()}
          fallback={
            <p class="text-center text-slate-700 font-bold">
              {Math.floor(progress())}%
            </p>
          }
        >
          <a class="text-center text-slate-700 font-bold" href={download()}>
            Righ click to save the video
          </a>
        </Show>
      </Show>
      <button
        class="btn bg-red-100 hover:bg-red-500 hover:text-white m-2 "
        onClick={work}
      >
        Render video
      </button>
    </>
  );
};

export default VideoRender;
