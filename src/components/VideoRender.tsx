import { Component, Show, createEffect, createSignal } from "solid-js";
import { FFmpeg, createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg"; // https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/docs/api.md
import WaveSurfer from "wavesurfer.js";
import RegionPlugin, { Region } from "wavesurfer.js/dist/plugins/regions.js";
import { timelineExport } from "./TimelineExport";

const VideoRender: Component<{
  video: File;
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

  //Loading in ffmpeg when this component renders
  createEffect(() => {
    ffmpeg = createFFmpeg({
      log: true,
    });
    ffmpeg.setLogger(({ type, message }) => {
      // >    Stream #0:0(und): Video: h264 (Main) (avc1 / 0x31637661)', ' yuv420p', ' 1920x1080 [SAR 1:1 DAR 16:9]', ' 10092 kb/s', ' 30.03 fps', ' 59.94 tbr', ' 30k tbn', ' 59.94 tbc (default)'
      if (message.includes("fps") && message.includes("kb/s")) {
        const frame = message.match(/(\d+\.\d+)\sfps/)[1];
        const resolution = message.match(/\s(\d\d+x\d\d+)\s\[/)[1].split("x");
        setVideoMeta({
          frame: Number(frame),
          width: Number(resolution[0]),
          height: Number(resolution[1]),
        });
      }

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

  const createXml = async () => {
    const wsRegions = props.wavesurferRef.getActivePlugins()[1] as RegionPlugin;
    const regions = wsRegions.getRegions();

    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }
    ffmpeg.FS("writeFile", "video.mp4", await fetchFile(props.video));
    await ffmpeg.run("-i", "video.mp4");
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
    return;
  };

  const renderVideo = async () => {
    const wsRegions = props.wavesurferRef.getActivePlugins()[1] as RegionPlugin;
    const regions = wsRegions.getRegions();

    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }
    const regionCmd = regionToCommand(regions);
    ffmpeg.FS("writeFile", "video.mp4", await fetchFile(props.video));

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
        <p class="text-center text-slate-700 font-bold">
          {Math.floor(progress())}%
        </p>
      </Show>
      <button
        class="btn bg-lime-100 hover:bg-lime-500 hover:text-white m-2 "
        onClick={renderVideo}
      >
        Export video
      </button>
      <button
        class="btn bg-lime-100 hover:bg-lime-500 hover:text-white m-2 "
        onClick={createXml}
      >
        Export timeline xml
      </button>
      <Show when={download()}>
        <div
          class="ransition-opacity relative z-10"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

          <div class="fixed inset-0 z-10 overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div class="sm:flex sm:items-start">
                    <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <h3
                        class="text-base font-semibold leading-6 text-gray-900"
                        id="modal-title"
                      >
                        Your video is ready!
                      </h3>
                      <div class="mt-2">
                        <p class="text-sm text-gray-500">
                          {
                            "Refresh the browser to select a new video or close this message to make additional changes. If you like this, why not share it to a friend?"
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <a
                    type="button"
                    class="transition-opacity delay-100 inline-flex w-full justify-center rounded-md bg-lime-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-lime-600 sm:ml-3 sm:w-auto"
                    href={download()}
                    download
                  >
                    Download
                  </a>
                  <button
                    type="button"
                    class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setDownload("")}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
};

export default VideoRender;
