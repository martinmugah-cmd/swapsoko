import { motion } from "framer-motion";

/**
 * Chameleon Color Cycle Loading Animation
 * Per spec: animate prop cycles through core brand colors:
 *   fill: ["#22C55E", "#2563EB", "#0F172A", "#22C55E"]
 * with transition repeat: Infinity and duration: 2s
 * Used when Swap Guru AI is computing trade suggestions.
 */
export function ChameleonLoader({ size = 56, text = "Swap Guru is thinking..." }: { size?: number; text?: string }) {
  const colorKeyframes: string[] = ["#22C55E", "#2563EB", "#0F172A", "#22C55E"];
  const colorTransition = {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut" as const,
  };

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ rotate: [0, 2, -2, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Body */}
        <motion.ellipse
          cx="44"
          cy="42"
          rx="20"
          ry="16"
          animate={{ fill: colorKeyframes }}
          transition={colorTransition}
        />
        {/* Head */}
        <motion.circle
          cx="62"
          cy="36"
          r="12"
          animate={{ fill: colorKeyframes }}
          transition={{ ...colorTransition, delay: 0.1 }}
        />
        {/* Snout bump */}
        <motion.ellipse
          cx="73"
          cy="36"
          rx="5"
          ry="4"
          animate={{ fill: colorKeyframes }}
          transition={{ ...colorTransition, delay: 0.15 }}
        />
        {/* Eye white */}
        <circle cx="64" cy="31" r="5" fill="white" />
        {/* Pupil */}
        <motion.circle
          cx="65"
          cy="31"
          r="2.5"
          animate={{ fill: colorKeyframes }}
          transition={{ ...colorTransition, delay: 0.5 }}
        />
        {/* Eye shine */}
        <circle cx="66" cy="30" r="1" fill="white" />
        {/* Crest / dorsal spines */}
        <motion.path
          d="M44 26 L46 18 L50 26 L54 16 L58 26 L62 22 L64 26"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animate={{ stroke: colorKeyframes }}
          transition={{ ...colorTransition, delay: 0.2 }}
        />
        {/* Legs */}
        <motion.path
          d="M36 52 L32 62 M44 54 L42 64 M52 52 L56 62"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          animate={{ stroke: colorKeyframes }}
          transition={{ ...colorTransition, delay: 0.3 }}
        />
        {/* Tail curl */}
        <motion.path
          d="M24 42 C16 44 10 50 14 56 C18 62 24 58 22 52 C20 48 24 46 24 42Z"
          animate={{ fill: colorKeyframes }}
          transition={{ ...colorTransition, delay: 0.4 }}
        />
        {/* Tongue */}
        <motion.path
          d="M74 36 C80 32 84 34 82 38"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          animate={{
            stroke: colorKeyframes,
            pathLength: [0, 1, 1, 0],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Tongue tip */}
        <motion.circle
          cx="82"
          cy="38"
          r="2"
          animate={{
            fill: colorKeyframes,
            opacity: [0, 1, 1, 0],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>

      {/* Color-cycling dots */}
      <div className="flex gap-2">
        {([0, 0.4, 0.8] as const).map((delay, i) => (
          <motion.span
            key={i}
            className="w-2.5 h-2.5 rounded-full"
            animate={{ backgroundColor: colorKeyframes }}
            transition={{ ...colorTransition, delay }}
          />
        ))}
      </div>

      {/* Label */}
      <motion.p
        className="text-sm font-semibold text-center"
        animate={{ color: colorKeyframes }}
        transition={colorTransition}
      >
        {text}
      </motion.p>
    </div>
  );
}

export default ChameleonLoader;
