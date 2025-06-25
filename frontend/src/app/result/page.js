"use client";

import { redirect, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import axios from "axios";

function ResultMain() {
  const [windowHeight, setWindowHeight] = useState(null);
  const [windowWidth, setWindowWidth] = useState(null);
  const searchParams = useSearchParams();
  const [gameId, setGameId] = useState(searchParams.get("gameId"));
  const [resultExists, setResultExists] = useState(false);
  const [results, setResults] = useState([]);
  const [totalScore, setTotalScore] = useState(0);

  const setWindow = () => {
    setWindowHeight(window.innerHeight);
    setWindowWidth(window.innerWidth);
  }

  // 合計点算出
  useEffect(() => {
    let total = 0
    for(let i = 0; i < results.length; i++) {
      total += results[i].Score;
    }

    setTotalScore(total);
  }, [results])

  useEffect(() => {
    setWindow();

    window.addEventListener('resize', () => {
      setWindow();
    });
  }, []);

  useEffect(() => {
    console.log('useEffect');
    let ignore = false;

    if(gameId == null) {
      redirect('/');
    }

    // 結果リクエスト
    async function startFetching() {
      await axios.get(`http://localhost:8000/getresult/${gameId}`)
        .then((res) => {
          console.log(res.data);
          setResults(res.data);
          setResultExists(true);
        });
    }

    startFetching();

    return () => {
      ignore = true;
    }
  }, [gameId]);

  return (
    <div className="d-flex justify-content-center" style={{width: windowWidth}}>
      <div className="d-flex align-items-center" style={{height: windowHeight}}>
        <div className="d-flex flex-column">
          <h1 className="text-center">RESULT</h1>
          {resultExists
            ? <div className="container-fluid">
                {results.map((result, index) => {
                  return (
                    <div key={index} className="row">
                      <div className="p-0 col-6"><img src={result.ImageURL} alt={index} height={100}></img></div>
                      <div className="p-0 col-6 text-end">{result.Score}</div>
                    </div>
                  )
                })}
                <div className="row">
                  <div className="p-0 col-6">total</div>
                  <div className="p-0 col-6 text-end">{totalScore}</div>
                </div>
              </div>
            : <div className="d-flex justify-content-center"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>
          }
          <div className="text-center"><a className="btn" href="/">TOP</a></div>
        </div>
      </div>
    </div>
  );
}

export default function Result() {
  return (
    <Suspense>
      <ResultMain></ResultMain>
    </Suspense>
  );
}