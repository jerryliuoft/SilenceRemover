import { Component, Show, createEffect, createSignal } from "solid-js";
import { FFmpeg } from "@ffmpeg/ffmpeg"; // https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/docs/api.md
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import WaveSurfer from "wavesurfer.js";
import RegionPlugin, { Region } from "wavesurfer.js/dist/plugins/regions.js";
import { timelineExport } from "./TimelineExport";
import Dialog from "../common/Dialog";

const VideoRender: Component<{
  video: File | undefined;
  wavesurferRef: WaveSurfer;
}> = (props) => {
  let ffmpeg: FFmpeg;
  const [message, setMessage] = createSignal("");
  const [progress, setProgress] = createSignal(0);
  const [download, setDownload] = createSignal<string>("");
  const [videoMeta, setVideoMeta] = createSignal<{
    frame: number;
    width: number;
    height: number;
  }>();
  const [isDialogOpen, setIsDialogOpen] = createSignal(false);

  // Loading ffmpeg
  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";
    // const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";

    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
      // workerURL: await toBlobURL(
      //   `${baseURL}/ffmpeg-core.worker.js`,
      //   "text/javascript"
      // ),
    });
    console.log("ffmpeg is loaded");
    console.log({ crossOriginIsolated });
  };

  //Loading in ffmpeg when this component renders
  createEffect(() => {
    ffmpeg = new FFmpeg();
    ffmpeg.on("log", ({ type, message }) => {
      console.log({ type, message });

      if (type !== "info") {
        setMessage(message);
      }
      // >    Stream #0:0(und): Video: h264 (Main) (avc1 / 0x31637661)', ' yuv420p', ' 1920x1080 [SAR 1:1 DAR 16:9]', ' 10092 kb/s', ' 30.03 fps', ' 59.94 tbr', ' 30k tbn', ' 59.94 tbc (default)'
      if (message.includes("fps") && message.includes("kb/s")) {
        const frame = message.match(/\s([\d\.]+)\sfps/)[1];
        const resolution = message.match(/\s(\d\d+)x(\d\d+)[\s\,]/);
        setVideoMeta({
          frame: Number(frame),
          width: Number(resolution[1]),
          height: Number(resolution[2]),
        });
      }
    });
    ffmpeg.on("progress", (ffmpegProgress) => {
      const ratio = ffmpegProgress.progress;
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

  const createXml = async () => {
    const wsRegions = props.wavesurferRef.getActivePlugins()[1] as RegionPlugin;
    const regions = wsRegions.getRegions();

    if (!ffmpeg.loaded) {
      await load();
    }
    await ffmpeg.writeFile("video.mp4", await fetchFile(props.video));
    await ffmpeg.exec(["-i", "video.mp4"]);
    // The fetch of videoMeta is done in ffmpeg callback
    const blob = timelineExport(
      regions,
      videoMeta()?.frame,
      props.wavesurferRef.getDuration(),
      videoMeta()?.width,
      videoMeta()?.height,
      props.video.name
    );

    const xml = URL.createObjectURL(blob);
    setDownload(xml);
    setIsDialogOpen(true);
    return;
  };

  const renderVideo = async () => {
    const wsRegions = props.wavesurferRef.getActivePlugins()[1] as RegionPlugin;
    const regions = wsRegions.getRegions();

    if (!ffmpeg.loaded) {
      await load();
    }
    const regionCmd = regionToCommand(regions);
    await ffmpeg.writeFile("video.mp4", await fetchFile(props.video));

    await ffmpeg.exec([
      "-i",
      "video.mp4",
      // "-threads", // -threads 4 is to solve chrome not able to auto detect threads and hangs on mt.
      // "4",
      "-vf",
      "select='" + regionCmd + "',setpts=N/FRAME_RATE/TB",
      "-af",
      "aselect='" + regionCmd + "',asetpts=N/SR/TB",
      "out.mp4",
    ]);

    const data = (await ffmpeg.readFile("out.mp4")) as any;
    const dataBlob = new Blob([data.buffer], { type: "video/mp4" });
    const sound = URL.createObjectURL(dataBlob);
    setDownload(sound);
    setIsDialogOpen(true);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <Show when={message()}>
        <p class="font-medium text-slate-700 mt-4 h-32 m-2">{message()}</p>
        <p class="text-center text-slate-700 font-bold">
          {Math.floor(progress())}%
        </p>
      </Show>
      <button
        class="rounded-lg font-semibold py-2 px-4  shadow-lg bg-lime-100 hover:bg-lime-500 hover:text-white m-2 "
        onClick={renderVideo}
      >
        Export video
      </button>
      <button
        class="rounded-lg font-semibold py-2 px-4 shadow-lg bg-lime-100 hover:bg-lime-500 hover:text-white m-2 "
        onClick={createXml}
      >
        Export timeline xml
      </button>
      <Dialog
        title="Your download is ready!"
        description="Refresh the browser to select a new video or close this message to make additional changes. If you like this, why not share it with a friend?"
        isOpen={isDialogOpen()}
        onCancel={handleCancel}
      >
        <a
          type="button"
          href={download()}
          download
          class="inline-flex w-full justify-center rounded-md bg-lime-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-lime-400 sm:ml-3 sm:w-auto"
        >
          Download
        </a>
      </Dialog>
    </>
  );
};

export default VideoRender;
