"use client";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "span";
  className?: string;
  /** Above-the-fold content: animate with pure CSS so it paints without waiting for JavaScript. */
  instant?: boolean;
};

// Rises gently from below as it scrolls into view. Honors "reduce motion".
export default function Reveal({ children, delay = 0, y = 44, as = "div", className, instant }: Props) {
  const reduce = useReducedMotion();
  if (instant) {
    return (
      <div className={`rise ${className ?? ""}`.trim()} style={{ animationDelay: `${delay}s` }}>
        {children}
      </div>
    );
  }
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 1, delay, ease: [0.28, 0.11, 0.32, 1] }}
    >
      {children}
    </Comp>
  );
}
