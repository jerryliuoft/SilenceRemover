import { createSignal, type Component, createEffect, Show } from "solid-js";
import Uploader from "./components/Uploader";
import VideoEditor from "./components/VideoEditor";

const App: Component = () => {
  const [video, setVideo] = createSignal<File>();

  return (
    <div>
      <header class="bg-white shadow">
        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">
            Free silence remover
          </h1>
        </div>
      </header>
      <main class="bg-slate-100 h-screen">
        <Show
          when={video()}
          fallback={
            <div class="card mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
              <Uploader setVideo={setVideo} />
            </div>
          }
        >
          {(video) => <VideoEditor video={video()}></VideoEditor>}
        </Show>
      </main>
    </div>
  );
};

export default App;
