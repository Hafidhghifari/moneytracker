"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const imageAspectRatio = 1288 / 1221;

function getImageWidth() {
  return Math.min(window.innerWidth, Math.max(64, Math.min(96, window.innerWidth * 0.08)));
}

export function MoneyCatMascot() {
  const mascotRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mascot = mascotRef.current;
    if (!mascot || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let imageWidth = getImageWidth();
    let imageHeight = imageWidth * imageAspectRatio;
    let maxX = Math.max(0, window.innerWidth - imageWidth);
    let maxY = Math.max(0, window.innerHeight - imageHeight);
    let x = Math.random() * maxX;
    let y = Math.random() * maxY;
    const angle = Math.random() * Math.PI * 2;
    const speed = 160 + Math.random() * 80;
    let velocityX = Math.cos(angle) * speed;
    let velocityY = Math.sin(angle) * speed;
    let previousTime = performance.now();
    let frameId = 0;

    mascot.style.width = `${imageWidth}px`;
    mascot.style.left = "0px";
    mascot.style.top = "0px";
    mascot.style.right = "auto";
    mascot.style.bottom = "auto";

    const renderPosition = () => {
      mascot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const handleResize = () => {
      imageWidth = getImageWidth();
      imageHeight = imageWidth * imageAspectRatio;
      maxX = Math.max(0, window.innerWidth - imageWidth);
      maxY = Math.max(0, window.innerHeight - imageHeight);
      mascot.style.width = `${imageWidth}px`;

      if (maxX === 0) {
        x = 0;
        velocityX = 0;
      } else if (x > maxX) {
        x = maxX;
        velocityX = -Math.abs(velocityX);
      }
      if (maxY === 0) {
        y = 0;
        velocityY = 0;
      } else if (y > maxY) {
        y = maxY;
        velocityY = -Math.abs(velocityY);
      }
      renderPosition();
    };

    const animate = (time: number) => {
      const elapsed = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      x += velocityX * elapsed;
      y += velocityY * elapsed;

      if (maxX === 0) {
        x = 0;
        velocityX = 0;
      } else if (x < 0) {
        x = -x;
        velocityX = Math.abs(velocityX);
      } else if (x > maxX) {
        x = 2 * maxX - x;
        velocityX = -Math.abs(velocityX);
      }

      if (maxY === 0) {
        y = 0;
        velocityY = 0;
      } else if (y < 0) {
        y = -y;
        velocityY = Math.abs(velocityY);
      } else if (y > maxY) {
        y = 2 * maxY - y;
        velocityY = -Math.abs(velocityY);
      }

      renderPosition();
      frameId = window.requestAnimationFrame(animate);
    };

    renderPosition();
    frameId = window.requestAnimationFrame(animate);
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <figure
      aria-hidden="true"
      className="moneycat-floating"
      ref={mascotRef}
    >
      <picture className="moneycat-picture">
        <source media="(prefers-reduced-motion: reduce)" srcSet="/images/moneyhist-zhaocai-cat.png" />
        <Image
          alt=""
          className="moneycat-image"
          height={1288}
          src="/images/moneyhist-zhaocai-cat.gif"
          unoptimized
          width={1221}
        />
      </picture>
    </figure>
  );
}
