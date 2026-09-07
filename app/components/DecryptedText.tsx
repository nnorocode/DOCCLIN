"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Trigger = "view" | "hover" | "inViewHover" | "click";
type Direction = "start" | "end" | "center";

type DecryptedTextProps = {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: Direction;
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: Trigger;
  clickMode?: "once" | "toggle";
};

const srOnly = { position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)", border: 0 } as const;

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = "start",
  useOriginalCharsOnly = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*+",
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "hover",
  clickMode = "once",
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(animateOn !== "click");
  const [motionDirection, setMotionDirection] = useState<"forward" | "reverse">("forward");
  const containerRef = useRef<HTMLSpanElement>(null);
  const orderRef = useRef<number[]>([]);
  const pointerRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const availableChars = useMemo(() => useOriginalCharsOnly
    ? Array.from(new Set(text.split(""))).filter(char => char !== " ")
    : characters.split(""), [characters, text, useOriginalCharsOnly]);

  const shuffle = useCallback((visible: Set<number>) => text.split("").map((char, index) => {
    if (char === " " || visible.has(index)) return char;
    return availableChars[Math.floor(Math.random() * availableChars.length)] || char;
  }).join(""), [availableChars, text]);

  const order = useCallback(() => {
    if (revealDirection === "end") return Array.from({ length: text.length }, (_, i) => text.length - i - 1);
    if (revealDirection === "center") {
      const result: number[] = [], middle = Math.floor(text.length / 2);
      for (let offset = 0; result.length < text.length; offset++) {
        const index = offset % 2 === 0 ? middle + offset / 2 : middle - Math.ceil(offset / 2);
        if (index >= 0 && index < text.length) result.push(index);
      }
      return result;
    }
    return Array.from({ length: text.length }, (_, i) => i);
  }, [revealDirection, text.length]);

  const trigger = useCallback(() => {
    orderRef.current = order();
    pointerRef.current = 0;
    setRevealed(new Set());
    setMotionDirection("forward");
    setIsAnimating(true);
  }, [order]);

  const reverse = useCallback(() => {
    const all = new Set(Array.from({ length: text.length }, (_, i) => i));
    orderRef.current = order().reverse();
    pointerRef.current = 0;
    setRevealed(all);
    setDisplayText(text);
    setMotionDirection("reverse");
    setIsAnimating(true);
  }, [order, text]);

  useEffect(() => {
    if (!isAnimating) return;
    let iteration = 0;
    timerRef.current = setInterval(() => {
      setRevealed(previous => {
        const next = new Set(previous);
        if (sequential) {
          const index = orderRef.current[pointerRef.current++];
          if (index !== undefined) motionDirection === "forward" ? next.add(index) : next.delete(index);
          setDisplayText(shuffle(next));
          if (pointerRef.current >= orderRef.current.length) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsAnimating(false);
            setIsDecrypted(motionDirection === "forward");
            if (motionDirection === "forward") setDisplayText(text);
          }
          return next;
        }
        iteration++;
        setDisplayText(shuffle(previous));
        if (iteration >= maxIterations) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsAnimating(false);
          setIsDecrypted(true);
          setDisplayText(text);
        }
        return previous;
      });
    }, speed);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isAnimating, maxIterations, motionDirection, sequential, shuffle, speed, text]);

  useEffect(() => {
    if (animateOn !== "view" && animateOn !== "inViewHover") return;
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting) && !hasAnimated) {
        trigger();
        setHasAnimated(true);
      }
    }, { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [animateOn, hasAnimated, trigger]);

  useEffect(() => {
    if (animateOn === "click") {
      setIsDecrypted(false);
      setDisplayText(shuffle(new Set()));
    } else {
      setDisplayText(text);
      setIsDecrypted(true);
    }
  }, [animateOn, shuffle, text]);

  const hoverProps = animateOn === "hover" || animateOn === "inViewHover" ? {
    onMouseEnter: () => { if (!isAnimating) trigger(); },
    onMouseLeave: () => { if (timerRef.current) clearInterval(timerRef.current); setIsAnimating(false); setDisplayText(text); setIsDecrypted(true); },
  } : {};

  return <span
    ref={containerRef}
    className={parentClassName}
    style={{ display: "inline-block", whiteSpace: "pre-wrap" }}
    onClick={animateOn === "click" ? () => {
      if (clickMode === "once" && isDecrypted) return;
      isDecrypted && clickMode === "toggle" ? reverse() : trigger();
    } : undefined}
    {...hoverProps}
  >
    <span style={srOnly}>{text}</span>
    <span aria-hidden="true">{displayText.split("").map((char, index) => <span key={index} className={revealed.has(index) || (!isAnimating && isDecrypted) ? className : encryptedClassName}>{char}</span>)}</span>
  </span>;
}
