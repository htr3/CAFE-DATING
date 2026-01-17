import { motion } from 'framer-motion';

export const ScanningRadar = () => {
  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <div className="absolute inset-0 bg-primary/20 rounded-full animate-radar" />
      <div className="absolute inset-0 bg-primary/20 rounded-full animate-radar [animation-delay:1s]" />
      <div className="w-3 h-3 bg-primary rounded-full z-10 shadow-[0_0_10px_theme(colors.primary.DEFAULT)]" />
    </div>
  );
};
