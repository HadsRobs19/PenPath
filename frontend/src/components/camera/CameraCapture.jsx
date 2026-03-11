import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: { ideal: 'environment' },
};

/**
 * CameraCapture
 * Props:
 *   onCapture(dataUrl: string) — called with the captured image as a base64 data URL
 *   onClose()                  — called when the user dismisses the camera
 */
const CameraCapture = ({ onCapture, onClose }) => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const handleCapture = useCallback(() => {
    const dataUrl = webcamRef.current?.getScreenshot();
    if (dataUrl) setCapturedImage(dataUrl);
  }, []);

  const handleRetake = () => setCapturedImage(null);

  const handleConfirm = () => {
    if (capturedImage && onCapture) onCapture(capturedImage);
  };

  const handleCameraError = (error) => {
    console.error('Camera error:', error);
    setCameraError('Camera access denied or unavailable. Please check your browser permissions.');
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span style={styles.title}>Scan Document</span>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close camera">✕</button>
        </div>

        {cameraError ? (
          <div style={styles.errorBox}>
            <p>{cameraError}</p>
            <button style={{ ...styles.btn, ...styles.primaryBtn }} onClick={onClose}>Close</button>
          </div>
        ) : capturedImage ? (
          <>
            <img src={capturedImage} alt="Captured document" style={styles.preview} />
            <div style={styles.actions}>
              <button style={{ ...styles.btn, ...styles.secondaryBtn }} onClick={handleRetake}>Retake</button>
              <button style={{ ...styles.btn, ...styles.primaryBtn }} onClick={handleConfirm}>Use Photo</button>
            </div>
          </>
        ) : (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMediaError={handleCameraError}
              style={styles.webcam}
            />
            <div style={styles.actions}>
              <button style={{ ...styles.btn, ...styles.primaryBtn }} onClick={handleCapture}>Capture</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    width: '100%',
    maxWidth: '680px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: '18px', fontWeight: '600' },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  webcam: { width: '100%', borderRadius: '8px' },
  preview: { width: '100%', borderRadius: '8px', objectFit: 'contain' },
  actions: { display: 'flex', gap: '12px', justifyContent: 'center' },
  btn: {
    padding: '10px 24px',
    fontSize: '15px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
  },
  primaryBtn: { background: 'linear-gradient(135deg, #B2F7FF, #98AEFD)', color: '#1a1a2e' },
  secondaryBtn: { background: '#f0f0f0', color: '#333' },
  errorBox: { textAlign: 'center', padding: '20px', color: '#c0392b' },
};

export default CameraCapture;
