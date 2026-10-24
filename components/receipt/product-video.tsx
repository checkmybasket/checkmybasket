"use client";

import { useState } from "react";
import { getImageProps } from "next/image";
import { Play } from "lucide-react";

const base = "/videos/secret-santa";
const common = { alt: "", sizes: "(min-width: 960px) 720px, (min-width: 640px) 90vw, 360px" };
const { props: { srcSet: desktop } } = getImageProps({ ...common, src: `${base}-landscape-v2.jpg`, width: 1920, height: 1080 });
const { props: mobile } = getImageProps({ ...common, src: `${base}-vertical-v2.jpg`, width: 1080, height: 1920 });

export function ProductVideo() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  return (
    <div className="receipt-video-frame">
      {failed ? (
        <div className="receipt-video-error" role="alert">
          <p>The video couldn&apos;t load. Try opening it directly, or read the transcript below.</p>
          <a href={`${base}-landscape-v2.mp4`}>Open widescreen video</a>
          <a href={`${base}-vertical-v2.mp4`}>Open vertical video</a>
          <button type="button" className="receipt-button receipt-button-secondary" onClick={() => { setFailed(false); setVideoSrc(null); }}>Try again</button>
        </div>
      ) : videoSrc ? (
        <video
          aria-label="How CheckMyBasket works: 30-second overview"
          aria-describedby="video-description"
          controls
          autoPlay
          muted
          playsInline
          preload="none"
          src={videoSrc}
          tabIndex={0}
          ref={node => { node?.focus({ preventScroll: true }); }}
          onError={() => setFailed(true)}
        >
          <track kind="captions" src={`${base}-v2.vtt`} srcLang="en" label="English" />
          Your browser cannot play this video. Read the transcript below.
        </video>
      ) : (
        <button type="button" className="receipt-video-play" aria-label="Play the 30-second CheckMyBasket overview" onClick={() => setVideoSrc(`${base}-${window.matchMedia("(max-width: 639px)").matches ? "vertical" : "landscape"}-v2.mp4`)}>
          <picture>
            <source media="(min-width: 640px)" srcSet={desktop} />
            {/* getImageProps supplies Next.js image optimisation for this art-directed picture. */}
            <img {...mobile} alt="" />
          </picture>
          <span className="receipt-video-play-label"><Play size={24} aria-hidden="true" fill="currentColor" /> Watch · 30 seconds</span>
        </button>
      )}
      <noscript><p><a href={`${base}-landscape-v2.mp4`}>Watch the overview</a> or read the transcript below.</p></noscript>
    </div>
  );
}
