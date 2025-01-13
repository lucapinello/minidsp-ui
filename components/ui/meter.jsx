import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export const Meter = ({ 
  rmsLevel = -60,
  peakLevel = -60,
  className,
  testId,
  height = 120
}) => {
  const [peakHold, setPeakHold] = useState(peakLevel);
  
  // Convert dB to percentage (0 to 100)
  const dbToPercent = (db) => {
    // Clamp between -60dB and 0dB
    const clampedDb = Math.min(0, Math.max(-60, db));
    // Convert to percentage
    return ((clampedDb + 60) / 60) * 100;
  };

  // Update peak hold
  useEffect(() => {
    if (peakLevel > peakHold) {
      setPeakHold(peakLevel);
    } else {
      const timer = setTimeout(() => {
        setPeakHold(peakLevel);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [peakLevel]);

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-2" data-testid={testId}>
      <div className="text-xs font-medium mb-1 text-center">Meter</div>
      <div className={cn("relative flex flex-col justify-end min-h-[100px]", className)} style={{ height }}>
        {/* RMS bar */}
        <div 
          data-testid={`${testId}-rms`}
          className={cn(
            "absolute bottom-0 w-full transition-all duration-100",
            rmsLevel > -6 ? "bg-red-500" : 
            rmsLevel > -12 ? "bg-yellow-500" : 
            "bg-green-500"
          )}
          style={{ height: `${dbToPercent(rmsLevel)}%` }}
        />
        
        {/* Peak bar */}
        <div 
          data-testid={`${testId}-peak`}
          className={cn(
            "absolute bottom-0 w-full opacity-50 transition-all duration-100",
            peakLevel > -6 ? "bg-red-500" : 
            peakLevel > -12 ? "bg-yellow-500" : 
            "bg-green-500"
          )}
          style={{ height: `${dbToPercent(peakLevel)}%` }}
        />
        
        {/* Peak hold line */}
        <div 
          data-testid={`${testId}-peak-hold`}
          className="absolute w-full h-[2px] bg-white transition-all duration-100"
          style={{ bottom: `${dbToPercent(peakHold)}%` }}
        />

        {/* dB scale markers */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div className="text-xs text-gray-500">0dB</div>
          <div className="text-xs text-gray-500">-20dB</div>
          <div className="text-xs text-gray-500">-40dB</div>
          <div className="text-xs text-gray-500">-60dB</div>
        </div>
      </div>
    </div>
  );
}; 