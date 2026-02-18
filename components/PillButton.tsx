
import React from 'react';

interface PillButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const PillButton: React.FC<PillButtonProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-6 py-2.5 rounded-full border text-sm font-medium transition-all duration-300
        ${isActive 
          ? 'bg-gradient-tech text-white border-transparent shadow-md transform scale-105' 
          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-500'
        }
      `}
    >
      {label}
    </button>
  );
};

export default PillButton;
