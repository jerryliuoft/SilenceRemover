import { Component, createSignal, Show } from "solid-js";
import SilentConfigControls from "./common/SilentConfigControls";
import WaveSurfer from "wavesurfer.js";

const SidePanel: Component<{
  wavesurferRef: () => WaveSurfer | undefined;
  video: () => File | undefined;
}> = (props) => {
  const [activeTab, setActiveTab] = createSignal("sound");

  return (
    <div class="bg-white shadow-lg rounded-md m-4 flex flex-col w-1/3">
      <div class="mb-4 border-b border-gray-200 dark:border-gray-700">
        <ul
          class="flex flex-wrap -mb-px text-sm font-medium text-center"
          role="tablist"
        >
          <li class="me-2" role="presentation">
            <button
              class={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab() === "sound"
                  ? "border-sky-600 text-sky-600"
                  : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("sound")}
              type="button"
              role="tab"
            >
              Analyze by Sound Volume
            </button>
          </li>
          <li class="me-2" role="presentation">
            <button
              class={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab() === "speech"
                  ? "border-sky-600 text-sky-600"
                  : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("speech")}
              type="button"
              role="tab"
            >
              Analyze by Speech (AI)
            </button>
          </li>
        </ul>
      </div>
      <div class="p-4 flex-1 overflow-auto">
        <Show when={activeTab() === "sound"}>
          <SilentConfigControls
            ws={props.wavesurferRef()!}
          ></SilentConfigControls>
        </Show>
        <Show when={activeTab() === "speech"}>
          <div class="text-center">
            <p>Working on it, almost there</p>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default SidePanel;
