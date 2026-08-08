import { useId } from "react";
import { motion } from "framer-motion";

export type PandaState =
  | "idle"
  | "greeting"
  | "thinking"
  | "learning"
  | "coding"
  | "success"
  | "confused"
  | "sleeping";

export type PandaSize = "sm" | "md" | "lg" | "xl";

interface PandaMascotProps {
  state?: PandaState;
  size?: PandaSize | number;
  className?: string;
}

const SIZE_MAP: Record<PandaSize, number> = {
  sm: 56,
  md: 88,
  lg: 132,
  xl: 176,
};

type EyeKind = "open" | "happy" | "closed" | "curious";
type MouthKind = "smile" | "big" | "thinking" | "flat" | "relaxed";
type ArmPose = "bamboo" | "wave" | "chin" | "up" | "lap";

interface Pose {
  right: ArmPose;
  eye: EyeKind;
  mouth: MouthKind;
  headTilt: number;
}

const POSES: Record<PandaState, Pose> = {
  idle: { right: "bamboo", eye: "open", mouth: "smile", headTilt: 0 },
  greeting: { right: "wave", eye: "happy", mouth: "big", headTilt: 0 },
  thinking: { right: "chin", eye: "open", mouth: "thinking", headTilt: 3 },
  learning: { right: "lap", eye: "open", mouth: "smile", headTilt: 0 },
  coding: { right: "lap", eye: "open", mouth: "smile", headTilt: 5 },
  success: { right: "up", eye: "happy", mouth: "big", headTilt: 0 },
  confused: { right: "bamboo", eye: "curious", mouth: "flat", headTilt: -5 },
  sleeping: { right: "bamboo", eye: "closed", mouth: "relaxed", headTilt: 9 },
};

const MOUTH_D: Record<MouthKind, string> = {
  smile: "M93 88 q7 6 14 0",
  big: "M90 85 q10 10 20 0",
  thinking: "M95 89 q5 3 10 0",
  flat: "M94 93 h12",
  relaxed: "M95 90 q5 3 10 0",
};

const RIGHT_ARM: Record<ArmPose, { x: number; y: number; rx: number; ry: number; rot: number; paw?: { x: number; y: number; r: number } }> = {
  bamboo: { x: 152, y: 126, rx: 14, ry: 24, rot: -14, paw: { x: 146, y: 134, r: 10.5 } },
  wave: { x: 164, y: 90, rx: 13, ry: 23, rot: 40, paw: { x: 170, y: 70, r: 10 } },
  chin: { x: 134, y: 112, rx: 12, ry: 21, rot: -44, paw: { x: 116, y: 102, r: 9.5 } },
  up: { x: 164, y: 84, rx: 13, ry: 23, rot: 38, paw: { x: 172, y: 64, r: 10 } },
  lap: { x: 130, y: 150, rx: 13, ry: 20, rot: 42, paw: { x: 114, y: 158, r: 9 } },
};

/**
 * PandaMascot — the reusable Panda assistant character.
 *
 * A full-body, premium-illustrated black-and-white panda with the classic
 * large inward-tilted eye patches, small rounded ears, round fluffy body,
 * black limbs, sitting comfortably and holding a bamboo stalk, on a small
 * bamboo/grass patch with a soft teal glow. Every state reuses the exact same
 * character; only its pose, expression and accessories change. Animations are
 * subtle: slow breathing, gentle blinking, a tiny head sway and drifting
 * bamboo leaves.
 */
export function PandaMascot({
  state = "idle",
  size = "md",
  className,
}: PandaMascotProps) {
  const px = typeof size === "number" ? size : SIZE_MAP[size];
  const pose = POSES[state];
  const uid = useId();
  const fur = `${uid}-fur`;
  const dark = `${uid}-dark`;
  const pad = `${uid}-pad`;
  const glow = `${uid}-glow`;
  const ground = `${uid}-ground`;
  const bamboo = `${uid}-bamboo`;
  const leaf = `${uid}-leaf`;
  const arm = RIGHT_ARM[pose.right] ?? RIGHT_ARM.bamboo;

  return (
    <span
      className={`inline-flex shrink-0 select-none items-center justify-center ${className ?? ""}`}
      style={{ width: px, height: px }}
      aria-hidden="true"
    >
      <motion.svg viewBox="0 0 200 200" width={px} height={px}>
        <defs>
          <radialGradient id={fur} cx="38%" cy="26%" r="90%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#f1f3f6" />
            <stop offset="100%" stopColor="#c4c9d3" />
          </radialGradient>
          <radialGradient id={dark} cx="40%" cy="28%" r="85%">
            <stop offset="0%" stopColor="#3a3a41" />
            <stop offset="55%" stopColor="#212125" />
            <stop offset="100%" stopColor="#0a0a0d" />
          </radialGradient>
          <radialGradient id={pad} cx="40%" cy="32%" r="80%">
            <stop offset="0%" stopColor="#43434a" />
            <stop offset="100%" stopColor="#222226" />
          </radialGradient>
          <radialGradient id={glow} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3cc2ad" />
            <stop offset="100%" stopColor="#3cc2ad" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={ground} cx="50%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#1f5a50" />
            <stop offset="100%" stopColor="#12332d" />
          </radialGradient>
          <linearGradient id={bamboo} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#48cfb6" />
            <stop offset="100%" stopColor="#1d8a77" />
          </linearGradient>
          <linearGradient id={leaf} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#249a85" />
            <stop offset="100%" stopColor="#5adfc4" />
          </linearGradient>
        </defs>

        {/* Soft teal glow behind the panda */}
        <circle cx="100" cy="116" r="92" fill={`url(#${glow})`} opacity="0.16" />

        {/* Bamboo / grass patch the panda sits on */}
        <ellipse cx="100" cy="184" rx="54" ry="11" fill={`url(#${ground})`} />
        <motion.g style={{ transformOrigin: "52px 182px", transformBox: "view-box" }}>
          <path d="M48 186 C44 178 38 175 31 178 C38 176 44 180 48 186 Z" fill={`url(#${leaf})`} opacity="0.9" />
          <path d="M56 188 C58 181 63 178 70 180 C63 180 58 183 56 188 Z" fill={`url(#${leaf})`} opacity="0.7" />
        </motion.g>

        {/* Character: breathing + tiny sway */}
        <motion.g
          style={{ transformOrigin: "100px 176px", transformBox: "view-box" }}
          animate={{ scaleY: [1, 1.014, 1], rotate: [0, pose.headTilt, 0] }}
          transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut" }}
        >
          {/* Legs */}
          <ellipse cx="72" cy="170" rx="22" ry="15" fill={`url(#${dark})`} />
          <ellipse cx="72" cy="175" rx="11" ry="6" fill={`url(#${pad})`} />
          <ellipse cx="128" cy="170" rx="22" ry="15" fill={`url(#${dark})`} />
          <ellipse cx="128" cy="175" rx="11" ry="6" fill={`url(#${pad})`} />

          {/* Round chubby body */}
          <path
            d="M100 90 C74 92 58 116 58 146 C58 174 72 182 100 182 C128 182 142 174 142 146 C142 116 126 92 100 90 Z"
            fill={`url(#${fur})`}
          />
          <ellipse cx="86" cy="120" rx="26" ry="34" fill="#ffffff" opacity="0.4" />

          {/* Lap accessories for learning / coding */}
          {state === "learning" && <Book />}
          {state === "coding" && <Laptop />}

          {/* Bamboo held by the right paw */}
          <Bamboo uid={uid} />

          {/* Right arm + paw */}
          <motion.g
            style={{ transformOrigin: "152px 126px", transformBox: "view-box" }}            animate={
              pose.right === "wave"
                ? { rotate: [0, 15, -7, 12, 0] }
                : pose.right === "up"
                  ? { rotate: [0, 4, -4, 0] }
                  : undefined
            }
            transition={
              pose.right === "wave"
                ? { repeat: Infinity, duration: 2.2, ease: "easeInOut" }
                : pose.right === "up"
                  ? { repeat: Infinity, duration: 2.6 }
                  : undefined
            }
          >
            <ellipse
              cx={arm.x}
              cy={arm.y}
              rx={arm.rx}
              ry={arm.ry}
              fill={`url(#${dark})`}
              transform={`rotate(${arm.rot} ${arm.x} ${arm.y})`}
            />
            {arm.paw && (
              <circle
                cx={arm.paw.x}
                cy={arm.paw.y}
                r={arm.paw.r}
                fill={`url(#${dark})`}
              />
            )}
          </motion.g>

          {/* Left arm resting at the side */}
          <ellipse cx="44" cy="126" rx="15" ry="26" fill={`url(#${dark})`} transform="rotate(16 44 126)" />

          {/* Head */}
          <motion.g style={{ transformOrigin: "100px 62px", transformBox: "view-box" }}>
            {/* Ears */}
            <circle cx="57" cy="17" r="15" fill={`url(#${dark})`} />
            <circle cx="143" cy="17" r="15" fill={`url(#${dark})`} />
            <circle cx="59" cy="19" r="6.5" fill="#2d2d32" />
            <circle cx="141" cy="19" r="6.5" fill="#2d2d32" />

            {/* Big round head */}
            <ellipse cx="100" cy="62" rx="54" ry="51" fill={`url(#${fur})`} />
            <ellipse cx="100" cy="62" rx="54" ry="51" fill="none" stroke="#c3c8d1" strokeWidth="1" />

            {/* Large classic panda eye patches, tilted inward at the bottom */}
            <ellipse cx="75" cy="60" rx="18" ry="20.5" fill={`url(#${dark})`} transform="rotate(-11 75 60)" />
            <ellipse cx="125" cy="60" rx="18" ry="20.5" fill={`url(#${dark})`} transform="rotate(11 125 60)" />

            {/* Eyes */}
            <Eyes kind={pose.eye} />

            {/* Curious raised brow */}
            {pose.eye === "curious" && (
              <path d="M111 41 q8 -3 15 2" stroke="#0f0f12" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            )}

            {/* Small nose + mouth */}
            <ellipse cx="100" cy="82" rx="5" ry="3.8" fill="#131316" />
            <path d={MOUTH_D[pose.mouth]} stroke="#1b1b1f" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Subtle teal blush */}
            <ellipse cx="57" cy="77" rx="5.5" ry="3" fill="#3cc2ad" opacity="0.16" />
            <ellipse cx="143" cy="77" rx="5.5" ry="3" fill="#3cc2ad" opacity="0.16" />
          </motion.g>
        </motion.g>

        {/* State cues */}
        {state === "thinking" && <ThinkingCues uid={uid} />}
        {state === "sleeping" && <SleepCue uid={uid} />}
        {state === "success" && <SparkleCue uid={uid} />}
        {state === "confused" && <QuestionCue uid={uid} />}
        {state === "greeting" && <WaveCue />}
      </motion.svg>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Parts                                                               */
/* ------------------------------------------------------------------ */

function Eyes({ kind }: { kind: EyeKind }) {
  if (kind === "happy") {
    return (
      <>
        <path d="M68 61 q7 -7 15 0" stroke="#f4f5f7" strokeWidth="2.7" strokeLinecap="round" fill="none" />
        <path d="M117 61 q7 -7 15 0" stroke="#f4f5f7" strokeWidth="2.7" strokeLinecap="round" fill="none" />
      </>
    );
  }
  if (kind === "closed") {
    return (
      <>
        <path d="M69 64 q7 5 15 0" stroke="#f4f5f7" strokeWidth="2.7" strokeLinecap="round" fill="none" />
        <path d="M116 64 q7 5 15 0" stroke="#f4f5f7" strokeWidth="2.7" strokeLinecap="round" fill="none" />
      </>
    );
  }
  const up = 0;
  return (
    <>
      <motion.g
        style={{ transformOrigin: "77px 61px", transformBox: "view-box" }}
        animate={{ scaleY: [1, 1, 1, 0.12, 1, 1] }}
        transition={{ repeat: Infinity, duration: 4.6, times: [0, 0.82, 0.9, 0.94, 0.98, 1] }}
      >
        <circle cx={77 + up} cy={61} r="5.4" fill="#f4f5f7" />
        <circle cx={78 + up} cy={62} r="2.6" fill="#101014" />
        <circle cx={76.4 + up} cy={60.4} r="1" fill="#ffffff" />
      </motion.g>
      <motion.g
        style={{ transformOrigin: "123px 61px", transformBox: "view-box" }}
        animate={{ scaleY: [1, 1, 1, 0.12, 1, 1] }}
        transition={{ repeat: Infinity, duration: 4.6, times: [0, 0.82, 0.9, 0.94, 0.98, 1] }}
      >
        <circle cx={123 + up} cy={61} r="5.4" fill="#f4f5f7" />
        <circle cx={124 + up} cy={62} r="2.6" fill="#101014" />
        <circle cx={122.4 + up} cy={60.4} r="1" fill="#ffffff" />
      </motion.g>
    </>
  );
}

function Bamboo({ uid }: { uid: string }) {
  return (
    <motion.g style={{ transformOrigin: "146px 170px", transformBox: "view-box" }}>
      {/* Stalk, held by the right paw */}
      <path
        d="M146 176 C145 150 145 98 147 62"
        stroke={`url(#${uid}-bamboo)`}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M140 142 h13" stroke="#156d5b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M141 104 h13" stroke="#156d5b" strokeWidth="1.5" strokeLinecap="round" />
      {/* Leaves, gentle sway */}
      <motion.g
        style={{ transformOrigin: "146px 74px", transformBox: "view-box" }}
        animate={{ rotate: [0, 4, -2, 0] }}
        transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
      >
        <path d="M146 78 C136 64 122 59 110 62 C124 60 136 64 146 72 Z" fill={`url(#${uid}-leaf)`} />
        <path d="M148 92 C158 78 172 74 184 78 C172 76 158 78 148 88 Z" fill={`url(#${uid}-leaf)`} />
        <path d="M143 118 C135 110 127 108 118 112 C129 110 137 112 143 116 Z" fill={`url(#${uid}-leaf)`} />
      </motion.g>
    </motion.g>
  );
}

function Book() {
  return (
    <g>
      <rect x="88" y="152" width="26" height="17" rx="2.5" fill="#242933" />
      <rect x="99" y="152" width="4" height="17" rx="1" fill="#161a21" />
      <rect x="90" y="154" width="7" height="13" rx="1" fill="#3cc2ad" opacity="0.75" />
      <rect x="105" y="154" width="7" height="13" rx="1" fill="#3cc2ad" opacity="0.55" />
    </g>
  );
}

function Laptop() {
  return (
    <g>
      <rect x="84" y="152" width="34" height="22" rx="3" fill="#1c1f26" />
      <rect x="87" y="155" width="28" height="14" rx="1.5" fill="#3cc2ad" opacity="0.85" />
      <path d="M84 174 h34 l-3 4 h-28 Z" fill="#0f1218" />
    </g>
  );
}

function ThinkingCues({ uid }: { uid: string }) {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={178 + i * 9}
          cy={32 - i * 8}
          r="2.4"
          fill={`url(#${uid}-bamboo)`}
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.22 }}
        />
      ))}
    </>
  );
}

function SleepCue({ uid }: { uid: string }) {
  return (
    <motion.text
      x="170"
      y="38"
      fontSize="16"
      fontWeight="700"
      fill={`url(#${uid}-bamboo)`}
      animate={{ y: [0, -5], opacity: [0.5, 1, 0.3] }}
      transition={{ repeat: Infinity, duration: 2.6 }}
    >
      z
    </motion.text>
  );
}

function SparkleCue({ uid }: { uid: string }) {
  return (
    <g>
      {[
        [174, 38],
        [28, 46],
        [152, 24],
      ].map(([x, y], i) => (
        <motion.path
          key={i}
          d="M0 -4 L1.1 -1.1 L4 0 L1.1 1.1 L0 4 L-1.1 1.1 L-4 0 L-1.1 -1.1 Z"
          transform={`translate(${x} ${y})`}
          fill={`url(#${uid}-bamboo)`}
          animate={{ rotate: [0, 30, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.25 }}
        />
      ))}
    </g>
  );
}

function QuestionCue({ uid }: { uid: string }) {
  return (
    <motion.text
      x="170"
      y="38"
      fontSize="17"
      fontWeight="700"
      fill={`url(#${uid}-bamboo)`}
      animate={{ y: [0, -3, 0] }}
      transition={{ repeat: Infinity, duration: 2.2 }}
    >
      ?
    </motion.text>
  );
}

function WaveCue() {
  return (
    <motion.text
      x="170"
      y="36"
      fontSize="15"
      animate={{ rotate: [0, 14, -8, 10, 0] }}
      transition={{ repeat: Infinity, duration: 2.4 }}
      style={{ transformOrigin: "176px 40px" }}
    >
      👋
    </motion.text>
  );
}
