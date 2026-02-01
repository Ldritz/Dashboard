export default function JarvisCore() {
    return (
      <div className="relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40 mx-auto">
        {/* Outer Ring - Slow Rotation */}
        <div className="absolute inset-0 rounded-full border border-cyan-500/30 border-t-cyan-400 border-r-transparent border-b-cyan-400 border-l-transparent animate-[spin_10s_linear_infinite]"></div>
        
        {/* Inner Dashed Ring - Medium Reverse Rotation */}
        <div className="absolute inset-2 rounded-full border-2 border-dashed border-cyan-500/20 animate-[spin_15s_linear_infinite_reverse]"></div>
        
        {/* Middle Tech Ring - Fast Rotation */}
        <div className="absolute inset-4 rounded-full border border-cyan-500/40 border-t-cyan-300 border-r-transparent animate-[spin_3s_linear_infinite]"></div>
  
        {/* Core Glow */}
        <div className="absolute inset-8 rounded-full bg-cyan-500/10 backdrop-blur-sm border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-pulse"></div>
        
        {/* Center Eye */}
        <div className="absolute inset-12 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee]"></div>
  
        {/* Decorative Compass Ticks */}
        <div className="absolute inset-0">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-cyan-600"></div>
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-cyan-600"></div>
           <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-cyan-600"></div>
           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-cyan-600"></div>
        </div>
      </div>
    );
  }
