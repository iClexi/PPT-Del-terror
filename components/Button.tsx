import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "font-arcade text-sm py-3 px-6 rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 transition-all border-2";
  
  let variantStyle = "";
  switch (variant) {
    case 'primary':
      variantStyle = "bg-blue-600 border-blue-400 text-white hover:bg-blue-500";
      break;
    case 'danger':
      variantStyle = "bg-red-600 border-red-400 text-white hover:bg-red-500";
      break;
    case 'success':
      variantStyle = "bg-green-600 border-green-400 text-white hover:bg-green-500";
      break;
  }

  return (
    <button className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
      {children}
    </button>
  );
};