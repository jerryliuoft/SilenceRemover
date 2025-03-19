import { Component } from "solid-js";
import ExportButton from "./export/ExportButton";
import CoffeeButton from "./common/CofeeButton";

const HeaderSection: Component<{
  isSidePanelOpen: boolean;
  setIsSidePanelOpen: (open: boolean) => void;
  wavesurferRef: () => WaveSurfer | undefined;
  video: () => File | undefined;
}> = (props) => {
  const handleClick = () => {
    props.setIsSidePanelOpen(!props.isSidePanelOpen);
  };

  return (
    <header class="bg-white shadow">
      <div class="py-2 sm:px-6 lg:px-8 flex justify-between items-center">
        <a href="https://videosilenceremover.web.app">
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">
            Free silence remover
          </h1>
        </a>
        <div class="flex items-center">
          <CoffeeButton />
          <ExportButton
            wavesurferRef={props.wavesurferRef()!}
            video={props.video()}
          />
          <button
            class="rounded-lg font-semibold py-2 px-4 ml-10 shadow-lg bg-neutral-100 hover:bg-neutral-500 text-black m-2 cursor-pointer hover:text-white"
            onClick={handleClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeaderSection;
