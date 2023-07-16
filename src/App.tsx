import { createSignal, type Component, createEffect, Show } from "solid-js";
import Uploader from "./components/Uploader";
import VideoEditor from "./components/VideoEditor";

const App: Component = () => {
  const [video, setVideo] = createSignal<File>();

  return (
    <div class="bg-slate-100">
      <header class="bg-white shadow">
        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">
            Free silence remover
          </h1>
        </div>
      </header>
      <main class="h-screen">
        <Show when={video()}>
          {(video) => <VideoEditor video={video()}></VideoEditor>}
        </Show>
        <Show when={!video()}>
          <div class="card mx-auto py-6 sm:px-6 lg:px-8">
            <Uploader setVideo={setVideo} />
          </div>
        </Show>
      </main>
    </div>
  );
};

export default App;
