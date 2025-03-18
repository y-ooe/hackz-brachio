"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    window.addEventListener('resize', () => {
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
    });
  }, []);
  
  return (
    <div className="d-flex justify-content-center" style={{width: windowWidth}}>
      <div className="d-flex align-items-center" style={{height: windowHeight}}>
        <div className="d-flex flex-column">
          <h1 className="text-center mb-3">TITLE</h1>
          <Link className="btn mb-1" href="/game">GAME</Link>
          <Link className="btn mb-1" href="/ranking">RANKING</Link>
        </div>
      </div>
    </div>
  );
}
