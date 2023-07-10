import { Component, Setter, Show, createSignal } from "solid-js";
import VideoPlayer from "./VideoPlayer";
import VideoPlayerControls from "./VideoPlayerControls";
import SoundPlayer, { Region } from "./SoundPlayer";
import WaveSurfer from "wavesurfer.js";

const VideoEditor: Component<{
  videoUrl: string;
  setRegions: Setter<Region[]>;
}> = (props) => {
  const [videoPlayerRef, setvideoPlayerRef] = createSignal<HTMLVideoElement>();
  const [wavesurferRef, setWavesurferRef] = createSignal<WaveSurfer>();

  return (
    <div>
      <VideoPlayer
        setVideoRef={setvideoPlayerRef}
        videoUrl={props.videoUrl}
      ></VideoPlayer>
      <Show when={videoPlayerRef() && wavesurferRef()}>
        <VideoPlayerControls
          videoPlayerRef={videoPlayerRef()!}
          wavesurferRef={wavesurferRef()!}
        ></VideoPlayerControls>
      </Show>
      <div>HELLO BEGIN</div>
      <SoundPlayer
        videoUrl={props.videoUrl}
        setWavesurferRef={setWavesurferRef}
        setRegions={props.setRegions}
      ></SoundPlayer>
      <div>HELLO END</div>
    </div>
  );
};

export default VideoEditor;
