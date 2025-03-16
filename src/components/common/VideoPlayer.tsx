import { Component, Setter } from "solid-js";

const VideoPlayer: Component<{
  setVideoRef: Setter<HTMLVideoElement | undefined>;
  videoUrl: string;
}> = (props) => {
  if (!props.videoUrl) return null;
  console.log("setting up video player");
  return (
    <div class="max-w-screen-lg flex-auto">
      <video class="max-w-full" ref={props.setVideoRef}>
        <source src={props.videoUrl} type="video/mp4" />
      </video>
    </div>
  );
};

export default VideoPlayer;
