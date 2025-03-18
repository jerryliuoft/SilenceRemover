import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import RegionPlugin, { Region } from "wavesurfer.js/dist/plugins/regions.js";
import { timelineExport } from "../components/export/TimelineExport";

export const loadFFmpeg = async (ffmpeg: FFmpeg) => {
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });
};

export const regionToCommand = (regions: Region[]) => {
  const cmd = regions.map((reg) => {
    return `between(t,${reg.start},${reg.end})`;
  });
  return cmd.join("+");
};

export const initializeFFmpeg = (
  ffmpeg: FFmpeg,
  setMessage: (message: string) => void,
  setVideoMeta: (meta: {
    frame: number;
    width: number;
    height: number;
  }) => void,
  setProgress: (progress: number) => void
) => {
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
};

export const renderVideo = async (
  ffmpeg: FFmpeg,
  video: File,
  wavesurferRef: WaveSurfer,
  setDownload: (url: string) => void
) => {
  const wsRegions = wavesurferRef.getActivePlugins()[1] as RegionPlugin;
  const regions = wsRegions.getRegions();

  if (!ffmpeg.loaded) {
    await loadFFmpeg(ffmpeg);
  }
  const regionCmd = regionToCommand(regions);
  await ffmpeg.writeFile("video.mp4", await fetchFile(video));

  await ffmpeg.exec([
    "-i",
    "video.mp4",
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
};

export const createXml = async (
  ffmpeg: FFmpeg,
  video: File,
  wavesurferRef: WaveSurfer,
  videoMeta: () => { frame: number; width: number; height: number },
  setDownload: (url: string) => void
) => {
  const wsRegions = wavesurferRef.getActivePlugins()[1] as RegionPlugin;
  const regions = wsRegions.getRegions();

  if (!ffmpeg.loaded) {
    await loadFFmpeg(ffmpeg);
  }
  await ffmpeg.writeFile("video.mp4", await fetchFile(video));
  await ffmpeg.exec(["-i", "video.mp4"]);
  // The fetch of videoMeta is done in ffmpeg callback
  const blob = timelineExport(
    regions,
    videoMeta().frame,
    wavesurferRef.getDuration(),
    videoMeta().width,
    videoMeta().height,
    video.name
  );

  const xml = URL.createObjectURL(blob);
  setDownload(xml);
};
