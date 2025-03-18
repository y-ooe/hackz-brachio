"use client";

import Webcam from "react-webcam";
import axios from "axios";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const ENDPOINT = process.env.NEXT_PUBLIC_S3_ENDPOINT;
const gameId = nanoid();

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user"
};

const decodeBase64toJpg = (image) => {
  const blob = atob(image.replace(/^.*,/, ''));
  let buffer = new Uint8Array(blob.length);
  for (let i = 0; i < blob.length; i++) {
    buffer[i] = blob.charCodeAt(i);
  }

  const d = new Date();
  const fileName = gameId + d.getTime();

  return new File([buffer.buffer], fileName, {type: 'image/jpg'});
}

const fileUpload = async (image) => {
  try {
    const fileName = image.name
    const contentType = image.type

    const reader = new FileReader();
    reader.readAsArrayBuffer(image);
    await new Promise((resolve) => (reader.onload = () => resolve()));
    
    console.log("fileUploading");
    // アップロード
    await axios.put(
      `${ENDPOINT}/${fileName}`,
      reader.result,
      {
        headers: {
          "Content-Type": contentType
        }
      }
    );
    console.log('fileUploaded');
  } catch (error) {
      alert(error)
  }
}

export default function Game() {
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const router = useRouter();
  const webcamRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [seconds, setSeconds] = useState(23);

  useEffect(() => {
    window.addEventListener('resize', () => {
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
    });
  }, []);

  /**
   * base64で撮影後jpgにデコードして送信
   */
  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const image = decodeBase64toJpg(imageSrc);
  
    console.log(image);
    fileUpload(image);
  }, [webcamRef]);

  /**
   * タイマー
   */
  useEffect(() => {
    if (seconds >= 0 && gameStarted) {
      const timerId = setTimeout(() => setSeconds(seconds - 1), 1000);
      if (seconds % 4 == 0 && seconds < 20) {
        console.log("capture");
        capture();
      }
      
      // 終了時resultに遷移
      console.log(seconds);
      if (seconds == 0) {
        router.push(`/result?gameId=${gameId}`);
      }

      return () => clearTimeout(timerId);
    }
  }, [gameStarted, seconds, router]);

  return (
    <div className="container d-flex justify-content-center" style={{width: windowWidth}}>
      <div className="d-flex align-items-center" style={{height: windowHeight}}>
        <div className="d-flex flex-column">
          <Webcam
            ref={webcamRef}
            audio={false}
            height={480}
            screenshotFormat="image/jpg"
            width={640}
            videoConstraints={videoConstraints}
          >
          </Webcam>
          {gameStarted
            ? <div className="text-center">{seconds == 20 ? 'START' : seconds % 4}</div>
            : <button className="btn" onClick={() => {setGameStarted(true)}}>READY</button>
          }
        </div>
      </div>
    </div>
  );
}
