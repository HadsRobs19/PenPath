import '../App.css';
import { useRef, useState } from 'react';

const ACCURACY_RADIUS = 18;

/*
* <summary>
* Interactive SVG tracing component for letters or shapes
*   -> displays handwriting guide lines (ascender, midline, baseline)
*   -> renders an animated dashed guide path with direction arrow
*   -> shows a green start dot indicating where tracing should begin
*   -> tracks pointer input (touch, pen, mouse) to draw a user path
*   -> checks real-time accuracy against the guide path using distance tolerance
*   -> dynamically colors the guide path green/red based on tracing accuracy
*   -> hides guidance indicators once tracing begins
*   -> supports customizable width and height for different letter sizes
* </summary>
*/


const TracingBox = ({ svgPath, width = 360, height = 180 }) => {
  const svgRef = useRef(null);
  const guidePathRef = useRef(null);

  const [userPath, setUserPath] = useState('');
  const [isTracing, setIsTracing] = useState(false);
  const [accuracy, setAccuracy] = useState('idle');

  const getSVGPoint = (e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };

  const getPathPoint = (pathEl, distance) => {
    const len = pathEl.getTotalLength();
    return pathEl.getPointAtLength(Math.min(distance, len));
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
    setAccuracy(close ? 'good' : 'bad');
  };

  const handlePointerUp = () => {
    setIsTracing(false);
    setAccuracy('idle');
  };

  /* create a clear starting point to begin tracing: user base is new and children to dumb it down */
  const startPoint =
    guidePathRef.current && getPathPoint(guidePathRef.current, 0);

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
        {/* arrow directional lines to show users where to follow */}
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#9CA3AF" />
          </marker>
        </defs>

        {/* Tracing starting point */}
        {startPoint && !isTracing && (
          <circle
            cx={startPoint.x}
            cy={startPoint.y}
            r="6"
            fill="#22C55E"
          />
        )}

        {/* Guided tracing path */}
        <path
          ref={guidePathRef}
          d={svgPath}
          fill="none"
          stroke={
            accuracy === 'good'
              ? '#22C55E'
              : accuracy === 'bad'
              ? '#EF4444'
              : '#9CA3AF'
          }
          strokeWidth="4"
          strokeDasharray="6 12"
          strokeLinecap="round"
          markerEnd={!isTracing ? 'url(#arrow)' : undefined}
          className="trace-path"
        />

        {/* User traced path */}
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
};

export default TracingBox;
