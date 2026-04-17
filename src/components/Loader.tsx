import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#1A1A1A] opacity-80 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#34C759] border-solid"></div>
        <p className="mt-4 text-[#B0B0B0] text-sm">Cargando...</p>
      </div>
    </div>
  );
};

interface SmallLoaderProps {
  classNameLoader?: string;
}

export const SmallLoader: React.FC<SmallLoaderProps> = ({ classNameLoader }) => {
  return (
    <div className={"flex flex-col items-center "+classNameLoader}>
      <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-[#34C759] border-solid"></div>
    </div>
  );
};

export const FuturisticLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#1A1A1A] opacity-80 flex items-center justify-center z-50 ">
      {/* Círculo principal giratorio */}
      <div className="w-10 h-10 border-4 border-t-[#34C759] border-l-[#34C759] border-b-[#2D2D2D] border-r-[#2D2D2D] rounded-full animate-spin-fast relative">
        {/* Pulsación */}
        <div className="absolute inset-0 rounded-full bg-[#34C759] opacity-20 animate-pulse-fast"></div>
      </div>

      {/* Líneas de escaneo tecnológico */}
      <div className="absolute w-16 h-1 bg-[#34C759] opacity-50 animate-scan-left"></div>
      <div className="absolute w-16 h-1 bg-[#34C759] opacity-50 animate-scan-right"></div>

      {/* Texto futurista */}
      <span className="absolute text-xs font-semibold text-[#34C759] mt-12 tracking-wider animate-pulse">
        PROCESANDO IA...
      </span>
    </div>
  );
};

export default Loader;