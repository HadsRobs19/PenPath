import { useRef, useState } from "react";

// Renders the image centered and contained, user pans + zooms, confirm crops what's visible in the frame
export default function ImageCropper({ image, onConfirm, onCancel }) {
  const frameRef = useRef(null);
  const imgRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [lastPos, setLastPos] = useState(null);

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e) => {
    if (!lastPos) return;
    setOffset((prev) => ({
      x: prev.x + (e.clientX - lastPos.x),
      y: prev.y + (e.clientY - lastPos.y),
    }));
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = () => setLastPos(null);

  const handleConfirm = () => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img) return;

    const frameRect = frame.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;

    const cropX = Math.max(0, (frameRect.left - imgRect.left) * scaleX);
    const cropY = Math.max(0, (frameRect.top - imgRect.top) * scaleY);
    const cropW = Math.min(frameRect.width * scaleX, img.naturalWidth - cropX);
    const cropH = Math.min(frameRect.height * scaleY, img.naturalHeight - cropY);

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, cropW);
    canvas.height = Math.max(1, cropH);
    canvas.getContext("2d").drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    onConfirm(canvas.toDataURL("image/jpeg", 0.9));
  };

  return (
    <div style={s.overlay}>
      <div style={s.header}>
        <button style={s.cancelBtn} onClick={onCancel}>Cancel</button>
        <span style={s.title}>Crop & Resize</span>
        <button style={s.confirmBtn} onClick={handleConfirm}>Scan</button>
      </div>

      <div
        ref={frameRef}
        style={s.frame}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <img
          ref={imgRef}
          src={image}
          draggable={false}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
            transformOrigin: "center center",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      </div>

      <div style={s.controls}>
        <span style={s.label}>Zoom</span>
        <input
          type="range"
          min={1} max={4} step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          style={s.slider}
        />
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: "fixed", inset: 0,
    backgroundColor: "#000",
    zIndex: 100,
  },
  header: {
    position: "absolute", top: 0, left: 0, right: 0,
    height: 48,
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    backgroundColor: "#111",
    zIndex: 2,
  },
  title: { color: "#fff", fontWeight: 700, fontSize: 16 },
  cancelBtn: {
    background: "transparent", border: "none",
    color: "#aaa", fontSize: 15, cursor: "pointer",
  },
  confirmBtn: {
    background: "#2563EB", border: "none",
    color: "#fff", fontSize: 15, fontWeight: 700,
    borderRadius: 20, padding: "6px 20px", cursor: "pointer",
  },
  frame: {
    position: "absolute",
    top: 48, left: 0, right: 0, bottom: 64,
    overflow: "hidden",
    cursor: "grab",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    height: 64,
    display: "flex", alignItems: "center", gap: 12,
    padding: "0 24px",
    backgroundColor: "#111",
    zIndex: 2,
  },
  label: { color: "#fff", fontSize: 13, flexShrink: 0 },
  slider: { flex: 1 },
};
