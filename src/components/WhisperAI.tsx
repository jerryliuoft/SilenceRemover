import { Component, createSignal } from "solid-js";
import makeWhisper from "../libmain";

const INDEXEDDB_NAME = "videoSilenceRemover";
const INDEXEDDB_VERSION = 1;

const WhisperAI: Component<{}> = (props) => {
  let whisperModule = null;
  let instance = null;
  let model_whisper = "";
  let context = null;
  let audio = null;

  const [selectedLanguage, setSelectedLanguage] = createSignal("en");

  function storeFS(fname = "whisper.bin", buf) {
    try {
      whisperModule.FS_unlink(fname);
    } catch (e) {
      // ignore
    }

    whisperModule.FS_createDataFile("/", fname, buf, true, true);
  }

  function loadFile(event, fname) {
    var file = event.target.files[0] || null;
    if (file == null) {
      return;
    }

    console.log(
      "loadFile: loading model: " +
        file.name +
        ", size: " +
        file.size +
        " bytes"
    );
    console.log("loadFile: please wait ...");

    const reader = new FileReader();
    reader.onload = function (event) {
      var buf = new Uint8Array(reader.result);
      storeFS(fname, buf);
    };
    reader.readAsArrayBuffer(file);
  }

  function loadAudio(event) {
    if (!context) {
      context = new AudioContext({
        sampleRate: 16000,
      });
    }

    var file = event.target.files[0] || null;
    if (file == null) {
      return;
    }

    console.log(
      "js: loading audio: " + file.name + ", size: " + file.size + " bytes"
    );
    console.log("js: please wait ...");

    var reader = new FileReader();
    reader.onload = function (event) {
      var buf = new Uint8Array(reader.result);

      context.decodeAudioData(
        buf.buffer,
        function (audioBuffer) {
          var offlineContext = new OfflineAudioContext(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
          );
          var source = offlineContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(offlineContext.destination);
          source.start(0);

          offlineContext.startRendering().then(function (renderedBuffer) {
            audio = renderedBuffer.getChannelData(0);
            console.log("js: audio loaded, size: " + audio.length);

            if (audio.length > 30 * 60 * 16000) {
              audio = audio.slice(0, 30 * 60 * 16000);
              console.log("js: truncated audio to first 30 seconds");
            }

            setAudio(audio);
          });
        },
        function (e) {
          console.log("js: error decoding audio: " + e);
          audio = null;
          setAudio(audio);
        }
      );
    };
    reader.readAsArrayBuffer(file);
  }

  function onProcess(translate) {
    if (!instance) {
      instance = whisperModule.init("whisper.bin");

      if (instance) {
        console.log("js: whisper initialized, instance: " + instance);
      }
    }

    if (!instance) {
      console.log("js: failed to initialize whisper");
      return;
    }

    if (!audio) {
      console.log("js: no audio data");
      return;
    }

    if (instance) {
      console.log("");
      console.log("js: processing - this might take a while ...");
      console.log("");

      setTimeout(() => {
        var ret = whisperModule.full_default(
          instance,
          audio,
          selectedLanguage(),
          8,
          false
        );
        console.log("js: full_default returned: " + ret);
        if (ret) {
          console.log("js: whisper returned: " + ret);
        }
      }, 100);
    }
  }

  makeWhisper().then((whisper) => {
    console.log("Whisper.cpp initialized");
    whisperModule = whisper;
    console.log(whisperModule);
  });

  return (
    <div>
      Initializing Whisper.cpp
      <div>
        <label
          for="model-file"
          class="block text-sm font-medium text-gray-700 mt-4"
        >
          Upload a model file:
        </label>
        <input
          type="file"
          id="model-file"
          class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-50 file:text-lime-700 hover:file:bg-lime-100"
          onChange={(event) => loadFile(event, "whisper.bin")}
        />
      </div>
      <div>
        <label
          for="audio-file"
          class="block text-sm font-medium text-gray-700 mt-4"
        >
          Upload an audio file:
        </label>
        <input
          type="file"
          id="audio-file"
          class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-50 file:text-lime-700 hover:file:bg-lime-100"
          onChange={loadAudio}
        />
      </div>
      <button
        class="rounded-lg font-semibold py-2 px-4 shadow-lg bg-lime-100 hover:bg-lime-500 hover:text-white m-2"
        onClick={() => onProcess(false)}
      >
        Process Audio
      </button>
    </div>
  );
};

export default WhisperAI;
