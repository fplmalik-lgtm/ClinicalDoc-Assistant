import React from 'react';
import { cn } from '../lib/utils';

interface BodyRegion {
  id: string;
  name: string;
  path: string;
}

const REGIONS: BodyRegion[] = [
  { id: 'head', name: 'Head/Neck', path: 'M50,5 C45,5 42,8 42,12 C42,16 45,20 50,20 C55,20 58,16 58,12 C58,8 55,5 50,5' },
  { id: 'torso', name: 'Chest/Abdomen', path: 'M40,22 L60,22 L62,45 L38,45 Z' },
  { id: 'arm-left', name: 'Left Arm', path: 'M38,23 L25,35 L28,38 L38,28 Z' },
  { id: 'arm-right', name: 'Right Arm', path: 'M62,23 L75,35 L72,38 L62,28 Z' },
  { id: 'leg-left', name: 'Left Leg', path: 'M38,46 L35,75 L43,75 L45,46 Z' },
  { id: 'leg-right', name: 'Right Leg', path: 'M62,46 L65,75 L57,75 L55,46 Z' },
];

interface BodyMapProps {
  onSelectRegion: (region: string) => void;
  selectedRegions: string[];
}

export const BodyMap: React.FC<BodyMapProps> = ({ onSelectRegion, selectedRegions }) => {
  return (
    <div className="relative w-full aspect-[2/3] max-w-[200px] mx-auto bg-slate-50 rounded-2xl p-4 border border-slate-200">
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-4">Location Map</h4>
      <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-sm">
        {/* Background Grey Body */}
        <path 
          d="M50,5 C45,5 42,8 42,12 C42,16 45,20 50,20 C55,20 58,16 58,12 C58,8 55,5 50,5 M40,22 L60,22 L62,45 L38,45 Z M38,23 L25,35 L28,38 L38,28 Z M62,23 L75,35 L72,38 L62,28 Z M38,46 L35,75 L43,75 L45,46 Z M62,46 L65,75 L57,75 L55,46 Z" 
          fill="#e2e8f0"
        />
        {REGIONS.map((region) => (
          <path
            key={region.id}
            d={region.path}
            onClick={() => onSelectRegion(region.name)}
            className={cn(
              "cursor-pointer transition-colors duration-200 hover:fill-blue-400 focus:outline-none",
              selectedRegions.includes(region.name) ? "fill-blue-600" : "fill-slate-300"
            )}
          >
            <title>{region.name}</title>
          </path>
        ))}
      </svg>
      <p className="text-[10px] text-center text-slate-400 mt-2 italic">Select affected areas</p>
    </div>
  );
};
