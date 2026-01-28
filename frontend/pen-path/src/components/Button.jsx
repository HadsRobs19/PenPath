import React from 'react';

const Button = ({ onClick, children, type='button', disabled=false }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={{ padding: '10px 20px', fontSize: '16px', cursor: disabled ? 'not-allowed' : 'pointer'}}
        
        />
    )
}

export default Button;