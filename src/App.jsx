import React, { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const SAMPLE_SENTENCES = [
  {
    id: "1",
    situation: "기호 표현",
    level: 1,
    korean: "나는 수영하는 것을 좋아해.",
    english: "I like swimming.",
    structure: "SVO",
    pattern: "like + V-ing",
    meaningType: "기호",
    sort_order: 0,
  },
  {
    id: "2",
    situation: "상태 표현",
    level: 1,
    korean: "나는 피곤해.",
    english: "I am tired.",
    structure: "SVC",
    pattern: "be + 형용사",
    meaningType: "상태",
    sort_order: 1,
  },
  {
    id: "3",
    situation: "가능 표현",
    level: 1,
    korean: "나는 수영할 수 있어.",
    english: "I can swim.",
    structure: "SVO",
    pattern: "can + 동사",
    meaningType: "가능",
    sort_order: 2,
  },
];

function speakText(text, lang = "en-US", rate = 1, onEnd) {
  if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
}

function stopSpeech(timeoutRef) {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  if (timeoutRef.current) clearTimeout(timeoutRef.current);
}

function useViewport() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1100,
  };
}

export default function App() {
  const { isMobile, isTablet } = useViewport();
  const timeoutRef = useRef(null);

  const [sentences, setSentences] = useState(SAMPLE_SENTENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState("local");

  const [mode, setMode] = useState("learn");
  const [selectedSituations, setSelectedSituations] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);

  const [questionCount, setQuestionCount] = useState("10");
  const [englishSpeed, setEnglishSpeed] = useState("1");
  const [playMode, setPlayMode] = useState("sequence");
  const [delaySeconds, setDelaySeconds] = useState(3);

  const [isTraining, setIsTraining] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhase, setCurrentPhase] = useState("idle");
  const [manualReveal, setManualReveal] = useState(false);

  useEffect(() => {
    const loadSentences = async () => {
      setIsLoading(true);
      try {
        if (!supabase) {
          setSentences(SAMPLE_SENTENCES);
          setDataSource("local");
          return;
        }

        const { data, error } = await supabase
          .from("csf_sentences")
          .select(
            "id, situation, level, korean, english, structure, pattern, meaning_type, sort_order"
          )
          .order("sort_order", { ascending: true });

        if (error) throw error;

        const normalized = (data || []).map((item, index) => ({
          id: item.id,
          situation: item.situation || "기타",
          level: Number(item.level) || 1,
          korean: item.korean || "",
          english: item.english || "",
          structure: item.structure || "",
          pattern: item.pattern || "",
          meaningType: item.meaning_type || "",
          sort_order: Number.isFinite(item.sort_order) ? item.sort_order : index,
        }));

        if (normalized.length > 0) {
          setSentences(normalized);
          setDataSource("supabase");
        } else {
          setSentences(SAMPLE_SENTENCES);
          setDataSource("local");
        }
      } catch (error) {
        console.error(error);
        setSentences(SAMPLE_SENTENCES);
        setDataSource("local");
      } finally {
        setIsLoading(false);
      }
    };

    loadSentences();

    return () => stopSpeech(timeoutRef);
  }, []);

  const situations = useMemo(
    () => Array.from(new Set(sentences.map((item) => item.situation))),
    [sentences]
  );

  const levels = [1, 2, 3, 4, 5];

  const filteredSentences = useMemo(() => {
    return sentences.filter((item) => {
      const okSituation =
        selectedSituations.length === 0 || selectedSituations.includes(item.situation);
      const okLevel =
        selectedLevels.length === 0 || selectedLevels.includes(item.level);
      return okSituation && okLevel;
    });
  }, [sentences, selectedSituations, selectedLevels]);

  const grouped = useMemo(() => {
    const map = new Map();
    filteredSentences.forEach((item) => {
      if (!map.has(item.situation)) map.set(item.situation, []);
      map.get(item.situation).push(item);
    });
    return Array.from(map.entries());
  }, [filteredSentences]);

  const trainingRows = useMemo(() => {
    let rows = [...filteredSentences];

    if (playMode === "random") {
      for (let i = rows.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [rows[i], rows[j]] = [rows[j], rows[i]];
      }
    }

    if (questionCount !== "all") {
      rows = rows.slice(0, Number(questionCount));
    }

    return rows;
  }, [filteredSentences, playMode, questionCount]);

  const currentItem = trainingRows[currentIndex] || null;

  useEffect(() => {
    if (!isTraining || !trainingRows.length) return;

    if (currentIndex >= trainingRows.length) {
      setIsTraining(false);
      setCurrentPhase("idle");
      stopSpeech(timeoutRef);
      return;
    }

    const item = trainingRows[currentIndex];
    setCurrentPhase("korean");

    speakText(item.korean, "ko-KR", 0.95, () => {
      setCurrentPhase("pause");
      timeoutRef.current = setTimeout(() => {
        setCurrentPhase("english");
        speakText(item.english, "en-US", Number(englishSpeed), () => {
          timeoutRef.current = setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
          }, 900);
        });
      }, delaySeconds * 1000);
    });
  }, [isTraining, trainingRows, currentIndex, englishSpeed, delaySeconds]);

  const toggleSituation = (value) => {
    setSelectedSituations((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  const toggleLevel = (value) => {
    setSelectedLevels((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  const startTraining = () => {
    if (!trainingRows.length) return;
    stopSpeech(timeoutRef);
    setCurrentIndex(0);
    setCurrentPhase("idle");
    setManualReveal(false);
    setIsTraining(true);
  };

  const stopTrainingFlow = () => {
    setIsTraining(false);
    setCurrentPhase("idle");
    stopSpeech(timeoutRef);
  };

  const pageStyle = {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#0f172a",
    padding: isMobile ? 12 : isTablet ? 18 : 24,
    boxSizing: "border-box",
  };

  const containerStyle = {
    maxWidth: 1180,
    margin: "0 auto",
  };

  const cardStyle = {
    background: "white",
    borderRadius: 16,
    padding: isMobile ? 14 : 20,
    border: "1px solid #e2e8f0",
  };

  if (isLoading) {
    return <div style={{ padding: 24 }}>불러오는 중...</div>;
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: isMobile ? 24 : 32 }}>
                Issac CSF English
              </h1>
              <p style={{ margin: "8px 0 0 0", color: "#64748b" }}>
                데이터 소스: {dataSource}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => setMode("learn")}>학습 모드</button>
              <button onClick={() => setMode("training")}>훈련 모드</button>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile || isTablet ? "1fr" : "320px 1fr",
            gap: 16,
          }}
        >
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>필터</h2>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>상황</div>
              <div style={{ display: "grid", gap: 8 }}>
                {situations.map((situation) => (
                  <label key={situation}>
                    <input
                      type="checkbox"
                      checked={selectedSituations.includes(situation)}
                      onChange={() => toggleSituation(situation)}
                    />{" "}
                    {situation}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>난이도</div>
              <div style={{ display: "grid", gap: 8 }}>
                {levels.map((level) => (
                  <label key={level}>
                    <input
                      type="checkbox"
                      checked={selectedLevels.includes(level)}
                      onChange={() => toggleLevel(level)}
                    />{" "}
                    Level {level}
                  </label>
                ))}
              </div>
            </div>

            {mode === "training" && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>문항 수</div>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    style={{ width: "100%" }}
                  >
                    <option value="5">5문항</option>
                    <option value="10">10문항</option>
                    <option value="20">20문항</option>
                    <option value="all">전체</option>
                  </select>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>영어 속도</div>
                  <select
                    value={englishSpeed}
                    onChange={(e) => setEnglishSpeed(e.target.value)}
                    style={{ width: "100%" }}
                  >
                    <option value="0.5">0.5배속</option>
                    <option value="0.75">0.75배속</option>
                    <option value="1">1배속</option>
                  </select>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>재생 방식</div>
                  <select
                    value={playMode}
                    onChange={(e) => setPlayMode(e.target.value)}
                    style={{ width: "100%" }}
                  >
                    <option value="sequence">순서 재생</option>
                    <option value="random">랜덤 재생</option>
                  </select>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>정답 전 텀</div>
                  <select
                    value={delaySeconds}
                    onChange={(e) => setDelaySeconds(Number(e.target.value))}
                    style={{ width: "100%" }}
                  >
                    <option value={2}>2초</option>
                    <option value={3}>3초</option>
                    <option value={5}>5초</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={startTraining}>시작</button>
                  <button onClick={stopTrainingFlow}>정지</button>
                </div>
              </>
            )}
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            {mode === "learn" &&
              (grouped.length === 0 ? (
                <div style={cardStyle}>선택한 조건에 맞는 문장이 없습니다.</div>
              ) : (
                grouped.map(([situation, items]) => (
                  <div key={situation} style={cardStyle}>
                    <h3 style={{ marginTop: 0 }}>{situation}</h3>
                    <div style={{ display: "grid", gap: 12 }}>
                      {items.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: 12,
                            padding: 14,
                          }}
                        >
                          <div>{item.korean}</div>
                          <div style={{ marginTop: 8, fontWeight: 700 }}>
                            {item.english}
                          </div>
                          <div style={{ marginTop: 10, fontSize: 13, color: "#64748b" }}>
                            구조: {item.structure} / 문형: {item.pattern} / 의미:{" "}
                            {item.meaningType} / 난이도: {item.level}
                          </div>
                          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                            <button onClick={() => speakText(item.korean, "ko-KR", 0.95)}>
                              한국어 듣기
                            </button>
                            <button onClick={() => speakText(item.english, "en-US", 1)}>
                              영어 듣기
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ))}

            {mode === "training" && (
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h2 style={{ marginTop: 0 }}>훈련</h2>
                  <div>
                    {trainingRows.length
                      ? `${Math.min(currentIndex + 1, trainingRows.length)} / ${trainingRows.length}`
                      : "0 / 0"}
                  </div>
                </div>

                {!trainingRows.length ? (
                  <div>선택한 조건에 맞는 문항이 없습니다.</div>
                ) : currentItem ? (
                  <>
                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: 16,
                      }}
                    >
                      <div style={{ color: "#64748b", fontSize: 14 }}>현재 문항</div>
                      <div style={{ marginTop: 8, fontSize: isMobile ? 22 : 30, fontWeight: 700 }}>
                        {currentItem.korean}
                      </div>
                    </div>

                    <div style={{ marginTop: 14 }}>
                      현재 상태:{" "}
                      {currentPhase === "idle" && "대기 중"}
                      {currentPhase === "korean" && "한국어 cue 재생 중"}
                      {currentPhase === "pause" && "영어를 먼저 말해보세요"}
                      {currentPhase === "english" && "정답 영어 재생 중"}
                    </div>

                    <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button onClick={() => speakText(currentItem.korean, "ko-KR", 0.95)}>
                        한국어 다시 듣기
                      </button>
                      <button onClick={() => setManualReveal(!manualReveal)}>
                        {manualReveal ? "영어 숨기기" : "영어 보기"}
                      </button>
                      {manualReveal && (
                        <button
                          onClick={() =>
                            speakText(currentItem.english, "en-US", Number(englishSpeed))
                          }
                        >
                          영어 정답 듣기
                        </button>
                      )}
                    </div>

                    {manualReveal && (
                      <div
                        style={{
                          marginTop: 14,
                          background: "#ecfdf5",
                          border: "1px solid #a7f3d0",
                          borderRadius: 12,
                          padding: 16,
                          fontSize: isMobile ? 19 : 24,
                          fontWeight: 700,
                        }}
                      >
                        {currentItem.english}
                      </div>
                    )}
                  </>
                ) : (
                  <div>시작 버튼을 누르면 훈련이 시작됩니다.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}