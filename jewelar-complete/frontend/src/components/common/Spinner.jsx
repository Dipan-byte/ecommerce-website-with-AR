import { motion } from "framer-motion";

export default function Spinner({ fullscreen = false }) {
  const LoaderContent = () => (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center">
        {/* Outer Pulsing Ring */}
        <div className="w-16 h-16 border-2 border-amber-100 rounded-full animate-ping absolute opacity-20" />
        
        {/* Middle Rotating Ring */}
        <div className="w-16 h-16 border-t-2 border-r-2 border-amber-500 rounded-full animate-spin" />
        
        {/* Inner Static Gem Icon */}
        <div className="absolute text-2xl animate-pulse">
          ✨
        </div>
      </div>
      
      {fullscreen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="font-serif text-slate-900 text-xl tracking-wide mb-1">
            Jewel<span className="text-amber-600">AR</span>
          </p>
          <p className="text-slate-400 text-sm font-medium animate-pulse">
            Polishing your collection...
          </p>
        </motion.div>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center z-[100]">
        <LoaderContent />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-24 w-full">
      <div className="scale-75">
        <LoaderContent />
      </div>
    </div>
  );
}