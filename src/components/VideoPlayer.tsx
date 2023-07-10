import { Component, Setter } from "solid-js";

const VideoPlayer: Component<{
  setVideoRef: Setter<HTMLVideoElement>;
  videoUrl: string;
}> = (props) => {
  return (
    <div class="max-w-screen-lg flex-auto">
      <video class="max-w-full" ref={props.setVideoRef} muted={true}>
        <source src={props.videoUrl} type="video/mp4" />
      </video>
    </div>
  );
};

export default VideoPlayer;
