import "../App.css";
import { useNavigate } from 'react-router-dom';

const ScanUpload = () => {
    const navigate = useNavigate();

    return (
        <div className="account-bg">
            <div className="account-heading">
                <h1>Scan</h1>
            </div>

            <div style={styles.container}>
                <button
                    style={{ ...styles.btn, ...styles.primaryBtn }}
                    onClick={() => navigate('/scan/camera')}
                >
                    Use Camera
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        marginTop: '32px',
    },
    btn: {
        padding: '12px 32px',
        fontSize: '16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '500',
    },
    primaryBtn: { background: 'linear-gradient(135deg, #B2F7FF, #98AEFD)', color: '#1a1a2e' },
};

export default ScanUpload;