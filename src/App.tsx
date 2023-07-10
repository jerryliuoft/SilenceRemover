import { createSignal, type Component, createEffect, Show } from "solid-js";
import Uploader from "./components/Uploader";
import VideoPlayer from "./components/VideoEditor";
import { FFmpeg, createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg"; // https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/docs/api.md
import WaveSurfer from "wavesurfer.js";
import { Region } from "./components/SoundPlayer";

const App: Component = () => {
  const [video, setVideo] = createSignal<File>();
  const [region, setRegion] = createSignal<Region[]>([]);
  const [download, setDownload] = createSignal<string>("");

  const videoUrl = () => {
    const videoRef = video();
    return videoRef ? URL.createObjectURL(videoRef) : "";
  };

  let ffmpeg: FFmpeg;

  //Loading in ffmpeg when this component renders
  createEffect(() => {
    ffmpeg = createFFmpeg({
      log: true,
    });
  });

  const regionToCommand = (regions: Region[]) => {
    // return `between(t,${regions[0].start},${regions[0].end})`;

    const cmd = regions.map((reg) => {
      return `between(t,${reg.start},${reg.end})`;
    });
    return cmd.join("+");
  };

  const work = async () => {
    if (!videoUrl()) return;

    await ffmpeg.load();
    ffmpeg.FS("writeFile", "video.mp4", await fetchFile(video()));

    const regionCmd = regionToCommand(region());

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
    console.log({ sound, data: data.buffer, dataBlob });
  };

  return (
    <div>
      <header class="bg-white shadow">
        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">
            Free silence remover
          </h1>
        </div>
      </header>
      <main>
        <Show
          when={videoUrl()}
          fallback={
            <div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
              <Uploader setVideo={setVideo} />
            </div>
          }
        >
          <VideoPlayer
            videoUrl={videoUrl()}
            setRegions={setRegion}
          ></VideoPlayer>
        </Show>
        <button class="btn" onClick={work}>
          work
        </button>
        <Show when={download()}>
          <a href={download()}>click me to download</a>
        </Show>
      </main>
    </div>
  );
};

export default App;
