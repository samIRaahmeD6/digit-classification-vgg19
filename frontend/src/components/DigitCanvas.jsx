// DigitCanvas.jsx
import React, { useRef, useEffect, useState } from "react";

export default function DigitCanvas() {
  // ✅ Use the correct backend root URL
  const backendUrl = "https://digit-classification-vgg19.onrender.com";

  const canvasRef = useRef(null);
  const [result, setResult] = useState(null);

  // 🧠 Initialize the drawing canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.strokeStyle = "white";
  }, []);

  // 📍 Track drawing start position
  const startPos = useRef({ x: 0, y: 0, drawing: false });

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const onPointerDown = (e) => {
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    startPos.current = { ...pos, drawing: true };
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp, { once: true });

    e.preventDefault();
  };

  const onPointerMove = (e) => {
    if (!startPos.current.drawing) return;
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const onPointerUp = () => {
    startPos.current.drawing = false;
    window.removeEventListener("pointermove", onPointerMove);
  };

  // 🧹 Clear canvas
  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setResult(null);
  };

  // 🤖 Handle prediction
  const handlePredict = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append("file", blob, "digit.png");

      try {
        const response = await fetch(`${backendUrl}/predict`, {
          method: "POST",
          body: formData,
        });

        // Try to parse the response safely
        const data = await response.json().catch(() => ({}));

        if (response.ok) {
          setResult(data);
        } else {
          setResult({ error: data.error || `Request failed (${response.status})` });
        }
      } catch (error) {
        setResult({ error: error.message });
      }
    }, "image/png");
  };

  // 🖼️ UI Section
  return (
    <div className="flex flex-col items-center p-4">
      <canvas
        ref={canvasRef}
        width={280}
        height={280}
        style={{
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          touchAction: "none",
        }}
        onPointerDown={onPointerDown}
      />
      <div style={{ marginTop: 12 }}>
        <button
          className="bg-gray-700 h-10 w-34 rounded-xl text-amber-50 hover:bg-gray-800"
          onClick={handlePredict}
          style={{ marginRight: 8 }}
        >
          Predict
        </button>
        <button
          className="bg-gray-700 h-10 w-34 rounded-xl text-amber-50 hover:bg-gray-800"
          onClick={clearCanvas}
        >
          Clear
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        {result ? (
          result.error ? (
            <div style={{ color: "crimson" }}>Error: {result.error}</div>
          ) : (
            <div>
              <h3>Predicted: {result.predicted}</h3>
            </div>
          )
        ) : (
          <div>Draw a digit and click Predict</div>
        )}
      </div>
    </div>
  );
}
