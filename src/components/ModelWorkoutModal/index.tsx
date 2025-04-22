import modelImg from '../../../public/maleModel.jpg';
import React, { useEffect, useState } from 'react';
import { musclesData } from './consts';

interface Muscle {
  name: string;
  nameEs: string;
  aliases: string[];
  path: string;
  active: boolean;
}

interface ModelWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  musclesToShow?: string[];
}

const ModelWorkoutModal: React.FC<ModelWorkoutModalProps> = ({ isOpen, onClose, musclesToShow = [] }) => {
  const [muscles, setMuscles] = useState<Muscle[]>(musclesData);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const normalizeText = (text: string): string => {
    return text
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  useEffect(() => {
    if (musclesToShow && musclesToShow.length > 0) {
      const normalizedMusclesToShow = musclesToShow.map(normalizeText);

      const updatedMuscles = muscles.map((muscle) => {
        const normalizedMuscleName = normalizeText(muscle.name);
        const normalizedMuscleNameEs = normalizeText(muscle.nameEs);
        const normalizedAliases = muscle.aliases.map(normalizeText);

        const isActive = normalizedMusclesToShow.some((muscleToShow) =>
          [normalizedMuscleName, normalizedMuscleNameEs, ...normalizedAliases].includes(muscleToShow)
        );

        return { ...muscle, active: isActive };
      });

      setMuscles(updatedMuscles);
    } else {
      setMuscles(muscles.map((muscle) => ({ ...muscle, active: false })));
    }
  }, [musclesToShow]);

  const handleClick = (e: React.MouseEvent<SVGPathElement>, muscleName: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + 10; // Desplazado ligeramente a la derecha
    const y = e.clientY - rect.top - 15; // Desplazado arriba del punto de clic
    setTooltip({ text: muscleName, x, y });
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Cierra el tooltip si se hace clic fuera del SVG
    if (e.target === e.currentTarget) {
      setTooltip(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-2 sm:p-4 transition-opacity duration-300 ease-in-out"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg flex flex-col shadow-lg overflow-hidden transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-100 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">Activación Muscular</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-200 transition-colors duration-200 focus:outline-none"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-white">
          <div className="relative w-full h-full flex justify-center items-center">
            <svg
              id="man_pic"
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
              viewBox="0 0 700 800"
              className="w-full max-w-[300px] sm:max-w-[400px] drop-shadow-sm"
              preserveAspectRatio="xMidYMid meet"
            >
              <image xlinkHref={modelImg} width="700" height="800" className="opacity-85" />
              {muscles.map((muscle, index) => (
                <path
                  key={index}
                  className={`stroke-gray-600 stroke-1 cursor-pointer transition-all duration-300 ease-in-out ${
                    muscle.active
                      ? 'fill-green-500/70 hover:fill-green-600/80'
                      : 'fill-red-500/30 hover:fill-red-600/50'
                  }`}
                  d={muscle.path}
                  onClick={(e) => handleClick(e, muscle.nameEs)} // Tooltip aparece al hacer clic
                />
              ))}
            </svg>

            {/* Tooltip */}
            {tooltip && (
              <div
                className="absolute bg-gray-800 text-white rounded-md p-1.5 sm:p-2 shadow-md text-xs sm:text-sm font-medium max-w-[150px] sm:max-w-[200px] break-words pointer-events-none transition-opacity duration-200 ease-in-out"
                style={{ left: tooltip.x, top: tooltip.y }}
              >
                <h3 className="italic">{tooltip.text}</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelWorkoutModal;