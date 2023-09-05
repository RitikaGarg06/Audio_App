import Child from "./Child";
import React, { useEffect, useState } from "react";

function MergeAudio({base64EncodedAudioData1, base64EncodedAudioData2}) {
  const [concatenatedBase64, setConcatenatedBase64] = useState("");
  const [check, setCheck] = useState(false);
  useEffect(() => {
    async function concatenateAudio() {
      try {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const audioBuffer1 = await decodeAudioData(
          audioContext,
          base64EncodedAudioData1
        );
        const audioBuffer2 = await decodeAudioData(
          audioContext,
          base64EncodedAudioData2
        );
        // Calculate the total length of the concatenated audio buffer
        const totalLength = audioBuffer1.length + audioBuffer2.length;
        // Create a new buffer with the combined length
        const concatenatedBuffer = await audioContext.createBuffer(
          1, // Mono (1 channel)
          totalLength,
          audioBuffer1.sampleRate
        );
        // Get the channel data for the concatenated buffer
        const concatenatedChannelData = await concatenatedBuffer.getChannelData(
          0
        );
        // Copy data from the first audio buffer
        concatenatedChannelData.set(audioBuffer1.getChannelData(0));
        // Copy data from the second audio buffer
        concatenatedChannelData.set(
          audioBuffer2.getChannelData(0),
          audioBuffer1.length
        );
        // Convert the concatenated audio buffer back to base64
        const concatenatedBase64Data = await encodeAudioData(
          audioContext,
          concatenatedBuffer
        );
        // Store the base64 data in the state variable
        setConcatenatedBase64(concatenatedBase64Data);
      } catch (error) {
        console.error("Error:", error);
      }
    }
    async function decodeAudioData(audioContext, audioData) {
      return new Promise((resolve, reject) => {
        audioContext.decodeAudioData(
          Uint8Array.from(atob(audioData), (c) => c.charCodeAt(0)).buffer,
          resolve,
          reject
        );
      });
    }
    async function encodeAudioData(audioContext, audioBuffer) {
      return new Promise((resolve, reject) => {
        const audioData = audioBuffer.getChannelData(0);
        const audioDataLength = audioData.length;
        const wavBuffer = new ArrayBuffer(44 + audioDataLength * 2);
        const view = new DataView(wavBuffer);
        // Create a WAV header
        writeString(view, 0, "RIFF");
        view.setUint32(4, 44 + audioDataLength * 2, true);
        writeString(view, 8, "WAVE");
        writeString(view, 12, "fmt ");
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, audioBuffer.sampleRate, true);
        view.setUint32(28, audioBuffer.sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, "data");
        view.setUint32(40, audioDataLength * 2, true);
        // Write audio data
        let offset = 44;
        for (let i = 0; i < audioDataLength; i++, offset += 2) {
          const s = Math.max(-1, Math.min(1, audioData[i]));
          view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        }
        const blob = new Blob([view], { type: "audio/wav" });
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    function writeString(view, offset, string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }
    concatenateAudio();
  }, []);
  const toggleComponentVisibility = () => {
    setCheck(true);
  };
  return (
    <div>
      <h1>Concatenated Audio</h1>
      {console.log({ concatenatedBase64 })}
      {console.log({ base64EncodedAudioData1 })}
      {console.log({ base64EncodedAudioData2 })}
      <div>
        <div>
          <audio controls>
            <source
              src={`data:audio/mpeg;base64,${base64EncodedAudioData1}`}
              type="audio/mpeg"
            />
            Your browser does not support the audio element.
          </audio>
        </div>
        <div>
          <audio controls>
            <source
              src={`data:audio/mpeg;base64,${base64EncodedAudioData2}`}
              type="audio/mpeg"
            />
            Your browser does not support the audio element.
          </audio>
        </div>
        <button onClick={toggleComponentVisibility}>render</button>
        {check && <Child concatenatedBase64={concatenatedBase64} />}
      </div>
    </div>
  );
}
export default MergeAudio;
