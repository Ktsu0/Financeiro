import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Heart,
  Meh,
  Frown,
  AlertOctagon,
  RefreshCw,
  Moon,
  Minimize2,
  Maximize2,
} from "lucide-react";

// --- Sub-components & Assets (Extracted for Performance & Readability) ---

const PetDefs = () => (
  <defs>
    <linearGradient id="dogFur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#fbbf24" />
      <stop offset="50%" stopColor="#f59e0b" />
      <stop offset="100%" stopColor="#d97706" />
    </linearGradient>
    <linearGradient id="catFur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#f1f5f9" />
      <stop offset="50%" stopColor="#cbd5e1" />
      <stop offset="100%" stopColor="#94a3b8" />
    </linearGradient>
    <linearGradient id="parrotBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#10b981" />
      <stop offset="100%" stopColor="#059669" />
    </linearGradient>
    <linearGradient id="parrotWing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#3b82f6" />
      <stop offset="100%" stopColor="#1d4ed8" />
    </linearGradient>
    <filter id="softShadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
      <feOffset dx="0" dy="2" result="offsetblur" />
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

const ZzzAnimation = ({ color }) => (
  <g className="zzz-animation">
    {[
      { x: 70, y: 25, fontSize: 16, delay: "0s", dur: "3s" },
      { x: 78, y: 18, fontSize: 14, delay: "1s", dur: "3s" },
      { x: 84, y: 12, fontSize: 12, delay: "2s", dur: "3s" },
    ].map((z, i) => (
      <text
        key={i}
        x={z.x}
        y={z.y}
        fontSize={z.fontSize}
        fill={color}
        fontWeight="bold"
        opacity="0"
      >
        {i === 0 ? "Z" : "z"}
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          dur={z.dur}
          begin={z.delay}
          repeatCount="indefinite"
        />
        <animate
          attributeName="y"
          values={`${z.y};${z.y - 15}`}
          dur={z.dur}
          begin={z.delay}
          repeatCount="indefinite"
        />
      </text>
    ))}
  </g>
);

const PetEyes = ({ cx, cy, mood, sleeping }) => {
  if (sleeping || mood === "sleeping") {
    return (
      <g>
        <path
          d={`M ${cx - 20} ${cy} Q ${cx - 12} ${cy + 3} ${cx - 4} ${cy}`}
          stroke="#1e293b"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M ${cx + 4} ${cy} Q ${cx + 12} ${cy + 3} ${cx + 20} ${cy}`}
          stroke="#1e293b"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    );
  }
  if (mood === "super-happy") {
    return (
      <g>
        <path
          d={`M ${cx - 20} ${cy} Q ${cx - 12} ${cy - 5} ${cx - 4} ${cy}`}
          stroke="#1e293b"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M ${cx + 4} ${cy} Q ${cx + 12} ${cy - 5} ${cx + 20} ${cy}`}
          stroke="#1e293b"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    );
  }
  if (mood === "desperate") {
    return (
      <g>
        <path
          d={`M ${cx - 18} ${cy - 3} L ${cx - 8} ${cy + 3} M ${cx - 8} ${cy - 3} L ${cx - 18} ${cy + 3}`}
          stroke="#1e293b"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d={`M ${cx + 8} ${cy - 3} L ${cx + 18} ${cy + 3} M ${cx + 18} ${cy - 3} L ${cx + 8} ${cy + 3}`}
          stroke="#1e293b"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx={cx - 12} cy={cy} rx="7" ry="9" fill="white" />
      <circle cx={cx - 12} cy={cy + 1} r="5" fill="#1e293b" />
      <circle cx={cx - 14} cy={cy - 2} r="2" fill="white" opacity="0.9" />
      <ellipse cx={cx + 12} cy={cy} rx="7" ry="9" fill="white" />
      <circle cx={cx + 12} cy={cy + 1} r="5" fill="#1e293b" />
      <circle cx={cx + 10} cy={cy - 2} r="2" fill="white" opacity="0.9" />
    </g>
  );
};

const PetMouth = ({ cx, cy, mood }) => {
  if (mood === "sleeping")
    return (
      <ellipse
        cx={cx}
        cy={cy + 15}
        rx="4"
        ry="3"
        fill="#1e293b"
        opacity="0.4"
      />
    );
  if (mood === "super-happy")
    return (
      <g>
        <path
          d={`M ${cx - 12} ${cy + 8} Q ${cx} ${cy + 20} ${cx + 12} ${cy + 8}`}
          fill="#fda4af"
          stroke="#be123c"
          strokeWidth="1.5"
        />
        <path
          d={`M ${cx - 8} ${cy + 12} Q ${cx} ${cy + 16} ${cx + 8} ${cy + 12}`}
          fill="none"
          stroke="#be123c"
          strokeWidth="1"
        />
      </g>
    );
  if (mood === "happy")
    return (
      <path
        d={`M ${cx - 10} ${cy + 10} Q ${cx} ${cy + 16} ${cx + 10} ${cy + 10}`}
        fill="none"
        stroke="#1e293b"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    );
  if (mood === "neutral")
    return (
      <line
        x1={cx - 10}
        y1={cy + 12}
        x2={cx + 10}
        y2={cy + 12}
        stroke="#1e293b"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    );
  if (mood === "sad" || mood === "very-sad")
    return (
      <g>
        <path
          d={`M ${cx - 10} ${cy + 16} Q ${cx} ${cy + 10} ${cx + 10} ${cy + 16}`}
          fill="none"
          stroke="#1e293b"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {mood === "very-sad" && (
          <path d="M 0 0 Q 2 8 0 12" fill="#60a5fa" opacity="0.8">
            <animateTransform
              attributeName="transform"
              type="translate"
              values={`${cx + 15},${cy};${cx + 15},${cy + 15}`}
              dur="1.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.8;0"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>
        )}
      </g>
    );
  if (mood === "desperate")
    return (
      <g>
        <path
          d={`M ${cx - 12} ${cy + 18} Q ${cx} ${cy + 8} ${cx + 12} ${cy + 18}`}
          fill="#1e293b"
        />
        <ellipse
          cx={cx + 18}
          cy={cy + 5}
          rx="3"
          ry="5"
          fill="#60a5fa"
          opacity="0.7"
        >
          <animate
            attributeName="ry"
            values="5;8;5"
            dur="0.5s"
            repeatCount="indefinite"
          />
        </ellipse>
      </g>
    );
  return null;
};

// --- Pet Visuals ---

const DogVisual = ({ mood, colors }) => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full drop-shadow-2xl transition-all duration-500"
  >
    <PetDefs />
    <ellipse
      cx="15"
      cy="50"
      rx="12"
      ry="25"
      fill="#d97706"
      filter="url(#softShadow)"
    />
    <ellipse
      cx="85"
      cy="50"
      rx="12"
      ry="25"
      fill="#d97706"
      filter="url(#softShadow)"
    />
    <ellipse cx="15" cy="50" rx="8" ry="20" fill="#f59e0b" />
    <ellipse cx="85" cy="50" rx="8" ry="20" fill="#f59e0b" />
    <circle
      cx="50"
      cy="55"
      r="32"
      fill="url(#dogFur)"
      filter="url(#softShadow)"
    />
    <ellipse cx="50" cy="68" rx="18" ry="14" fill="#fef3c7" />
    <ellipse cx="50" cy="65" rx="6" ry="5" fill="#1e293b" />
    <line x1="50" y1="65" x2="50" y2="72" stroke="#1e293b" strokeWidth="2" />
    <ellipse cx="35" cy="45" rx="8" ry="6" fill="#d97706" opacity="0.6" />
    <ellipse cx="68" cy="48" rx="6" ry="5" fill="#d97706" opacity="0.6" />
    <PetEyes cx={50} cy={48} mood={mood} />
    <PetMouth cx={50} cy={55} mood={mood} />
    {mood === "super-happy" && (
      <>
        <circle cx="28" cy="62" r="6" fill="#fda4af" opacity="0.6" />
        <circle cx="72" cy="62" r="6" fill="#fda4af" opacity="0.6" />
      </>
    )}
    {mood === "sleeping" && <ZzzAnimation color={colors.primary} />}
  </svg>
);

const CatVisual = ({ mood, colors }) => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full drop-shadow-2xl transition-all duration-500"
  >
    <PetDefs />
    <path
      d="M 20 20 L 30 55 L 45 40 Z"
      fill="url(#catFur)"
      filter="url(#softShadow)"
    />
    <path
      d="M 80 20 L 70 55 L 55 40 Z"
      fill="url(#catFur)"
      filter="url(#softShadow)"
    />
    <path d="M 25 30 L 30 50 L 40 42 Z" fill="#fda4af" opacity="0.7" />
    <path d="M 75 30 L 70 50 L 60 42 Z" fill="#fda4af" opacity="0.7" />
    <ellipse
      cx="50"
      cy="60"
      rx="32"
      ry="28"
      fill="url(#catFur)"
      filter="url(#softShadow)"
    />
    <PetEyes cx={50} cy={56} mood={mood} />
    <PetMouth cx={50} cy={58} mood={mood} />
    <path d="M 48 66 L 52 66 L 50 69 Z" fill="#fda4af" />
    <g stroke="#475569" strokeWidth="1.5" opacity="0.6" strokeLinecap="round">
      <line x1="32" y1="64" x2="10" y2="60" />
      <line x1="32" y1="68" x2="10" y2="70" />
      <line x1="68" y1="64" x2="90" y2="60" />
      <line x1="68" y1="68" x2="90" y2="70" />
    </g>
    {mood === "sleeping" && <ZzzAnimation color={colors.primary} />}
  </svg>
);

const ParrotVisual = ({ mood, colors }) => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full drop-shadow-2xl transition-all duration-500"
  >
    <PetDefs />
    <path d="M 42 12 Q 50 5 58 12" fill="#fbbf24" />
    <path d="M 40 18 Q 50 8 60 18" fill="#f59e0b" />
    <ellipse cx="50" cy="22" rx="8" ry="5" fill="#ef4444" />
    <circle
      cx="50"
      cy="50"
      r="28"
      fill="url(#parrotBody)"
      filter="url(#softShadow)"
    />
    <path d="M 25 55 Q 20 65 25 75" fill="url(#parrotWing)" opacity="0.7" />
    <path d="M 75 55 Q 80 65 75 75" fill="url(#parrotWing)" opacity="0.7" />
    <circle cx="38" cy="48" r="9" fill="white" />
    <circle cx="62" cy="48" r="9" fill="white" />
    <PetEyes cx={50} cy={48} mood={mood} />
    <path
      d="M 45 58 Q 50 68 55 58 L 50 54 Z"
      fill="#f59e0b"
      stroke="#d97706"
      strokeWidth="1"
    />
    <path d="M 46 58 Q 50 63 54 58" fill="#fbbf24" />
    <PetMouth cx={50} cy={52} mood={mood} />
    {mood === "sleeping" && <ZzzAnimation color={colors.primary} />}
  </svg>
);

// --- Main Component ---

const FinancialPet = ({ summary }) => {
  const constraintsRef = useRef(null);
  const [petType, setPetType] = useState(
    () => localStorage.getItem("finance_pet_type") || "dog",
  );
  const [isMinimized, setIsMinimized] = useState(
    () => localStorage.getItem("finance_pet_minimized") === "true",
  );
  const [isRightSide, setIsRightSide] = useState(false);

  const { total_income, available_salary, total_expenses, total_debt } =
    summary;

  // Logic: Mood Calculation
  const { mood } = useMemo(() => {
    const isSleeping =
      total_income === 0 &&
      total_expenses === 0 &&
      (!total_debt || total_debt === 0);
    const hp = total_income > 0 ? (available_salary / total_income) * 100 : 0;

    let currentMood = "desperate";
    if (isSleeping) currentMood = "sleeping";
    else if (hp >= 90) currentMood = "super-happy";
    else if (hp >= 75) currentMood = "happy";
    else if (hp >= 50) currentMood = "neutral";
    else if (hp >= 20) currentMood = "sad";
    else if (hp >= 0) currentMood = "very-sad";

    return { mood: currentMood };
  }, [total_income, available_salary, total_expenses, total_debt]);

  // Logic: Drag Position Tracking
  const handleDrag = (event, info) => {
    // Detecta se o componente passou da metade da tela
    // info.point.x é a posição absoluta do cursor na tela
    const screenWidth = window.innerWidth;
    if (info.point.x > screenWidth / 2) {
      if (!isRightSide) setIsRightSide(true);
    } else {
      if (isRightSide) setIsRightSide(false);
    }
  };

  // Logic: Events
  const togglePet = (e) => {
    e.stopPropagation();
    setPetType((prev) => {
      const next = prev === "dog" ? "cat" : prev === "cat" ? "parrot" : "dog";
      localStorage.setItem("finance_pet_type", next);
      return next;
    });
  };

  const toggleMinimize = () => {
    setIsMinimized((prev) => {
      const next = !prev;
      localStorage.setItem("finance_pet_minimized", next);
      return next;
    });
  };

  // Logic: Styles/Config
  const colors = useMemo(() => {
    switch (mood) {
      case "sleeping":
        return {
          primary: "#818cf8",
          secondary: "#6366f1",
          bg: "from-indigo-500/20 to-purple-900/20",
          glow: "shadow-indigo-500/50",
        };
      case "super-happy":
        return {
          primary: "#22c55e",
          secondary: "#16a34a",
          bg: "from-green-500/20 to-green-900/20",
          glow: "shadow-green-500/50",
        };
      case "happy":
        return {
          primary: "#3b82f6",
          secondary: "#2563eb",
          bg: "from-blue-500/20 to-blue-900/20",
          glow: "shadow-blue-500/50",
        };
      case "neutral":
        return {
          primary: "#eab308",
          secondary: "#ca8a04",
          bg: "from-yellow-500/20 to-yellow-900/20",
          glow: "shadow-yellow-500/50",
        };
      case "sad":
        return {
          primary: "#f97316",
          secondary: "#ea580c",
          bg: "from-orange-500/20 to-orange-900/20",
          glow: "shadow-orange-500/50",
        };
      case "very-sad":
        return {
          primary: "#ef4444",
          secondary: "#dc2626",
          bg: "from-red-500/20 to-red-900/20",
          glow: "shadow-red-500/50",
        };
      case "desperate":
        return {
          primary: "#7f1d1d",
          secondary: "#450a0a",
          bg: "from-red-950/40 to-black/40",
          glow: "shadow-red-900/50",
        };
      default:
        return {
          primary: "#22c55e",
          secondary: "#16a34a",
          bg: "from-green-500/20 to-green-900/20",
          glow: "shadow-green-500/50",
        };
    }
  }, [mood]);

  const moodConfig = useMemo(() => {
    switch (mood) {
      case "sleeping":
        return { text: "Dormindo...", icon: Moon };
      case "super-happy":
        return { text: "Excelente!", icon: Crown };
      case "happy":
        return { text: "Saudável", icon: Heart };
      case "neutral":
        return { text: "Atenção", icon: Meh };
      case "sad":
        return { text: "Cuidado", icon: Frown };
      case "very-sad":
        return { text: "Crítico", icon: AlertOctagon };
      case "desperate":
        return { text: "SOCORRO!", icon: AlertOctagon };
      default:
        return { text: "...", icon: Meh };
    }
  }, [mood]);

  const MoodIcon = moodConfig.icon;
  const PetComponent =
    petType === "cat"
      ? CatVisual
      : petType === "parrot"
        ? ParrotVisual
        : DogVisual;
  const petName =
    petType === "cat"
      ? "Gatinho"
      : petType === "parrot"
        ? "Papagaio"
        : "Doguinho";
  const petEmoji =
    petType === "cat" ? "🐱" : petType === "parrot" ? "🦜" : "🐶";

  // Cálculo da compensação para expansão no lado direito
  // Minimized: 56px (w-14), Expanded: 300px -> Dif: 244px
  const xOffset = isRightSide && !isMinimized ? -244 : 0;

  return (
    <>
      {/* Container invisível para os limites de arrasto - inset-0 para chegar no limite total */}
      <div
        ref={constraintsRef}
        className="fixed inset-0 pointer-events-none z-[90]"
      />

      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.05}
        dragMomentum={false}
        onDrag={handleDrag}
        whileDrag={{ scale: 1.02, cursor: "grabbing" }}
        layout
        transition={{
          layout: {
            duration: 0.3,
            type: "spring",
            stiffness: 300,
            damping: 30,
          },
        }}
        style={{
          originX: isRightSide ? 1 : 0,
          originY: 1,
          marginLeft: xOffset,
        }}
        initial={false}
        className="fixed bottom-6 left-6 z-[100] cursor-grab active:cursor-grabbing"
      >
        <AnimatePresence mode="wait">
          {!isMinimized ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className={`bg-gradient-to-br ${colors.bg} backdrop-blur-xl border border-white/10 rounded-3xl p-4 flex ${isRightSide ? "flex-row-reverse" : "flex-row"} items-center gap-4 cursor-default group shadow-2xl ${colors.glow} w-[300px] h-[100px] relative overflow-hidden`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMinimize();
                }}
                className={`absolute top-2 ${isRightSide ? "left-2" : "right-2"} p-1.5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors`}
                title="Minimizar Pet"
              >
                <Minimize2 size={16} />
              </button>

              <div
                className="relative w-16 h-16 sm:w-20 sm:h-20 filter drop-shadow-md flex-shrink-0 cursor-pointer"
                onClick={togglePet}
              >
                <PetComponent mood={mood} colors={colors} />
                <div
                  className={`absolute -bottom-1 ${isRightSide ? "-left-1" : "-right-1"} w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center shadow-md animate-pulse`}
                >
                  <RefreshCw
                    size={10}
                    className="sm:w-3 sm:h-3 text-muted-foreground"
                  />
                </div>
              </div>

              <div
                className={`flex flex-col min-w-0 flex-1 ${isRightSide ? "items-end text-right pl-2" : "pr-2"}`}
              >
                <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mb-1">
                  Saúde Financeira
                </span>
                <div
                  className={`flex items-center gap-1.5 ${isRightSide ? "flex-row-reverse" : "flex-row"}`}
                >
                  <motion.div
                    key={mood}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`p-1 rounded-full ${colors.bg} border border-white/10 flex-shrink-0`}
                  >
                    <MoodIcon size={14} style={{ color: colors.primary }} />
                  </motion.div>
                  <span className="font-bold text-base text-white tracking-tight truncate">
                    {moodConfig.text}
                  </span>
                </div>
                <p
                  className={`text-[9px] text-white/40 mt-1 flex items-center gap-1 truncate ${isRightSide ? "flex-row-reverse" : "flex-row"}`}
                >
                  <span className="text-xs">{petEmoji}</span>
                  <span className="truncate">{petName}</span>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="minimized"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={toggleMinimize}
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.bg} backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl ${colors.glow} hover:scale-110 active:scale-95 transition-all text-white relative group`}
            >
              <div className="w-10 h-10">
                <PetComponent mood={mood} colors={colors} />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary border-2 border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 size={8} className="text-black" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default FinancialPet;
