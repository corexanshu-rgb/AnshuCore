import React, { useId } from "react";

/**
 * Official AnshuCore SVG Brand Logo
 * Preserves exact paths, gradients, colors (#581C87, #7C3AED, #2563EB, #8FE3EC), and proportions.
 */
export default function BrandLogo({
  size = 36,
  className = "",
  withBackground = true,
  style = {}
}) {
  const reactId = useId();
  const safeId = reactId.replace(/[^a-zA-Z0-9_-]/g, "");

  return (
    <svg
      viewBox="0 0 800 800"
      width={size}
      height={size}
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="AnshuCore Logo"
      role="img"
    >
      <defs>
        <linearGradient
          id={`${safeId}-leftLegGrad`}
          x1="220"
          y1="540"
          x2="420"
          y2="200"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#581C87" />
          <stop offset="30%" stopColor="#7C3AED" />
          <stop offset="70%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>

        <linearGradient
          id={`${safeId}-rightLegGrad`}
          x1="380"
          y1="200"
          x2="560"
          y2="540"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#1D4ED8" />
          <stop offset="40%" stopColor="#2563EB" />
          <stop offset="80%" stopColor="#0080FF" />
          <stop offset="100%" stopColor="#8FE3EC" />
        </linearGradient>

        <linearGradient
          id={`${safeId}-centerGlowGrad`}
          x1="340"
          y1="340"
          x2="460"
          y2="440"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#8FE3EC" />
          <stop offset="100%" stopColor="#93C5FD" />
        </linearGradient>
      </defs>

      {withBackground && (
        <rect width="800" height="800" rx="180" fill="#FFFFFF" />
      )}

      <g id="logo-mark">
        <path
          d="M 270 515 L 400 245"
          stroke={`url(#${safeId}-leftLegGrad)`}
          strokeWidth="116"
          strokeLinecap="round"
        />
        <path
          d="M 400 245 L 530 515"
          stroke={`url(#${safeId}-rightLegGrad)`}
          strokeWidth="116"
          strokeLinecap="round"
        />
        <path
          d="M 335 435 Q 400 325 465 435 Q 400 395 335 435 Z"
          fill={`url(#${safeId}-centerGlowGrad)`}
          opacity="0.85"
        />
        <path
          d="M 585 215 Q 585 250 620 250 Q 585 250 585 285 Q 585 250 550 250 Q 585 250 585 215 Z"
          fill="#8FE3EC"
        />
      </g>
    </svg>
  );
}

/**
 * AnshuCore Wordmark
 * Displays brand name exactly as two styled parts without space:
 * Anshu (#111827) and Core (#2563EB)
 */
export function BrandWordmark({ className = "", style = {} }) {
  return (
    <span
      className={`brand-name ${className}`}
      style={{
        fontWeight: 700,
        letterSpacing: "-0.5px",
        display: "inline-flex",
        alignItems: "baseline",
        ...style
      }}
    >
      <span className="brand-anshu" style={{ color: "#111827" }}>Anshu</span><span className="brand-core" style={{ color: "#2563EB" }}>Core</span>
    </span>
  );
}
