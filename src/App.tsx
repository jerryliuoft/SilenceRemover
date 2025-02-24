import { createSignal, type Component, createEffect, Show } from "solid-js";
import Uploader from "./components/Uploader";
import VideoEditor from "./components/VideoEditor";

const App: Component = () => {
  const [video, setVideo] = createSignal<File>();

  return (
    <div class="bg-slate-100">
      <header class="bg-white shadow">
        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <a href="https://videosilenceremover.web.app">
            <h1 class="text-3xl font-bold tracking-tight text-gray-900">
              Free silence remover
            </h1>
          </a>
        </div>
      </header>
      <main class="h-screen">
        <Show when={video()}>
          {(video) => <VideoEditor video={video()}></VideoEditor>}
        </Show>
        <Show when={!video()}>
          <div class="bg-white shadow-lg rounded-md m-4 mx-auto py-6 sm:px-6 lg:px-8">
            <Uploader setVideo={setVideo} />
          </div>
        </Show>
        <footer class="bg-white rounded-lg m-4 min-h-fit text-right mt-32">
          <div class="m-4">
            <p class="text-slate-600 font-semibold text-sm">
              If you think this is cool why not check out my other apps like{" "}
              <a
                href={"https://midiband-eba3a.web.app/"}
                class=" text-purple-500 text-xl"
              >
                this
              </a>{" "}
              and
              <a
                class=" text-cyan-500 text-xl"
                href={"https://www.lexaloffle.com/bbs/?tid=46797"}
              >
                {" "}
                this
              </a>
            </p>
            <p class="text-slate-600 font-semibold text-sm">
              If you encountered any problems, feel free to send a PR at
              <a
                class=" text-amber-500 text-xl"
                href={"https://github.com/jerryliuoft/SilenceRemover"}
              >
                {" "}
                Source code
              </a>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
