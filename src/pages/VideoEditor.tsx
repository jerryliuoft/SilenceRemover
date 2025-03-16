import {
  Component,
  Show,
  createSignal,
  createMemo,
  createEffect,
} from "solid-js";
import VideoPlayer from "../components/common/VideoPlayer";
import VideoPlayerControls from "../components/VideoPlayerControls";
import SoundPlayer from "../components/SoundPlayer";
import WaveSurfer from "wavesurfer.js";
import VideoRender from "../components/export/VideoRender";
import SilentConfigControls from "../components/SilentConfigControls";
import Uploader from "../components/Uploader";
import { extractPeaksData } from "../services/AudioService"; // Import the helper function

const VideoEditor: Component<{}> = () => {
  const [videoPlayerRef, setvideoPlayerRef] = createSignal<HTMLVideoElement>();
  const [wavesurferRef, setWavesurferRef] = createSignal<WaveSurfer>();
  const [video, setVideo] = createSignal<File>();
  const [audioData, setAudioData] = createSignal<ArrayBuffer>(); // New signal for audio data
  const [peakData, setPeakData] = createSignal<number[][]>(); // New signal for peak data
  const [vidoeDuration, setVideoDuration] = createSignal<number>(0);

  const videoUrl = createMemo(() => {
    return video() ? URL.createObjectURL(video()!) : "";
  });

  // Extract audio data and peak data when video is set
  createEffect(async () => {
    if (video()) {
      console.log("Extracting audio data and peaks data...");
      // console.log("Extracting audio data...");
      // const data = await extractAudioData(video()!);
      // setAudioData(data);

      const peaks = await extractPeaksData(video()!);
      setPeakData(peaks.peaks);
      setVideoDuration(peaks.duration);
    }
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
          when={videoPlayerRef() && peakData()}
          fallback={
            <div>
              <Uploader setVideo={setVideo}></Uploader>
            </div>
          }
        >
          <SoundPlayer
            duration={vidoeDuration()}
            setWavesurferRef={setWavesurferRef}
            videoName={video()?.name || ""}
            videoPlayerRef={videoPlayerRef()!}
            peakData={peakData()!}
          ></SoundPlayer>
        </Show>
      </div>
    </div>
  );
};

export default VideoEditor;
