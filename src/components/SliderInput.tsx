import { Component, Setter } from "solid-js";

const SliderInput: Component<{
  title: string;
  description: string;
  value: number;
  setter: Setter<number>;
  max: number;
  step: number;
  unit: string;
}> = (props) => {
  return (
    <div class="m-4">
      <div>
        <p class="text-base font-semibold text-slate-700">
          {props.title}
          <span class="text-xs ml-2 font-sans text-slate-400">
            {props.description}
          </span>
        </p>
      </div>
      <div class="ml-4 flex flex-1">
        <input
          type="range"
          max={props.max}
          step={props.step}
          value={props.value}
          class="rounded-lg w-full bg-slate-200  accent-sky-300 cursor-pointer"
          onInput={(e) => {
            props.setter(e.target.valueAsNumber);
          }}
        ></input>
        <input
          type="number"
          class="w-14 ml-2 rounded-md ring-2 font-semibold text-center ring-sky-300"
          value={props.value}
          onInput={(e) => {
            props.setter(e.target.valueAsNumber);
          }}
        ></input>
        <p class="ml-1 font-semibold">{props.unit}</p>
      </div>
    </div>
  );
};

export default SliderInput;
