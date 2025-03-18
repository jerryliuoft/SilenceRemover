import { Component, createSignal, Show } from "solid-js";
import SilentConfigControls from "./SilentConfigControls";
import WaveSurfer from "wavesurfer.js";

const SidePanel: Component<{
  wavesurferRef: () => WaveSurfer | undefined;
  video: () => File | undefined;
}> = (props) => {
  const [activeTab, setActiveTab] = createSignal("sound");

  return (
    <div class="bg-white shadow-lg rounded-md m-4 flex flex-col w-1/3">
      <div class="flex justify-between items-center p-2 border-b">
        <div>
          <button
            class={`px-4 py-2 ${activeTab() === "sound" ? "bg-gray-200" : ""}`}
            onClick={() => setActiveTab("sound")}
          >
            Analyze by Sound Volume
          </button>
          <button
            class={`px-4 py-2 ${activeTab() === "speech" ? "bg-gray-200" : ""}`}
            onClick={() => setActiveTab("speech")}
          >
            Analyze by Speech (AI)
          </button>
        </div>
      </div>
      <div class="p-4 flex-1 overflow-auto">
        <Show when={activeTab() === "sound"}>
          <SilentConfigControls
            ws={props.wavesurferRef()!}
          ></SilentConfigControls>
        </Show>
        <Show when={activeTab() === "speech"}>
          <div>
            <h2>Transcription Area</h2>
            <p>Placeholder for transcription area...</p>
            <h2>Caption/Subtitle Generation</h2>
            <p>Placeholder for caption/subtitle generation controls...</p>
            <h2>Search Functionality</h2>
            <p>Placeholder for search functionality...</p>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default SidePanel;
