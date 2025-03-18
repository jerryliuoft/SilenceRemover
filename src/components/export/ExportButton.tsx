import { Component, Show, createEffect, createSignal } from "solid-js";
import { FFmpeg } from "@ffmpeg/ffmpeg"; // https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/docs/api.md
import WaveSurfer from "wavesurfer.js";
import DialogBase from "../common/Dialog/DialogBase";
import {
  renderVideo,
  createXml,
  initializeFFmpeg,
} from "../../services/FFMPEGService";

const ExportButton: Component<{
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
  const [isExportDialogOpen, setIsExportDialogOpen] = createSignal(false);

  //Loading in ffmpeg when this component renders
  createEffect(() => {
    ffmpeg = new FFmpeg();
    initializeFFmpeg(ffmpeg, setMessage, setVideoMeta, setProgress);
  });

  const handleExport = (type: "video" | "xml") => {
    setMessage("Exporting...");
    setProgress(0);
    if (type === "video") {
      renderVideo(ffmpeg, props.video, props.wavesurferRef, setDownload);
    } else {
      createXml(
        ffmpeg,
        props.video,
        props.wavesurferRef,
        videoMeta,
        setDownload
      );
    }
  };

  return (
    <div class="flex items-center space-x-2">
      <button
        class="rounded-lg font-semibold py-2 px-10 shadow-lg bg-lime-100 hover:bg-lime-500 hover:text-white"
        onClick={() => setIsExportDialogOpen(true)}
      >
        Export
      </button>
      <DialogBase
        isOpen={isExportDialogOpen()}
        onCancel={() => setIsExportDialogOpen(false)}
      >
        <h2 class="text-xl font-semibold text-center mb-4">Export</h2>
        <div class="space-y-4">
          <Show when={!message() && !download()}>
            <div>
              <p class="text-sm text-gray-700 mb-2">
                Export the video file with the applied changes.
              </p>
              <button
                class="w-full rounded-lg font-semibold py-2 px-4 shadow-lg bg-lime-100 hover:bg-lime-500 hover:text-white"
                onClick={() => handleExport("video")}
              >
                Export Mp4
              </button>
            </div>
            <div>
              <p class="text-sm text-gray-700 mb-2">
                Export as XML for video editors like DaVinci Resolve and Adobe
                Premiere.
              </p>
              <button
                class="w-full rounded-lg font-semibold py-2 px-4 shadow-lg bg-lime-100 hover:bg-lime-500 hover:text-white"
                onClick={() => handleExport("xml")}
              >
                Export XML
              </button>
            </div>
          </Show>
          <Show when={message() && !download()}>
            <p class="font-medium text-slate-700 mt-4 h-32 m-2">{message()}</p>
            <p class="text-center text-slate-700 font-bold">
              {Math.floor(progress())}%
            </p>
          </Show>
          <Show when={download()}>
            <h2 class="text-center text-xl font-semibold text-slate-700">
              Thank you for waiting, your download is ready!
            </h2>
            <div class="flex justify-center">
              <a
                type="button"
                href={download()}
                download
                class="w-full h-48 rounded-lg font-semibold py-2 px-4 shadow-lg bg-lime-600 text-white text-center hover:bg-lime-400 flex items-center justify-center"
              >
                Download
              </a>
            </div>
          </Show>
        </div>
      </DialogBase>
    </div>
  );
};

export default ExportButton;
