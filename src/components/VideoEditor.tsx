import { Component, Show, createSignal } from "solid-js";
import VideoPlayer from "./VideoPlayer";
import VideoPlayerControls from "./VideoPlayerControls";
import SoundPlayer from "./SoundPlayer";
import WaveSurfer from "wavesurfer.js";
import VideoRender from "./VideoRender";
import SilentConfigControls from "./SilentConfigControls";

const VideoEditor: Component<{
  video: File;
}> = (props) => {
  const [videoPlayerRef, setvideoPlayerRef] = createSignal<HTMLVideoElement>();
  const [wavesurferRef, setWavesurferRef] = createSignal<WaveSurfer>();

  const videoUrl = () => {
    return props.video ? URL.createObjectURL(props.video) : "";
  };

  return (
    <div>
      <div class="flex flex-auto">
        <div class="card">
          <VideoPlayer
            setVideoRef={setvideoPlayerRef}
            videoUrl={videoUrl()}
          ></VideoPlayer>
        </div>
        <div class="card flex flex-1 flex-col">
          <SilentConfigControls ws={wavesurferRef()!}></SilentConfigControls>
          <VideoRender
            wavesurferRef={wavesurferRef()!}
            video={props.video}
          ></VideoRender>
        </div>
      </div>
      <div class="card">
        <Show when={videoPlayerRef() && wavesurferRef()}>
          <VideoPlayerControls
            videoPlayerRef={videoPlayerRef()!}
            wavesurferRef={wavesurferRef()!}
            videoName={props.video.name}
          ></VideoPlayerControls>
        </Show>
        <SoundPlayer
          videoUrl={videoUrl()}
          setWavesurferRef={setWavesurferRef}
          videoName={props.video.name}
        ></SoundPlayer>
      </div>
    </div>
  );
};

export default VideoEditor;
