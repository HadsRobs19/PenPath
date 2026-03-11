import "../App.css";
import { useRef, useState } from "react";
import { forwardRef, useImperativeHandle } from "react";

const WritingBox = forwardRef(({ width = 360, height = 180 }, ref) => {

  const svgRef = useRef(null);

  const [userPath, setUserPath] = useState("");
  const [isWriting, setIsWriting] = useState(false);

  const [strokes, setStrokes] = useState([]);
  const currentStroke = useRef([]);

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

      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8"
      });

      const url = URL.createObjectURL(svgBlob);

      return new Promise(resolve => {

        img.onload = () => {

          ctx.drawImage(img,0,0);

          canvas.toBlob(blob => {

            resolve(blob);

            URL.revokeObjectURL(url);

          },"image/png");

        };

        img.src = url;

      });

    },

    exportJSON: () => {
      return JSON.stringify({
        strokes
      });
    }

  }));

  const getSVGPoint = (e) => {

    const svg = svgRef.current;

    if (!svg) return {x:0,y:0};

    const pt = svg.createSVGPoint();

    pt.x = e.clientX;
    pt.y = e.clientY;

    return pt.matrixTransform(svg.getScreenCTM().inverse());

  };

  const handlePointerDown = (e) => {

    e.preventDefault();

    const {x,y} = getSVGPoint(e);

    setUserPath(`M ${x} ${y}`);
    setIsWriting(true);

    currentStroke.current = [{x,y,t:Date.now()}];

  };

  const handlePointerMove = (e) => {

    if(!isWriting) return;

    const {x,y} = getSVGPoint(e);

    setUserPath(prev => `${prev} L ${x} ${y}`);

    currentStroke.current.push({
      x,
      y,
      t:Date.now()
    });

  };

  const handlePointerUp = () => {

    setIsWriting(false);

    setStrokes(prev => [...prev,currentStroke.current]);

    currentStroke.current = [];

  };

  const clearDrawing = () => {

    setUserPath("");
    setStrokes([]);

  };

  return (

    <div className="writing-box" style={{width,height}}>

      <button className="clear-btn" onClick={clearDrawing}>
        Clear
      </button>

      <div className="guide-line ascender"/>
      <div className="guide-line midline"/>
      <div className="guide-line baseline"/>

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

  );

});

export default WritingBox;