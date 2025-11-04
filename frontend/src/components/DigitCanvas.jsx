// DigitCanvas.jsx
import React, { useRef, useEffect, useState } from "react";

export default function DigitCanvas({ backendUrl = "http://localhost:5000" }) {
  const canvasRef = useRef(null);
  const [result, setResult] = useState(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // make background black
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.strokeStyle = "white";
  }, []);

  // Drawing handlers
  const startPos = useRef({ x: 0, y: 0, drawing: false });

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
    return { x, y };
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

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setResult(null);
  };

  const handlePredict = async () => {
    // Convert canvas to blob
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      const fd = new FormData();
      fd.append("file", blob, "digit.png");
      try {
        const resp = await fetch(`${backendUrl}/predict`, {
          method: "POST",
          body: fd,
        });
        const data = await resp.json();
        if (resp.ok) {
          setResult(data);
        } else {
          setResult({ error: data.error || "Prediction failed" });
        }
      } catch (err) {
        setResult({ error: err.message });
      }
    }, "image/png");
  };

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
        <button className="bg-gray-700 h-10 w-34 rounded-xl border-b-black text-amber-50 hover:bg-gray-800" onClick={handlePredict} style={{ marginRight: 8 }}>Predict</button>
        <button className="bg-gray-700 h-10 w-34 rounded-xl text-amber-50 hover:bg-gray-800" onClick={clearCanvas}>Clear</button>
      </div>

      <div style={{ marginTop: 12 }}>
        {result ? (
          result.error ? (
            <div style={{ color: "crimson" }}>Error: {result.error}</div>
          ) : (
            <div>
              <h3>Predicted: {result.predicted}</h3>
              {/* <div>Model input shape: {JSON.stringify(result.model_input_shape)}</div> */}
              {/* <div>
                Probabilities: {result.probabilities?.slice(0, 10).map((p, i) => (
                  <div key={i}>{i}: {p.toFixed(3)}</div>
                ))}
              </div> */}
            </div>
          )
        ) : (
          <div>Draw a digit and click Predict</div>
        )}
      </div>
    </div>
  );
}
