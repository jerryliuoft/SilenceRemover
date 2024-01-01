import { Component, Show, createSignal } from "solid-js";
import { analyzeRegions, formatTime } from "./SilentHelper";
import WaveSurfer from "wavesurfer.js";
import SliderInput from "./SliderInput";

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
          class="btn w-full hover:bg-sky-500 hover:text-white bg-sky-100 text-slate-900"
          onClick={() => (ignoreWarning() ? analyze() : setShowWarning(true))}
        >
          Analyze
        </button>
        <Show when={showWarning()}>
          <AnalyzeWarningDialog
            applyFunc={() => analyze()}
            cancelFunc={() => {
              setShowWarning(false);
            }}
          ></AnalyzeWarningDialog>
        </Show>
      </div>
    </div>
  );
};

const AnalyzeWarningDialog: Component<{
  applyFunc: Function;
  cancelFunc: Function;
}> = (props) => {
  return (
    <div
      class="ransition-opacity relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3
                    class="text-base font-semibold leading-6 text-gray-900"
                    id="modal-title"
                  >
                    You will override your current changes
                  </h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      {
                        "This will replace the existing analyze result and any changes you've made."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                class="transition-opacity delay-100 inline-flex w-full justify-center rounded-md bg-lime-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-lime-600 sm:ml-3 sm:w-auto"
                onClick={() => {
                  props.applyFunc();
                  props.cancelFunc();
                }}
              >
                Confirm
              </button>
              <button
                type="button"
                class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                onClick={() => props.cancelFunc()}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SilentConfigControls;
