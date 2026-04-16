
import React from 'react';

interface AudioVisualizerProps {
  inputVolume: number; // 0-255
  outputVolume: number; // 0-255
  isConnected: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ inputVolume, outputVolume, isConnected }) => {
  const micScale = 1 + (inputVolume / 255) * 1.5;
  const aiScale = 1 + (outputVolume / 255) * 2.2;

  return (
    <div className="relative flex items-center justify-center h-64 w-64 md:h-80 md:w-80">
      {/* Background Glow */}
      <div className={`absolute inset-0 rounded-full bg-emerald-500/10 blur-3xl transition-all duration-1000 ${isConnected ? 'opacity-30 scale-150' : 'opacity-0 scale-100'}`}></div>
      
      {/* AI Voice Rings */}
      <div 
        className="absolute inset-0 rounded-full border-2 border-[#00AEEF]/20 transition-transform duration-150"
        style={{ transform: `scale(${isConnected ? aiScale : 1})` }}
      ></div>
      
      {/* User Voice Rings */}
      <div 
        className="absolute inset-4 rounded-full border-2 border-blue-400/20 transition-transform duration-100"
        style={{ transform: `scale(${isConnected ? micScale : 1})` }}
      ></div>

      {/* Core AI Bot Orb with NCPL Logo */}
      <div className={`relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-2xl transition-all duration-700
        ${isConnected ? 'ring-4 ring-[#00AEEF]/50 scale-105 bg-slate-900' : 'grayscale opacity-60 bg-slate-800'}
      `}>
         <div className="w-full h-full flex items-center justify-center p-6">
            {/* NCPL Logo Symbol */}
            <div className="relative w-full h-full flex flex-wrap rounded shadow-md overflow-hidden border-2 border-white/20">
              <div className="w-1/2 h-1/2 bg-[#EF4444]"></div>
              <div className="w-1/2 h-1/2 bg-[#FBBF24]"></div>
              <div className="w-1/2 h-1/2 bg-[#00AEEF]"></div>
              <div className="w-1/2 h-1/2 bg-[#22C55E]"></div>
              <div className="absolute inset-0 flex items-center justify-center font-black text-white text-3xl md:text-5xl leading-none select-none drop-shadow-lg">N</div>
            </div>
         </div>

         {/* Overlay Waveform when speaking */}
         {isConnected && (outputVolume > 10) && (
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent flex items-end justify-center pb-6 gap-1.5 px-4">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-1 bg-[#00AEEF] rounded-full animate-bounce shadow-[0_0_8px_#00AEEF]"
                  style={{ height: `${20 + Math.random() * 60}%`, animationDelay: `${i * 0.12}s`, animationDuration: '0.6s' }}
                />
              ))}
           </div>
         )}
      </div>
    </div>
  );
};

export default AudioVisualizer;
