import { Region } from "wavesurfer.js/dist/plugins/regions";

export const timelineExport = (
  regions: Region[],
  oriTimeBase: number,
  videoLength: number,
  width: number,
  height: number,
  fileName = ""
) => {
  const timeBase = Math.round(oriTimeBase);
  const originalDuration = Math.floor(videoLength * timeBase);
  let cutDuration = 0;
  const audioChannelCnt = 2;
  const fileId = fileName + " fileId";

  let videoClipItems = ``;
  let audioClipItems = ``;

  const rateNode = `<rate>
              <timebase>${timeBase}</timebase>
              <ntsc>TRUE</ntsc>
          </rate>
  `;

  regions.map((region: Region, idx) => {
    // TODO these shitty variable names
    const vidIn = Math.floor(region.start * timeBase);
    const vidOut = Math.floor(region.end * timeBase);
    const start = cutDuration;
    const end = start + vidOut - vidIn;
    cutDuration += vidOut - vidIn;

    videoClipItems += `
    <clipitem id="${fileName} ${idx * 2}">
        <name>${fileName}</name>
        <duration>${originalDuration}</duration>
        ${rateNode}
        <start>${start}</start>
        <end>${end}</end>
        <enabled>TRUE</enabled>
        <in>${vidIn}</in>
        <out>${vidOut}</out>
        <file id="${fileId}">
            <duration>${originalDuration}</duration>
            ${rateNode}
            <name>${fileName}</name>
            <pathurl>file://localhost/C:/${fileName}</pathurl>
            <timecode>
                <string>00:00:00:00</string>
                <displayformat>NDF</displayformat>
                ${rateNode}
            </timecode>
            <media>
                <video>
                    <duration>${originalDuration}</duration>
                    <samplecharacteristics>
                        <width>${width}</width>
                        <height>${height}</height>
                    </samplecharacteristics>
                </video>
                <audio>
                    <channelcount>${audioChannelCnt}</channelcount>
                </audio>
            </media>
        </file>
        <link>
            <linkclipref>${fileName} ${idx * 2}</linkclipref>
        </link>
        <link>
            <linkclipref>${fileName} ${idx * 2 + 1}</linkclipref>
        </link>
    </clipitem>`;

    audioClipItems += `
    <clipitem id="${fileName} ${idx * 2 + 1}">
        <name>${fileName}</name>
        <duration>${originalDuration}</duration>
        ${rateNode}
        <start>${start}</start>
        <end>${end}</end>
        <enabled>TRUE</enabled>
        <in>${vidIn}</in>
        <out>${vidOut}</out>
        <file id="${fileId}"/>
        <sourcetrack>
            <mediatype>audio</mediatype>
            <trackindex>1</trackindex>
        </sourcetrack>
        <link>
            <linkclipref>${fileName} ${idx * 2}</linkclipref>
            <mediatype>video</mediatype>
        </link>
        <link>
            <linkclipref>${fileName} ${idx * 2 + 1}</linkclipref>
        </link>
      </clipitem>
    `;
  });

  const videoNodes = `<video>
    <track>
      ${videoClipItems}
      <enabled>TRUE</enabled>
      <locked>FALSE</locked>
    </track>
    <format>
      <samplecharacteristics>
          <width>${width}</width>
          <height>${height}</height>
          <pixelaspectratio>square</pixelaspectratio>
          ${rateNode}
          <codec>
              <appspecificdata>
                  <appname>Final Cut Pro</appname>
                  <appmanufacturer>Apple Inc.</appmanufacturer>
                  <data>
                      <qtcodec/>
                  </data>
              </appspecificdata>
          </codec>
      </samplecharacteristics>
    </format>
  </video>`;
  const audioNodes = `<audio>
    <track>
        ${audioClipItems}
        <enabled>TRUE</enabled>
        <locked>FALSE</locked>
    </track>
</audio>`;

  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="5">
    <sequence>
        <name>Timeline 1 (Resolve)</name>
        <duration>${cutDuration}</duration>
        ${rateNode}
        <in>-1</in>
        <out>-1</out>
        <timecode>
            <string>01:00:00:00</string>
            <frame>${3600 * timeBase}</frame>
            <displayformat>NDF</displayformat>
            ${rateNode}
        </timecode>
        <media>
        ${videoNodes}
        ${audioNodes}
        </media>
    </sequence>
</xmeml>`;

  const blob = new Blob([doc], {
    type: "text/xml",
  });
  return blob;
};
