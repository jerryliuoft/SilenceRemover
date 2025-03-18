import { Component } from "solid-js";
import DialogBase from "./DialogBase";

const LoadingDialog: Component<{
  progress: number;
  isOpen: boolean;
}> = (props) => {
  return (
    <DialogBase isOpen={props.isOpen}>
      <div class="sm:flex sm:items-start">
        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <h3 class="text-base font-semibold text-gray-900" id="modal-title">
            Loading
          </h3>
          <div class="mt-2">
            <div
              class="mt-12 mx-auto h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status"
            >
              <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
            <p class="text-sm text-slate-500 mt-4 text-center">
              Loading progress: {props.progress}%
            </p>
            <p class="text-sm text-slate-500 text-center">
              Give it like 10 seconds or so, bigger the file, longer the load,
              unless you got a very expensive pc, then I'm jealous
            </p>
          </div>
        </div>
      </div>
    </DialogBase>
  );
};

export default LoadingDialog;
