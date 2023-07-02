import { Component, JSX, Setter, createEffect, createSignal } from "solid-js";
import { useKeyDownEvent } from "@solid-primitives/keyboard";
import WaveSurfer from "wavesurfer.js";
import Timeline from "wavesurfer.js/dist/plugins/timeline.js";

const VideoPlayer: Component<{
  videoUrl: string;
}> = (props) => {
  let videoPlayerRef: HTMLVideoElement | undefined = undefined;
  let wavePlayerRef: HTMLElement | undefined = undefined;
  const [wavesurferRef, setWavesurferRef] = createSignal<HTMLElement>();

  const [currentTime, setCurrentTime] = createSignal(0);
  const [totalTime, setTotalTime] = createSignal(0);
  const [playSpeed, setPlaySpeed] = createSignal(1);

  const event = useKeyDownEvent();

  const initWaveSurfer = (videoPlayerRef: HTMLVideoElement) => {
    console.log("INIT wavesurfer");
    console.log(wavePlayerRef);

    const ws = WaveSurfer.create({
      container: wavePlayerRef!,
      waveColor: "rgb(200, 0, 200)",
      progressColor: "rgb(100, 0, 100)",
      // Pass the video element in the `media` param
      media: videoPlayerRef,
    });
    // Initialize the Timeline plugin
    ws.registerPlugin(Timeline.create());

    // Play on click
    ws.on("interaction", () => {
      ws.play();
    });

    // Rewind to the beginning on finished playing
    ws.on("finish", () => {
      ws.setTime(0);
    });

    ws.on("ready", () => {
      console.log("READY!");
    });

    ws.on("load", () => {
      console.log("LOAD!");
    });

    ws.on("decode", () => {
      console.log("decoded!");
    });

    ws.on("redraw", () => {
      console.log("DRAWN!");
    });
  };
  const playPause = () => {
    if (!videoPlayerRef) return;
    if (videoPlayerRef.paused) {
      videoPlayerRef.play();
    } else {
      videoPlayerRef.pause();
    }
  };

  // Keyboard effect
  createEffect(() => {
    const e = event();
    if (e) {
      if (e.key == " ") {
        playPause();
      }
      e.preventDefault(); // prevent default behavior or last keydown event
    }
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
    <>
      <div class="max-w-screen-lg flex-auto">
        <video
          class="max-w-full"
          ref={videoPlayerRef}
          onLoadedData={(e) => {
            setTotalTime(videoPlayerRef!.duration);
            initWaveSurfer(e.target as HTMLVideoElement);
          }}
          onTimeUpdate={(e) => {
            setCurrentTime((e.target as HTMLVideoElement).currentTime);
          }}
          onCanPlay={() => console.log("CAN PLAY EVENT")}
          onCanPlayThrough={() => console.log("CAN PLAY THROUGH")}
          onemptied={() => console.log("ON emptied")}
          onProgress={() => console.log("PROGRESS")}
        >
          <source src={props.videoUrl} type="video/mp4" />
        </video>
      </div>
      <button class="btn" onClick={playPause}>
        Play
      </button>
      <button
        class="btn"
        onClick={() => {
          videoPlayerRef!.muted = !videoPlayerRef!.muted;
        }}
      >
        volume
      </button>
      <button
        class="btn"
        onClick={() => {
          setPlaySpeed(playSpeed() + 0.25 > 2 ? 1 : playSpeed() + 0.25);
          videoPlayerRef!.playbackRate = playSpeed();
        }}
      >
        {playSpeed()}x
      </button>
      <div>
        {formatTime(currentTime())}/{formatTime(totalTime())}
      </div>
      <div ref={wavePlayerRef}></div>
    </>
  );
};

export default VideoPlayer;
