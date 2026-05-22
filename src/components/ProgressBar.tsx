import React from "react";
import Button from "./Button";

interface ProgressBarProps {
  progress: number;
  label: string;
  resetFunction : ()=>void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label,resetFunction }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-end">
        <div className="text-[#B0B0B0] text-xs mb-1">{label}: {Math.round(progress)}%</div>
        {progress > 0 && (
          <Button
            variant="outline"
            onClick={resetFunction}
            className="mb-1 min-h-9 px-3 py-1 text-xs rounded-full"
          >
            Reiniciar
          </Button>
        )}
      </div>
      <div className="w-full bg-[#4A4A4A] rounded-full h-2.5">
        <div className="bg-[#34C759] h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default ProgressBar;