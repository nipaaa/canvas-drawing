import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const Canvas = () => {
  const [imageBBLink, setImageBBLink] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#3B3B3B");
  const [size, setSize] = useState("3");
  const canvasRef = useRef(null);
  const ctx = useRef(null);
  const timeout = useRef(null);
  const [cursor, setCursor] = useState("default");

  useEffect(() => {
    const canvas = canvasRef.current;
    ctx.current = canvas.getContext("2d");

    canvas.height = 100;
    canvas.width = 300;

    const canvasimg = localStorage.getItem("canvasimg");
    if (canvasimg) {
      var image = new Image();
      ctx.current = canvas.getContext("2d");
      image.onload = function () {
        ctx.current.drawImage(image, 0, 0);
        setIsDrawing(false);
      };
      image.src = canvasimg;
    }
  }, [ctx]);

  const startPosition = (event) => {
    setIsDrawing(true);
    draw(event);
  };

  const movePosition = (event) => {
    if (isDrawing) {
      draw(event);
    }
  };

  const endPosition = () => {
    setIsDrawing(false);
    ctx.current.beginPath();
  };

  const draw = (event) => {
    const clientX = event.type.startsWith("touch") ? event.touches[0].clientX : event.clientX;
    const clientY = event.type.startsWith("touch") ? event.touches[0].clientY : event.clientY;

    const canvas = canvasRef.current;
    ctx.current = canvas.getContext("2d");
    ctx.current.lineWidth = size;
    ctx.current.lineCap = "round";
    ctx.current.strokeStyle = color;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.current.lineTo(x, y);
    ctx.current.stroke();
    ctx.current.beginPath();
    ctx.current.moveTo(x, y);

    if (timeout.current !== undefined) clearTimeout(timeout.current);
    timeout.current = setTimeout(function () {
      var base64ImageData = canvas.toDataURL("image/png");
      localStorage.setItem("canvasimg", base64ImageData);
    }, 400);
  };

  const clearCanvas = () => {
    localStorage.removeItem("canvasimg");
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (timeout.current !== undefined) clearTimeout(timeout.current);
    timeout.current = setTimeout(function () {
      var base64ImageData = canvas.toDataURL("image/png");
      localStorage.setItem("canvasimg", base64ImageData);
    }, 400);
  };

  const getPen = () => {
    setCursor("default");
    setSize("3");
    setColor("#3B3B3B");
  };

  const eraseCanvas = () => {
    setCursor("grab");
    setSize("20");
    setColor("#FFFFFF");

    if (!isDrawing) {
      return;
    }
  };

  const downloadImage = (event) => {
    let link = event.currentTarget;
    link.setAttribute("download", "canvas.png");
    let image = canvasRef.current.toDataURL("image/png");
    link.setAttribute("href", image);
  };

  const uploadImageToImageBB = async () => {
    const canvas = canvasRef.current;
    const base64ImageData = canvas.toDataURL("image/png").split(",")[1];

    try {
      const formData = new FormData();
      formData.append("image", base64ImageData);
      const response = await axios.post(
        "https://api.imgbb.com/1/upload?key=a7d7f71dd880a5f41e280ad8662af557",
        formData
      );

      if (response.data && response.data.data && response.data.data.url) {
        alert(
          "Image uploaded to ImageBB!\nImage URL: " + response.data.data.url
        );
        setImageBBLink(response.data.data.url);
      } else {
        alert("Failed to upload image to ImageBB.");
      }
    } catch (error) {
      console.error("Error uploading image to ImageBB:", error);
    }
  };

  useEffect(() => {
    clearCanvas();
  }, []);

  return (
    <div
      style={{ height: "90vh" }}
      className="d-flex flex-column justify-content-center"
    >
      <p className="text-center text-primary">
        *** Give your sign and save it to imagebb ***
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div>
          <canvas
            style={{
              cursor: cursor,
              overflow: "hidden",
              border: "1px solid red",
            }}
            onTouchStart={startPosition}
            onTouchMove={movePosition}
            onTouchEnd={endPosition}
            onMouseDown={startPosition}
            onMouseMove={movePosition}
            onMouseUp={endPosition}
            ref={canvasRef}
          />
        </div>
      </div>
      <div className="d-flex gap-4 justify-content-center mt-2">
        <button onClick={clearCanvas} className="btn btn-danger">
          Clear
        </button>
        <button className="btn btn-success" onClick={uploadImageToImageBB}>
          Upload
        </button>
      </div>
      <p className="text-center text-sm text-success mt-3">{imageBBLink}</p>
    </div>
  );
};

export default Canvas;
