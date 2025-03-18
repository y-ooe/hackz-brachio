"use client";

import { redirect, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Result() {
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const searchParams = useSearchParams();
  const gameId = searchParams.get("gameId");
  const [resultExists, setResultExists] = useState(false);

  useEffect(() => {
    window.addEventListener('resize', () => {
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
    });
  }, []);

  if (gameId == null) {
    redirect('/');
  } else {
    // 結果リクエスト
  }

  return (
    <div className="d-flex justify-content-center" style={{width: windowWidth}}>
      {/* {resultExists
        ? <div>result exists</div>
        : <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
      } */}
      <div className="d-flex align-items-center" style={{height: windowHeight}}>
        <div className="d-flex flex-column container-fluid">
          <h1 className="text-center">RESULT</h1>
          <div className="row">
            <div className="p-0 col-6"><img alt="screenshot1"></img></div>
            <div className="p-0 col-6 text-end">score</div>
            <div className="p-0 col-6"><img alt="screenshot2"></img></div>
            <div className="p-0 col-6 text-end">score</div>
            <div className="p-0 col-6"><img alt="screenshot3"></img></div>
            <div className="p-0 col-6 text-end">score</div>
            <div className="p-0 col-6"><img alt="screenshot4"></img></div>
            <div className="p-0 col-6 text-end">score</div>
            <div className="p-0 col-6"><img alt="screenshot5"></img></div>
            <div className="p-0 col-6 text-end">score</div>
          </div>
          <div className="text-center"><Link className="btn" href="/">TOP</Link><Link className="btn" href="/game">RETRY</Link></div>
        </div>
      </div>
    </div>
  );
}