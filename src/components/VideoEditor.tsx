import { Component, Setter, Show, createSignal } from "solid-js";
import VideoPlayer from "./VideoPlayer";
import VideoPlayerControls from "./VideoPlayerControls";
import SoundPlayer, { Region } from "./SoundPlayer";
import WaveSurfer from "wavesurfer.js";
import VideoRender from "./VideoRender";

const VideoEditor: Component<{
  video: File;
}> = (props) => {
  const [videoPlayerRef, setvideoPlayerRef] = createSignal<HTMLVideoElement>();
  const [wavesurferRef, setWavesurferRef] = createSignal<WaveSurfer>();
  const [regions, setRegions] = createSignal<Region[]>([]);

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
          <Show when={videoPlayerRef() && wavesurferRef()}>
            <VideoPlayerControls
              videoPlayerRef={videoPlayerRef()!}
              wavesurferRef={wavesurferRef()!}
            ></VideoPlayerControls>
          </Show>
        </div>
        <div class="card flex-1">
          <VideoRender
            regions={regions()}
            wavesurferRef={wavesurferRef()!}
            video={props.video}
          ></VideoRender>
        </div>
      </div>
      <div class="card">
        <SoundPlayer
          videoUrl={videoUrl()}
          setWavesurferRef={setWavesurferRef}
          setRegions={setRegions}
        ></SoundPlayer>
      </div>
    </div>
  );
};

export default VideoEditor;
