import { useEffect, useRef, useState } from "react";

function App() {
  const videoRef = useRef(null);
  const [image, setImage] = useState("")

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    startCamera()
  }, [])

  async function clickPhoto() {
    const canvas = document.createElement("canvas");

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      videoRef.current,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const imageBlob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg")
    );

    const imageUrl = URL.createObjectURL(imageBlob);
    setImage(imageUrl)
  }



  return (
    <>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        width={500}
      />

      <img src={image} alt="" />

      <button onClick={() => { clickPhoto() }}>scan</button>

    </>


  );
}

export default App;