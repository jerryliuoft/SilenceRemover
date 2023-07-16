import { Component, createSignal } from "solid-js";
import { analyzeRegions } from "./SilentHelper";
import WaveSurfer from "wavesurfer.js";

const SilentConfigControls: Component<{ ws: WaveSurfer }> = (props) => {
  const [minSilentVal, setminSilentVal] = createSignal(5);

  return (
    <div class="m-2 flex flex-col justify-between flex-1">
      <div>
        <h1 class="text-2xl font-semibold leading-6 text-gray-900">
          Parameters
        </h1>
        <div class="flex flex-auto flex-row mt-3">
          <div class="text-lg w-32 font-semibold text-slate-700">
            Min volumn %
          </div>
          <input
            id="minmax-range"
            type="range"
            min="0"
            max="30"
            value={minSilentVal()}
            step="1"
            class="flex flex-1 ml-10 h-2 rounded-lg bg-slate-200  accent-sky-500 cursor-pointer mt-3"
            onInput={(e) => {
              setminSilentVal(e.target.valueAsNumber);
            }}
          ></input>
          <input
            type="number"
            class=" w-14 rounded-md ring-2 ml-10 font-semibold text-center ring-sky-500"
            value={minSilentVal()}
            onInput={(e) => {
              setminSilentVal(e.target.valueAsNumber);
            }}
          ></input>
        </div>
      </div>
      <button
        class="btn hover:bg-sky-500 hover:text-white bg-sky-100 text-slate-900"
        onClick={() => {
          analyzeRegions(props.ws, { minVolumn: minSilentVal() });
        }}
      >
        Analyze
      </button>
    </div>
  );
};

export default SilentConfigControls;
