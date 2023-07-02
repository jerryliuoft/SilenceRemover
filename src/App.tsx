import { createSignal, type Component, createEffect, Show } from "solid-js";
import Uploader from "./components/Uploader";
import VideoPlayer from "./components/VideoPlayer";
import { FFmpeg, createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg"; // https://github.com/ffmpegwasm/ffmpeg.wasm/blob/master/docs/api.md
import WaveSurfer from "wavesurfer.js";

const App: Component = () => {
  const [video, setVideo] = createSignal<File>();
  const [videoReady, setVideoReady] = createSignal(false);

  const videoUrl = () => {
    const videoRef = video();
    return videoRef ? URL.createObjectURL(videoRef) : "";
  };

  createEffect(() => console.log("The latest VideoURL is", videoUrl()));
  let ffmpeg: FFmpeg;

  const load = async () => {
    try {
      await ffmpeg.load();
      console.log("LOADED ffmepg");
      setVideoReady(true);
    } catch (error) {
      console.log(error);
    }
  };

  //Loading in ffmpeg when this component renders
  createEffect(() => {
    ffmpeg = createFFmpeg({
      log: true,
      corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
    });
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const work = async () => {
    ffmpeg.FS("writeFile", "video.mp4", await fetchFile(video()));

    // await ffmpeg.run()
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
          when={videoReady() && videoUrl()}
          fallback={
            <div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
              <Uploader setVideo={setVideo} />
            </div>
          }
        >
          <VideoPlayer videoUrl={videoUrl()}></VideoPlayer>
        </Show>
      </main>
    </div>
  );
};

export default App;
