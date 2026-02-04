import '../App.css';
import { useRef, useState } from 'react';
const ACCURACY_RADIUS = 18;

/*
* <summary>
* Interactive SVG tracing component for letters or shapes
*   -> displays guide lines and a dashed path to trace
*   -> tracks user pointer movements to draw a path and check accuracy against the guide
*   -> dynamically colors guide path green/red based on tracing accuracy
*   -> supports customizable width and height, with pointer events for drawing and real-time feedback
*/

const TracingBox = ({ svgPath, width = 360, height = 180 }) => {
    const svgRef = useRef(null);
    const guidePathRef = useRef(null);

    const [userPath, setUserPath] = useState('');
    const [isTracing, setIsTracing] = useState(false);
    const [accuracy, setAccuracy] = useState('idle')

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
        const length = path.getTotalLength();

        for(let i = 0; i < length; i += 4){
            const pt = path.getPointAtLength(i);
            const dx = pt.x - x;
            const dy = pt.y - y;
        
            if(Math.sqrt(dx * dx + dy * dy) < ACCURACY_RADIUS){
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
