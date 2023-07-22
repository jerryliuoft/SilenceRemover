import { Component } from "solid-js";

const TimelineExport: Component<{ video: File }> = (props) => {
  console.log(props.video);
  const timeBase = 30;
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="5">
    <sequence>
        <name>Timeline 1 (Resolve)</name>
        <duration>301</duration>
        <rate>
            <timebase>${timeBase}</timebase>
            <ntsc>TRUE</ntsc>
        </rate>
        <in>-1</in>
        <out>-1</out>
        <timecode>
            <string>01:00:00:00</string>
            <frame>108000</frame>
            <displayformat>NDF</displayformat>
            <rate>
                <timebase>30</timebase>
                <ntsc>TRUE</ntsc>
            </rate>
        </timecode>
        <media>
        </media>
    </sequence>
</xmeml>`;

  const blob = new Blob([doc], {
    type: "text/xml",
  });

  return (
    <a download href={window.URL.createObjectURL(blob)}>
      AHHHHHHHHHHHHHHHHHHHHHH
    </a>
  );
};

export default TimelineExport;
