import {
  Component,
  Setter,
  Show,
  createSignal,
  createEffect,
  onMount,
} from "solid-js";
import WaveSurfer from "wavesurfer.js";
import { initWaveSurfer } from "../services/WavesurferService";
import { extractPeaksData } from "../services/AudioService";
import LoadingDialog from "./common/Dialog/LoadingDialog"; // Import the LoadingDialog component

const SoundPlayer: Component<{
  setWavesurferRef: Setter<WaveSurfer | undefined>;
  videoPlayerRef: HTMLMediaElement;
  video: () => File | undefined;
}> = (props) => {
  const [ready, setReady] = createSignal(false);
  const [progress, setProgress] = createSignal(0); // Progress state
  let waveSurferDiv: HTMLDivElement | undefined;

  createEffect(async () => {
    setReady(false);
    if (props.video()) {
      console.log("Extracting audio data and peaks data...");
      const peaks = await extractPeaksData(props.video()!, setProgress); // Pass setProgress to update progress
      // waveSurferDiv should definitely be available at this point, so there's no need to check for it
      const initWaveSurferProps = {
        videoPlayerRef: props.videoPlayerRef,
        peakData: peaks.peaks,
        duration: peaks.duration,
        setWavesurferRef: props.setWavesurferRef,
      };
      initWaveSurfer(waveSurferDiv!, initWaveSurferProps, setProgress);
      setReady(true);
    }
  });

  return (
    <div class="flex-auto text-center px-2 pt-1 pb-1 ring-2 ring-inset ring-slate-300 rounded-lg">
      <LoadingDialog progress={progress()} isOpen={!ready()} />
      <div ref={waveSurferDiv}></div>
    </div>
  );
};

export default SoundPlayer;
