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
  const cutPercent = () => {
    if (props.ws) {
      return Math.floor(
        ((props.ws.getDuration() - newLen()) / props.ws.getDuration()) * 100
      );
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
        <button
          class="btn w-full hover:bg-sky-500 hover:text-white bg-sky-100 text-slate-900"
          onClick={() => {
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
          }}
        >
          Analyze
        </button>
      </div>
    </div>
  );
};

export default SilentConfigControls;
