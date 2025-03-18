import { Component, Show, createSignal, createMemo } from "solid-js";
import VideoPlayer from "../components/common/VideoPlayer";
import VideoPlayerControls from "../components/VideoPlayerControls";
import SoundPlayer from "../components/SoundPlayer";
import WaveSurfer from "wavesurfer.js";
import Uploader from "../components/common/Uploader";
import SidePanel from "../components/SidePanel";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";

const VideoEditor: Component = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = createSignal(false);
  const [videoPlayerRef, setvideoPlayerRef] = createSignal<HTMLVideoElement>();
  const [wavesurferRef, setWavesurferRef] = createSignal<WaveSurfer>();
  const [video, setVideo] = createSignal<File>();

  const videoUrl = createMemo(() => {
    return video() ? URL.createObjectURL(video()!) : "";
  });

  return (
    <div class="flex flex-col min-h-screen">
      <HeaderSection
        setIsSidePanelOpen={setIsSidePanelOpen}
        isSidePanelOpen={isSidePanelOpen()}
        wavesurferRef={wavesurferRef}
        video={video}
      ></HeaderSection>
      <main class="flex-grow">
        <div class="flex flex-auto">
          <div class="bg-black shadow-lg rounded-md m-4 flex justify-center w-full">
            <VideoPlayer
              setVideoRef={setvideoPlayerRef}
              videoUrl={videoUrl()!}
            ></VideoPlayer>
          </div>
          <Show when={isSidePanelOpen()}>
            <SidePanel wavesurferRef={wavesurferRef} video={video}></SidePanel>
          </Show>
        </div>
        <div class="bg-white shadow-lg rounded-md m-4">
          <VideoPlayerControls
            videoPlayerRef={videoPlayerRef()!}
            wavesurferRef={wavesurferRef()!}
            videoName={video()?.name || ""}
          ></VideoPlayerControls>
          <Show
            when={videoPlayerRef()}
            fallback={
              <div>
                <Uploader setVideo={setVideo}></Uploader>
              </div>
            }
          >
            <SoundPlayer
              setWavesurferRef={setWavesurferRef}
              videoPlayerRef={videoPlayerRef()!}
              video={video}
            ></SoundPlayer>
          </Show>
        </div>
      </main>
      <FooterSection></FooterSection>
    </div>
  );
};

export default VideoEditor;
