import React from 'react';

const Button = ({ 
    onClick, 
    children, 
    type='button', 
    disabled=false,
    className=''
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`primary-button ${className}`}
            style={{ 
                padding: '10px 20px', 
                fontSize: '16px', 
                cursor: disabled ? 'not-allowed' : 'pointer'
            }}
        >
            {children}
        </button>
    )
}

export default Button;