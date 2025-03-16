export async function extractAudioData(
  file: File
): Promise<Float32Array | null> {
  try {
    const chunkSize = 1024 * 1024 * 1000; // 1000MB chunks
    const audioBuffer = await readAndDecodeAudioInChunks(file, chunkSize);
    const renderedBuffer = await renderOfflineAudio(audioBuffer);

    let audio = renderedBuffer.getChannelData(0);
    console.log("js: audio loaded, size: " + audio.length);

    if (audio.length > 30 * 60 * 16000) {
      audio = audio.slice(0, 3 * 60 * 16000);
      console.log("js: truncated audio to first 30 minutes");
    }

    return audio;
  } catch (e) {
    console.log("js: error processing audio: " + e);
    return null;
  }
}

function renderOfflineAudio(audioBuffer: AudioBuffer): Promise<AudioBuffer> {
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start(0);

  return offlineContext.startRendering();
}

export async function extractPeaksData(
  file: File
): Promise<{ peaks: number[][]; duration: number }> {
  try {
    if (!file) {
      throw new Error("No file provided");
    }
    console.log("extractPeaksData: extracting peaks from file:", file.name);

    const chunkSize = 1024 * 1024 * 1600; // 1600MB chunks
    const audioBuffer = await readAndDecodeAudioInChunks(file, chunkSize);
    console.log("extractPeaksData: audio loaded, size: " + audioBuffer.length);

    const peaks = calculatePeaks(audioBuffer, 10000); // 512 is the number of samples per peak
    const duration = audioBuffer.duration;

    return { peaks, duration };
  } catch (e) {
    console.log("extractPeaksData: error extracting peaks: " + e);
    return { peaks: [], duration: 0 };
  }
}

function calculatePeaks(
  audioBuffer: AudioBuffer,
  samplesPerPeak: number
): number[][] {
  const peaks: number[][] = [];
  const numberOfChannels = audioBuffer.numberOfChannels;

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    const peaksForChannel: number[] = [];
    for (let i = 0; i < channelData.length; i += samplesPerPeak) {
      let peak = 0;
      for (let j = 0; j < samplesPerPeak; j++) {
        if (i + j < channelData.length) {
          peak = Math.max(peak, Math.abs(channelData[i + j]));
        }
      }
      peaksForChannel.push(peak);
    }
    peaks.push(peaksForChannel);
  }

  return peaks;
}

export async function readAndDecodeAudioInChunks(
  file: File,
  chunkSize: number
): Promise<AudioBuffer> {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const chunks: AudioBuffer[] = [];

  // Read the initial header
  const headerSize = 1024 * 1024 * 5; // 5MB header size (adjust as needed)

  // Function to read a chunk of the file
  const readFileChunk = (
    file: File,
    offset: number,
    size: number
  ): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as ArrayBuffer);
        } else {
          reject(new Error("Failed to read file chunk"));
        }
      };
      reader.onerror = (event) => {
        reject(event.target?.error);
      };
      const blob = file.slice(offset, offset + size);
      reader.readAsArrayBuffer(blob);
    });
  };

  const headerArrayBuffer = await readFileChunk(file, 0, headerSize);

  let offset = headerSize;
  while (offset < file.size) {
    console.log("Reading chunk at offset:", offset);
    const chunkArrayBuffer = await readFileChunk(file, offset, chunkSize);

    // Prepend the header to the chunk
    const combinedArrayBuffer = new Uint8Array(
      headerArrayBuffer.byteLength + chunkArrayBuffer.byteLength
    );
    combinedArrayBuffer.set(new Uint8Array(headerArrayBuffer), 0);
    combinedArrayBuffer.set(
      new Uint8Array(chunkArrayBuffer),
      headerArrayBuffer.byteLength
    );

    console.log("decoding audio for chunk at offset:", offset);
    const audioBuffer = await audioContext.decodeAudioData(
      combinedArrayBuffer.buffer
    );
    console.log("decoded chunk");
    chunks.push(audioBuffer);
    offset += chunkSize;
  }

  return combineAudioBuffers(audioContext, chunks);
}

function combineAudioBuffers(
  audioContext: AudioContext,
  buffers: AudioBuffer[]
): AudioBuffer {
  const numberOfChannels = buffers[0].numberOfChannels;
  const length = buffers.reduce((sum, buffer) => sum + buffer.length, 0);
  const sampleRate = buffers[0].sampleRate;

  const combinedBuffer = audioContext.createBuffer(
    numberOfChannels,
    length,
    sampleRate
  );
  let offset = 0;

  for (const buffer of buffers) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      combinedBuffer
        .getChannelData(channel)
        .set(buffer.getChannelData(channel), offset);
    }
    offset += buffer.length;
  }

  return combinedBuffer;
}
