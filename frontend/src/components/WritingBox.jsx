import '../App.css';
import { useRef, useState } from 'react';

/*
* <summary>
* Freehand writing component
*   -> user can draw anywhere inside the box
*   -> shows handwriting guide lines
*   -> supports mouse, touch, pen
*   -> includes a clear button to reset drawing
* </summary>
*/


const WritingBox = ({ width=360, height=180}) => {
    const svgRef = useRef(null);
    const [userPath, setUserPath] = useState('');
    const [isWriting, setIsWriting] = useState(false);

    const getSVGPoint = (e) => {
        const svg = svgRef.current;
        if(!svg) return {x: 0, y: 0};
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        return pt.matrixTransform(svg.getScreenCTM().inverse());
    };

    const handlePointerDown = (e) => {
        e.preventDefault();
        const { x, y } = getSVGPoint(e);
        setUserPath(`M ${x} ${y}`);
        setIsWriting(true);
    };

    const handlePointerMove = (e) => {
        if(!isWriting) return;
        const { x, y } = getSVGPoint(e);
        setUserPath((prev) => `${prev} L ${x} ${y}`);
    };

    const handlePointerUp = () => {
        setIsWriting(false);
    };

    const clearDrawing = () => {
        setUserPath('');
    }

    return (
        <div className="writing-box" style={{ width, height }}>
            <button className="clear-btn" onClick={clearDrawing}>
                Clear
            </button>
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
                    d={userPath}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
         </div>
    )
}

export default WritingBox;