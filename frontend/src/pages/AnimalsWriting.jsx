import "../App.css";
import { useRef, useState } from "react";
import { forwardRef, useImperativeHandle } from "react";

const ACCURACY_RADIUS = 18;

const TracingBox = forwardRef(
({ svgPath, onComplete, width = 360, height = 180 }, ref) => {

  const svgRef = useRef(null);
  const guidePathRef = useRef(null);

  const [userPath, setUserPath] = useState("");
  const [isTracing, setIsTracing] = useState(false);
  const [accuracy, setAccuracy] = useState("idle");

  useImperativeHandle(ref, () => ({
    exportDrawing: async () => {
      const svg = svgRef.current;
      if (!svg) return null;

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      const img = new Image();
      const blob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8"
      });

      const url = URL.createObjectURL(blob);

      return new Promise((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((b) => {
            resolve(b);
            URL.revokeObjectURL(url);
          }, "image/png");
        };

        img.src = url;
      });
    }
  }));

  const getSVGPoint = (e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };

  const isPointNearPath = (x, y) => {
    const path = guidePathRef.current;
    if (!path) return false;

    const length = path.getTotalLength();

    for (let i = 0; i < length; i += 4) {
      const pt = path.getPointAtLength(i);
      const dx = pt.x - x;
      const dy = pt.y - y;

      if (Math.sqrt(dx * dx + dy * dy) < ACCURACY_RADIUS) {
        return true;
      }
    }

    return false;
  };

  const handlePointerDown = (e) => {
    e.preventDefault();

    const { x, y } = getSVGPoint(e);
    setUserPath(`M ${x} ${y}`);
    setIsTracing(true);
  };

  const handlePointerMove = (e) => {
    if (!isTracing) return;

    const { x, y } = getSVGPoint(e);

    setUserPath((prev) => `${prev} L ${x} ${y}`);

    const close = isPointNearPath(x, y);
    setAccuracy(close ? "good" : "bad");
  };

  const handlePointerUp = () => {
    setIsTracing(false);

    if (accuracy === "good") {
      onComplete?.();
    }

    setAccuracy("idle");
  };

  const startPoint =
    guidePathRef.current &&
    guidePathRef.current.getPointAtLength(0);

  return (
    <div className="tracing-box" style={{ width, height }}>
      <div className="guide-line ascender" />
      <div className="guide-line midline" />
      <div className="guide-line baseline" />

      <svg
        ref={svgRef}
        className="tracing-svg"
        viewBox="0 0 300 180"
        preserveAspectRatio="none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <path
          ref={guidePathRef}
          d={svgPath}
          fill="none"
          stroke={
            accuracy === "good"
              ? "#22C55E"
              : accuracy === "bad"
              ? "#EF4444"
              : "#9CA3AF"
          }
          strokeWidth="4"
          strokeDasharray="6 12"
          strokeLinecap="round"
        />

        <path
          d={userPath}
          fill="none"
          stroke="#2563EB"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
});

export default TracingBox;