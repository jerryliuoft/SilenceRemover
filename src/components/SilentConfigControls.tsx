import { Component, Show, createSignal } from "solid-js";
import { analyzeRegions, formatTime } from "./SilentHelper";
import WaveSurfer from "wavesurfer.js";
import SliderInput from "./common/SliderInput";
import Dialog from "./common/Dialog";

const SilentConfigControls: Component<{ ws: WaveSurfer }> = (props) => {
  const [minSilentVal, setminSilentVal] = createSignal(5);
  const [minDuration, setminDuration] = createSignal(0.8);
  const [prepad, setprepad] = createSignal(0.2);
  const [postpad, setpostpad] = createSignal(0.2);
  const [newLen, setnewLen] = createSignal(0);
  const [ignoreWarning, setIgnoreWarning] = createSignal(false);
  const [showWarning, setShowWarning] = createSignal(false);
  const cutPercent = () => {
    if (props.ws) {
      return Math.floor(
        ((props.ws.getDuration() - newLen()) / props.ws.getDuration()) * 100
      );
    }
  };

  const analyze = () => {
    const newLength = analyzeRegions(props.ws, {
      minVolume: minSilentVal(),
      minDuration: minDuration(),
      prePadding: prepad(),
      postPadding: postpad(),
    });
    if (newLength) {
      setnewLen(newLength);
      setTimeout(() => {
        setnewLen(0);
      }, 3000);
    }
  };

  return (
    <div class="m-2 flex flex-col justify-between flex-1 min-w-max">
      <div>
        <h1 class="text-2xl font-semibold leading-6 text-gray-900">
          Parameters
        </h1>
        <div class="">
          <SliderInput
            max={30}
            title="Min volume"
            description="Highlight regions with volume higher than"
            step={0.01}
            setter={setminSilentVal}
            value={minSilentVal()}
            unit="%"
          ></SliderInput>
          <SliderInput
            max={1}
            step={0.01}
            title="Min duration"
            description="Highlight regions with volume longer than"
            setter={setminDuration}
            value={minDuration()}
            unit="s"
          ></SliderInput>
          <SliderInput
            max={1}
            step={0.01}
            title="Pre padding"
            description="Add left padding to each highlighted region"
            setter={setprepad}
            value={prepad()}
            unit="s"
          ></SliderInput>
          <SliderInput
            max={1}
            step={0.01}
            title="Post padding"
            description="Add right padding to each highlighted region"
            setter={setpostpad}
            value={postpad()}
            unit="s"
          ></SliderInput>
        </div>
      </div>
      <div class="w-full">
        <Show when={newLen()}>
          <p>
            Video is shortened by {cutPercent()}%, new duration is{" "}
            {formatTime(newLen())}
          </p>
        </Show>
        <div class="flex items-center mb-4">
          <input
            id="checkbox"
            checked={ignoreWarning()}
            onClick={(e) => {
              const checked = (e.target as HTMLInputElement).checked;
              setIgnoreWarning(checked);
            }}
            type="checkbox"
            value=""
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          ></input>
          <label
            for="checkbox"
            class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Ignore analyze override warning
          </label>
        </div>
        <button
          class="rounded-lg font-semibold py-2 px-4 shadow-lg w-full hover:bg-sky-500 hover:text-white bg-sky-100 text-slate-900"
          onClick={() => (ignoreWarning() ? analyze() : setShowWarning(true))}
        >
          Analyze
        </button>
        <Dialog
          title="You will override your current changes"
          description="This will replace the existing analyze result and any changes you've made."
          isOpen={showWarning()}
          onCancel={() => setShowWarning(false)}
        >
          <button
            type="button"
            class="transition-opacity delay-100 inline-flex w-full justify-center rounded-md bg-lime-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-lime-600 sm:ml-3 sm:w-auto"
            onClick={() => {
              analyze();
              setShowWarning(false);
            }}
          >
            Confirm
          </button>
        </Dialog>
      </div>
    </div>
  );
};

export default SilentConfigControls;
