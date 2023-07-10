import { Component, Signal, createEffect, createSignal } from "solid-js";
import { useKeyDownEvent } from "@solid-primitives/keyboard";
import WaveSurfer from "wavesurfer.js";

const VideoPlayerControls: Component<{
  videoPlayerRef: HTMLVideoElement;
  wavesurferRef: WaveSurfer;
}> = (props) => {
  const [playSpeed, setPlaySpeed] = createSignal(1);
  const [currentTime, setCurrentTime] = createSignal(0);
  const totalTime = props.videoPlayerRef.duration;

  const event = useKeyDownEvent();
  // Keyboard Controls
  createEffect(() => {
    const e = event();
    if (e) {
      if (e.key == " ") {
        props.wavesurferRef.playPause();
      }
      e.preventDefault(); // prevent default behavior or last keydown event
    }
  });

  //   Get the relevant video information for the ref
  props.wavesurferRef.on("timeupdate", setCurrentTime);

  // When audio playing /paused, make sure the video syncs
  props.wavesurferRef.on("play", () => {
    props.videoPlayerRef.currentTime = props.wavesurferRef.getCurrentTime();
    props.videoPlayerRef.play();
  });
  props.wavesurferRef.on("pause", () => {
    props.videoPlayerRef.currentTime = props.wavesurferRef.getCurrentTime();
    props.videoPlayerRef.pause();
  });
  props.wavesurferRef.on("seeking", () => {
    props.videoPlayerRef.currentTime = props.wavesurferRef.getCurrentTime();
  });
  

  const formatTime = (time: number) => {
    const formatter = new Intl.NumberFormat(undefined, {
      minimumIntegerDigits: 2,
    });
    const miliSeconds = Math.floor((time % 1) * 100);
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);

    if (hours === 0) {
      return `${minutes}:${formatter.format(seconds)}:${miliSeconds}`;
    } else {
      return `${hours}:${formatter.format(minutes)}:${formatter.format(
        seconds
      )}${miliSeconds}`;
    }
  };

  return (
    <div>
      <button class="btn" onClick={() => props.wavesurferRef.playPause()}>
        Play
      </button>
      <button
        class="btn"
        onClick={() => {
          props.videoPlayerRef!.muted = !props.videoPlayerRef!.muted;
        }}
      >
        volume
      </button>
      <button
        class="btn"
        onClick={() => {
          setPlaySpeed(playSpeed() + 0.25 > 2 ? 1 : playSpeed() + 0.25);
          props.videoPlayerRef!.playbackRate = playSpeed();
        }}
      >
        {playSpeed()}x
      </button>
      <div>
        {formatTime(currentTime())}/{formatTime(totalTime)}
      </div>
    </div>
  );
};

export default VideoPlayerControls;
