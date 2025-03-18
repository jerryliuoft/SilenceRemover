import { Component } from "solid-js";
import DialogBase from "./DialogBase";

const Dialog: Component<{
  title: string;
  description: string;
  isOpen: boolean;
  onCancel: () => void;
  children: any;
}> = (props) => {
  return (
    <DialogBase isOpen={props.isOpen} onCancel={props.onCancel}>
      <div class="sm:flex sm:items-start">
        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <h3 class="text-base font-semibold text-gray-900" id="modal-title">
            {props.title}
          </h3>
          <div class="mt-2">
            <p class="text-sm text-gray-500">{props.description}</p>
          </div>
        </div>
      </div>
      {props.children}
    </DialogBase>
  );
};

export default Dialog;
