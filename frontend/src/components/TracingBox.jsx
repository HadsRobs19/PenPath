import '../App.css';

const TracingBox = ({ svgPath, width=320, height=140 }) => {
    return (
        <div
            className="tracing-box"
            style={{ width, height }}
        >
            <div className="guide-line ascender" />
            <div className="guide-line midline" />
            <div className="guide-line baseline" />

            <svg
                className="tracing-svg"
                viewBox=" 0 0 300 120"
                preserveAspectRatio="none"
            >
                <path
                    d={svgPath}
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="4"
                    strokeDasharray="6 12"
                    strokeLinecap="round"
                   /> 
            </svg>
        </div>
    );
};

export default TracingBox;