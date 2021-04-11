import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

async function requestRecorder() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  return new MediaRecorder(stream);
}

function App() {
  // let [audioURL, isRecording, startRecording, stopRecording] = useRecorder();
  const [audioURL, setAudioURL] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [data, setData] = useState(null);
  const [textResult, setTextResult] = useState("");

  useEffect(() => {
    // Lazily obtain recorder first time we're recording.
    if (recorder === null) {
      if (isRecording) {
        requestRecorder().then(setRecorder, console.error);
      }
      return;
    }

    // Manage recorder state.
    if (isRecording) {
      recorder.start();
    } else {
      recorder.stop();
    }

    // Obtain the audio when ready.
    const handleData = (e) => {
      // console.log(e)
      setAudioURL(URL.createObjectURL(e.data));
      setData(e.data);
    };

    recorder.addEventListener("dataavailable", handleData);
    return () => recorder.removeEventListener("dataavailable", handleData);
  }, [recorder, isRecording]);

  // console.log(audioURL);

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const handleOnClick = async () => {
    setTimeout(100);
    console.log(data.toString())
    await axios
      .post('http://127.0.0.1:5000/api/asr', data.toString())
      .then((res) => {
        setTextResult(res.data.text);
      })
      .catch((err) => {
        setTextResult("error");
      });
  };

  return (
    <div className="App">
      <div className="line">
        <div className="line2">
          <audio src={audioURL} controls />
        </div>
        <div className="line2">
          <button onClick={startRecording} disabled={isRecording}>
            start recording
          </button>
          <button onClick={stopRecording} disabled={!isRecording}>
            stop recording
          </button>
        </div>
      </div>
      <div className="line">
        <a href={audioURL} onClick={() => handleOnClick()} download="filename.weba">
          Click here to analyze
        </a>
      </div>
      <div className="line">Result: {textResult}</div>
    </div>
  );
}

export default App;
