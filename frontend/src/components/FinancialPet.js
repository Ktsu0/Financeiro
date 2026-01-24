import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Heart,
  Meh,
  Frown,
  AlertOctagon,
  RefreshCw,
  Moon,
  ChevronRight,
  ChevronLeft,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";

const FinancialPet = ({ summary }) => {
  const [petType, setPetType] = useState(() => {
    return localStorage.getItem("finance_pet_type") || "dog";
  });

  const [isMinimized, setIsMinimized] = useState(() => {
    return localStorage.getItem("finance_pet_minimized") === "true";
  });

  const { total_income, available_salary, total_expenses, total_debt } =
    summary;

  const isSleeping =
    total_income === 0 &&
    total_expenses === 0 &&
    (!total_debt || total_debt === 0);

  const healthPercentage =
    total_income > 0 ? (available_salary / total_income) * 100 : 0;

  const getMood = (percentage) => {
    if (isSleeping) return "sleeping";
    if (percentage >= 90) return "super-happy";
    if (percentage >= 75) return "happy";
    if (percentage >= 50) return "neutral";
    if (percentage >= 20) return "sad";
    if (percentage >= 0) return "very-sad";
    return "desperate";
  };

  const mood = getMood(healthPercentage);

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

  const getMoodColors = () => {
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
  };

  const colors = getMoodColors();
  const getPetEmoji = () => {
    if (petType === "dog") return "🐶";
    if (petType === "cat") return "🐱";
    if (petType === "parrot") return "🦜";
    return "🐶";
  };

  const getPetName = () => {
    if (petType === "dog") return "Doguinho";
    if (petType === "cat") return "Gatinho";
    if (petType === "parrot") return "Papagaio";
    return "Pet";
  };

  const renderPet = () => {
    const commonClasses =
      "w-full h-full drop-shadow-2xl transition-all duration-500";
    const defs = (
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

    const renderZzz = () => (
      <g className="zzz-animation">
        <text
          x="70"
          y="25"
          fontSize="16"
          fill={colors.primary}
          fontWeight="bold"
          opacity="0"
        >
          Z
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            values="25;10"
            dur="3s"
            repeatCount="indefinite"
          />
        </text>
        <text
          x="78"
          y="18"
          fontSize="14"
          fill={colors.primary}
          fontWeight="bold"
          opacity="0"
        >
          z
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            dur="3s"
            begin="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            values="18;5"
            dur="3s"
            begin="1s"
            repeatCount="indefinite"
          />
        </text>
        <text
          x="84"
          y="12"
          fontSize="12"
          fill={colors.primary}
          fontWeight="bold"
          opacity="0"
        >
          z
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            dur="3s"
            begin="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            values="12;0"
            dur="3s"
            begin="2s"
            repeatCount="indefinite"
          />
        </text>
      </g>
    );

    const renderEyes = (cx, cy, sleeping = false) => {
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

    const renderMouth = (cx, cy) => {
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
    };

    if (petType === "dog") {
      return (
        <svg viewBox="0 0 100 100" className={commonClasses}>
          {defs}
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
          <line
            x1="50"
            y1="65"
            x2="50"
            y2="72"
            stroke="#1e293b"
            strokeWidth="2"
          />
          <ellipse cx="35" cy="45" rx="8" ry="6" fill="#d97706" opacity="0.6" />
          <ellipse cx="68" cy="48" rx="6" ry="5" fill="#d97706" opacity="0.6" />
          {renderEyes(50, 48)} {renderMouth(50, 55)}
          {mood === "super-happy" && (
            <>
              <circle cx="28" cy="62" r="6" fill="#fda4af" opacity="0.6" />
              <circle cx="72" cy="62" r="6" fill="#fda4af" opacity="0.6" />
            </>
          )}
          {mood === "sleeping" && renderZzz()}
        </svg>
      );
    }
    if (petType === "cat") {
      return (
        <svg viewBox="0 0 100 100" className={commonClasses}>
          {defs}
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
          {renderEyes(50, 56)} {renderMouth(50, 58)}
          <path d="M 48 66 L 52 66 L 50 69 Z" fill="#fda4af" />
          <g
            stroke="#475569"
            strokeWidth="1.5"
            opacity="0.6"
            strokeLinecap="round"
          >
            <line x1="32" y1="64" x2="10" y2="60" />
            <line x1="32" y1="68" x2="10" y2="70" />
            <line x1="68" y1="64" x2="90" y2="60" />
            <line x1="68" y1="68" x2="90" y2="70" />
          </g>
          {mood === "sleeping" && renderZzz()}
        </svg>
      );
    }
    if (petType === "parrot") {
      return (
        <svg viewBox="0 0 100 100" className={commonClasses}>
          {defs}
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
          <path
            d="M 25 55 Q 20 65 25 75"
            fill="url(#parrotWing)"
            opacity="0.7"
          />
          <path
            d="M 75 55 Q 80 65 75 75"
            fill="url(#parrotWing)"
            opacity="0.7"
          />
          <circle cx="38" cy="48" r="9" fill="white" />
          <circle cx="62" cy="48" r="9" fill="white" />
          {renderEyes(50, 48)}
          <path
            d="M 45 58 Q 50 68 55 58 L 50 54 Z"
            fill="#f59e0b"
            stroke="#d97706"
            strokeWidth="1"
          />
          <path d="M 46 58 Q 50 63 54 58" fill="#fbbf24" />
          {renderMouth(50, 52)}
          {mood === "sleeping" && renderZzz()}
        </svg>
      );
    }
  };

  const getMoodConfig = () => {
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
  };

  const moodConfig = getMoodConfig();
  const MoodIcon = moodConfig.icon;

  return (
    <motion.div
      drag
      dragConstraints={{
        left: 0,
        top: 0,
        right: window.innerWidth - 320,
        bottom: window.innerHeight - 120,
      }}
      dragElastic={0.1}
      dragMomentum={false}
      layout
      initial={false}
      className="fixed bottom-6 left-6 z-[100] cursor-grab active:cursor-grabbing"
    >
      <AnimatePresence mode="wait">
        {!isMinimized ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, x: -50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`bg-gradient-to-br ${colors.bg} backdrop-blur-xl border border-white/10 rounded-3xl p-4 flex items-center gap-4 cursor-default group shadow-2xl ${colors.glow} w-[300px] h-[100px] relative overflow-hidden`}
          >
            {/* Minimize Button */}
            <button
              onClick={toggleMinimize}
              className="absolute top-2 right-2 p-1.5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
              title="Minimizar Pet"
            >
              <Minimize2 size={16} />
            </button>

            <div
              className="relative w-16 h-16 sm:w-20 sm:h-20 filter drop-shadow-md flex-shrink-0 cursor-pointer"
              onClick={togglePet}
            >
              {renderPet()}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center shadow-md animate-pulse">
                <RefreshCw
                  size={10}
                  className="sm:w-3 sm:h-3 text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex flex-col pr-2 min-w-0 flex-1">
              <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mb-1">
                Saúde Financeira
              </span>
              <div className="flex items-center gap-1.5">
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
              <p className="text-[9px] text-white/40 mt-1 flex items-center gap-1 truncate">
                <span className="text-xs">{getPetEmoji()}</span>
                <span className="truncate">{getPetName()}</span>
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
            <div className="w-10 h-10">{renderPet()}</div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary border-2 border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 size={8} className="text-black" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FinancialPet;
