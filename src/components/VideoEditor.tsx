import { Component, Show, createSignal, createMemo } from "solid-js";
import VideoPlayer from "./VideoPlayer";
import VideoPlayerControls from "./VideoPlayerControls";
import SoundPlayer from "./SoundPlayer";
import WaveSurfer from "wavesurfer.js";
import VideoRender from "./VideoRender";
import SilentConfigControls from "./SilentConfigControls";
import Uploader from "./Uploader";

const VideoEditor: Component<{}> = () => {
  const [videoPlayerRef, setvideoPlayerRef] = createSignal<HTMLVideoElement>();
  const [wavesurferRef, setWavesurferRef] = createSignal<WaveSurfer>();
  const [video, setVideo] = createSignal<File>();

  const videoUrl = createMemo(() => {
    return video() ? URL.createObjectURL(video()!) : "";
  });

  return (
    <div>
      <div class="flex flex-auto">
        <div class="bg-white shadow-lg rounded-md m-4 w-1/3">
          <Show
            when={videoUrl()}
            fallback={
              <div class="flex items-center justify-center h-full text-gray-500">
                Please first select a video
              </div>
            }
          >
            <VideoPlayer
              setVideoRef={setvideoPlayerRef}
              videoUrl={videoUrl()}
            ></VideoPlayer>
          </Show>
        </div>
        <div class="bg-white shadow-lg rounded-md m-4 flex flex-1 flex-col">
          <SilentConfigControls ws={wavesurferRef()!}></SilentConfigControls>
          <VideoRender
            wavesurferRef={wavesurferRef()!}
            video={video()}
          ></VideoRender>
        </div>
      </div>
      <div class="bg-white shadow-lg rounded-md m-4">
        <Show when={videoPlayerRef() && wavesurferRef()}>
          <VideoPlayerControls
            videoPlayerRef={videoPlayerRef()!}
            wavesurferRef={wavesurferRef()!}
            videoName={video()?.name || ""}
          ></VideoPlayerControls>
        </Show>
        <Show
          when={videoPlayerRef()}
          fallback={
            <div>
              <Uploader setVideo={setVideo}></Uploader>
            </div>
          }
        >
          <SoundPlayer
            videoUrl={videoUrl()}
            setWavesurferRef={setWavesurferRef}
            videoName={video()?.name || ""}
          ></SoundPlayer>
        </Show>
      </div>
    </div>
  );
};

export default VideoEditor;
