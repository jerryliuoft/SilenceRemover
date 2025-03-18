import { Component, Setter, Show } from "solid-js";

const VideoPlayer: Component<{
  setVideoRef: Setter<HTMLVideoElement | undefined>;
  videoUrl: string;
}> = (props) => {
  console.log("setting up video player");
  return (
    <div class="w-full h-full flex justify-center items-center">
      <Show when={props.videoUrl}>
        <div
          class="overflow-auto border border-black"
          style={{ resize: "horizontal" }}
        >
          <video class="w-full h-full" ref={props.setVideoRef}>
            <source src={props.videoUrl} type="video/mp4" />
          </video>
        </div>
      </Show>
    </div>
  );
};

export default VideoPlayer;
