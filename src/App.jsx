import React, { useMemo, useRef, useState, useEffect } from "react";

const SENTENCES = [
  {
    id: "1",
    situation: "기호 표현",
    level: 1,
    korean: "나는 수영하는 것을 좋아해.",
    english: "I like swimming.",
    structure: "SVO",
    pattern: "like + V-ing",
    meaningType: "기호"
  },
  {
    id: "2",
    situation: "상태 표현",
    level: 1,
    korean: "나는 피곤해.",
    english: "I am tired.",
    structure: "SVC",
    pattern: "be + 형용사",
    meaningType: "상태"
  },
  {
    id: "3",
    situation: "가능 표현",
    level: 1,
    korean: "나는 수영할 수 있어.",
    english: "I can swim.",
    structure: "SVO",
    pattern: "can + 동사",
    meaningType: "가능"
  },
  {
    id: "4",
    situation: "이유 설명",
    level: 2,
    korean: "나는 피곤해서 집에 가고 싶어.",
    english: "I want to go home because I am tired.",
    structure: "복합문",
    pattern: "because + be + 형용사",
    meaningType: "이유"
  },
  {
    id: "5",
    situation: "기호 표현",
    level: 2,
    korean: "나는 아침에 커피 마시는 것을 좋아해.",
    english: "I like drinking coffee in the morning.",
    structure: "SVO",
    pattern: "like + V-ing + time expression",
    meaningType: "기호"
  },
  {
    id: "6",
    situation: "가능 표현",
    level: 2,
    korean: "나는 혼자서 영어로 주문할 수 있어.",
    english: "I can order in English by myself.",
    structure: "SVO",
    pattern: "can + 동사 + 부사구",
    meaningType: "가능"
  }
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
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1100
  };
}

function getStyles({ isMobile, isTablet }) {
  const pagePad = isMobile ? 12 : isTablet ? 18 : 24;
  const cardPad = isMobile ? 14 : 22;

  return {
    page: {
      minHeight: "100vh",
      background: "#f8fafc",
      color: "#0f172a",
      padding: pagePad,
      boxSizing: "border-box"
    },
    container: {
      maxWidth: 1180,
      margin: "0 auto"
    },
    topCard: {
      background: "white",
      borderRadius: 18,
      padding: cardPad,
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 2px rgba(15,23,42,0.05)",
      marginBottom: 16
    },
    grid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr" : "320px minmax(0,1fr)",
      gap: isMobile ? 12 : 18,
      alignItems: "start"
    },
    card: {
      background: "white",
      borderRadius: 18,
      padding: cardPad,
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 2px rgba(15,23,42,0.05)"
    },
    title: {
      margin: 0,
      fontSize: isMobile ? 24 : 32,
      lineHeight: 1.15
    },
    helper: {
      margin: "8px 0 0 0",
      color: "#64748b",
      fontSize: 14,
      lineHeight: 1.5
    },
    topRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: isMobile ? "stretch" : "flex-start",
      flexDirection: isMobile ? "column" : "row",
      gap: 12
    },
    buttonRow: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      width: isMobile ? "100%" : "auto"
    },
    button: {
      border: "1px solid #cbd5e1",
      background: "white",
      borderRadius: 10,
      minHeight: 42,
      padding: "10px 14px",
      fontSize: 14,
      cursor: "pointer",
      flex: isMobile ? 1 : "0 0 auto"
    },
    primaryButton: {
      border: "1px solid #0f172a",
      background: "#0f172a",
      color: "white",
      borderRadius: 10,
      minHeight: 42,
      padding: "10px 14px",
      fontSize: 14,
      cursor: "pointer",
      flex: isMobile ? 1 : "0 0 auto"
    },
    sectionTitle: {
      marginTop: 0,
      marginBottom: 14,
      fontSize: 18
    },
    filterGroup: {
      marginBottom: 18
    },
    filterLabel: {
      display: "block",
      marginBottom: 8,
      fontSize: 14,
      fontWeight: 600
    },
    checkboxList: {
      display: "grid",
      gap: 8,
      fontSize: 14
    },
    accordionCard: {
      border: "1px solid #e2e8f0",
      borderRadius: 14,
      overflow: "hidden",
      background: "#fff"
    },
    accordionHeader: {
      padding: "14px 16px",
      background: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
      fontWeight: 700,
      fontSize: 15
    },
    sentenceCard: {
      border: "1px solid #e2e8f0",
      borderRadius: 12,
      padding: isMobile ? 14 : 16,
      background: "#fff"
    },
    metaRow: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      marginTop: 10,
      marginBottom: 12
    },
    chip: {
      fontSize: 12,
      padding: "5px 8px",
      borderRadius: 999,
      background: "#f1f5f9",
      color: "#475569"
    },
    trainingPrompt: {
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: 14,
      padding: isMobile ? 16 : 24
    },
    trainingKorean: {
      fontSize: isMobile ? 22 : 32,
      fontWeight: 700,
      lineHeight: 1.4,
      marginTop: 8
    },
    answerBox: {
      background: "#ecfdf5",
      border: "1px solid #a7f3d0",
      borderRadius: 14,
      padding: isMobile ? 16 : 18,
      fontSize: isMobile ? 19 : 24,
      fontWeight: 700,
      lineHeight: 1.5,
      marginTop: 14
    },
    select: {
      width: "100%",
      boxSizing: "border-box",
      border: "1px solid #cbd5e1",
      borderRadius: 10,
      padding: "12px 14px",
      fontSize: 15,
      minHeight: 44,
      background: "white"
    }
  };
}

export default function IssacCsfEnglishApp() {
  const viewport = useViewport();
  const styles = getStyles(viewport);
  const timeoutRef = useRef(null);

  const [mode, setMode] = useState("learn");
  const [selectedSituations, setSelectedSituations] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [questionCount, setQuestionCount] = useState("10");
  const [englishSpeed, setEnglishSpeed] = useState("1");
  const [playMode, setPlayMode] = useState("sequence");
  const [delaySeconds, setDelaySeconds] = useState(3);
  const [englishRepeat, setEnglishRepeat] = useState(1);
  const [isTraining, setIsTraining] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhase, setCurrentPhase] = useState("idle");
  const [manualReveal, setManualReveal] = useState(false);
  const [openSituations, setOpenSituations] = useState({});

  const situations = useMemo(
    () => Array.from(new Set(SENTENCES.map((item) => item.situation))),
    []
  );
  const levels = [1, 2, 3, 4, 5];

  const baseFiltered = useMemo(() => {
    return SENTENCES.filter((item) => {
      const situationMatch =
        selectedSituations.length === 0 || selectedSituations.includes(item.situation);
      const levelMatch =
        selectedLevels.length === 0 || selectedLevels.includes(item.level);
      return situationMatch && levelMatch;
    });
  }, [selectedSituations, selectedLevels]);

  const groupedForLearning = useMemo(() => {
    const map = new Map();
    baseFiltered.forEach((item) => {
      if (!map.has(item.situation)) map.set(item.situation, []);
      map.get(item.situation).push(item);
    });
    return Array.from(map.entries()).map(([situation, items]) => ({
      situation,
      items: items.sort((a, b) => a.level - b.level || a.english.localeCompare(b.english))
    }));
  }, [baseFiltered]);

  const trainingRows = useMemo(() => {
    let rows = [...baseFiltered];

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
  }, [baseFiltered, playMode, questionCount]);

  const currentItem = trainingRows[currentIndex] || null;

  useEffect(() => () => stopSpeech(timeoutRef), []);

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
        let repeats = 0;
        const playAnswer = () => {
          repeats += 1;
          speakText(item.english, "en-US", Number(englishSpeed), () => {
            if (repeats < englishRepeat) {
              timeoutRef.current = setTimeout(playAnswer, 700);
            } else {
              timeoutRef.current = setTimeout(() => {
                setCurrentIndex((prev) => prev + 1);
              }, 900);
            }
          });
        };
        playAnswer();
      }, delaySeconds * 1000);
    });
  }, [
    isTraining,
    currentIndex,
    trainingRows,
    delaySeconds,
    englishRepeat,
    englishSpeed
  ]);

  const toggleSituation = (situation) => {
    setSelectedSituations((prev) =>
      prev.includes(situation)
        ? prev.filter((item) => item !== situation)
        : [...prev, situation]
    );
  };

  const toggleLevel = (level) => {
    setSelectedLevels((prev) =>
      prev.includes(level)
        ? prev.filter((item) => item !== level)
        : [...prev, level]
    );
  };

  const startTraining = () => {
    if (!trainingRows.length) return;
    stopSpeech(timeoutRef);
    setManualReveal(false);
    setCurrentIndex(0);
    setCurrentPhase("idle");
    setIsTraining(true);
  };

  const stopTrainingFlow = () => {
    setIsTraining(false);
    setCurrentPhase("idle");
    stopSpeech(timeoutRef);
  };

  const toggleOpenSituation = (situation) => {
    setOpenSituations((prev) => ({
      ...prev,
      [situation]: !prev[situation]
    }));
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topCard}>
          <div style={styles.topRow}>
            <div>
              <h1 style={styles.title}>Issac CSF English</h1>
              <p style={styles.helper}>
                상황, 난이도, 문장 구조를 기준으로 학습하고 훈련하는 영어 출력 서비스
              </p>
            </div>
            <div style={styles.buttonRow}>
              <button
                style={mode === "learn" ? styles.primaryButton : styles.button}
                onClick={() => setMode("learn")}
              >
                학습 모드
              </button>
              <button
                style={mode === "training" ? styles.primaryButton : styles.button}
                onClick={() => setMode("training")}
              >
                훈련 모드
              </button>
            </div>
          </div>
        </div>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>필터</h2>

            <div style={styles.filterGroup}>
              <div style={styles.filterLabel}>상황</div>
              <div style={styles.checkboxList}>
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

            <div style={styles.filterGroup}>
              <div style={styles.filterLabel}>난이도</div>
              <div style={styles.checkboxList}>
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
                <div style={styles.filterGroup}>
                  <div style={styles.filterLabel}>문항 수</div>
                  <select
                    style={styles.select}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                  >
                    <option value="5">5문항</option>
                    <option value="10">10문항</option>
                    <option value="20">20문항</option>
                    <option value="all">전체</option>
                  </select>
                </div>

                <div style={styles.filterGroup}>
                  <div style={styles.filterLabel}>영어 듣기 속도</div>
                  <select
                    style={styles.select}
                    value={englishSpeed}
                    onChange={(e) => setEnglishSpeed(e.target.value)}
                  >
                    <option value="0.5">0.5배속</option>
                    <option value="0.75">0.75배속</option>
                    <option value="1">1배속</option>
                  </select>
                </div>

                <div style={styles.filterGroup}>
                  <div style={styles.filterLabel}>재생 방식</div>
                  <select
                    style={styles.select}
                    value={playMode}
                    onChange={(e) => setPlayMode(e.target.value)}
                  >
                    <option value="sequence">순서 재생</option>
                    <option value="random">랜덤 재생</option>
                  </select>
                </div>

                <div style={styles.filterGroup}>
                  <div style={styles.filterLabel}>정답 전 텀</div>
                  <select
                    style={styles.select}
                    value={delaySeconds}
                    onChange={(e) => setDelaySeconds(Number(e.target.value))}
                  >
                    <option value={2}>2초</option>
                    <option value={3}>3초</option>
                    <option value={5}>5초</option>
                  </select>
                </div>

                <div style={styles.filterGroup}>
                  <div style={styles.filterLabel}>영어 정답 반복</div>
                  <select
                    style={styles.select}
                    value={englishRepeat}
                    onChange={(e) => setEnglishRepeat(Number(e.target.value))}
                  >
                    <option value={1}>1회</option>
                    <option value={2}>2회</option>
                  </select>
                </div>

                <div style={styles.buttonRow}>
                  <button style={styles.primaryButton} onClick={startTraining}>시작</button>
                  <button style={styles.button} onClick={stopTrainingFlow}>정지</button>
                </div>
              </>
            )}
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            {mode === "learn" && (
              groupedForLearning.length === 0 ? (
                <div style={styles.card}>선택한 조건에 맞는 문장이 없습니다.</div>
              ) : (
                groupedForLearning.map((group) => {
                  const isOpen = openSituations[group.situation] ?? true;
                  return (
                    <div key={group.situation} style={styles.accordionCard}>
                      <button
                        style={{
                          ...styles.accordionHeader,
                          width: "100%",
                          textAlign: "left",
                          cursor: "pointer",
                          border: "none"
                        }}
                        onClick={() => toggleOpenSituation(group.situation)}
                      >
                        {group.situation} ({group.items.length})
                      </button>
                      {isOpen && (
                        <div style={{ padding: 14, display: "grid", gap: 12 }}>
                          {group.items.map((item) => (
                            <div key={item.id} style={styles.sentenceCard}>
                              <div style={{ fontSize: 16, lineHeight: 1.6 }}>{item.korean}</div>
                              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8, lineHeight: 1.6 }}>
                                {item.english}
                              </div>
                              <div style={styles.metaRow}>
                                <span style={styles.chip}>구조: {item.structure}</span>
                                <span style={styles.chip}>문형: {item.pattern}</span>
                                <span style={styles.chip}>의미: {item.meaningType}</span>
                                <span style={styles.chip}>난이도: {item.level}</span>
                              </div>
                              <div style={styles.buttonRow}>
                                <button
                                  style={styles.button}
                                  onClick={() => speakText(item.korean, "ko-KR", 0.95)}
                                >
                                  한국어 듣기
                                </button>
                                <button
                                  style={styles.button}
                                  onClick={() => speakText(item.english, "en-US", 1)}
                                >
                                  영어 듣기
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )
            )}

            {mode === "training" && (
              <div style={styles.card}>
                <div style={styles.topRow}>
                  <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>훈련</h2>
                  <div style={{ color: "#64748b", fontSize: 14 }}>
                    {trainingRows.length
                      ? `${Math.min(currentIndex + 1, trainingRows.length)} / ${trainingRows.length}`
                      : "0 / 0"}
                  </div>
                </div>

                {!trainingRows.length ? (
                  <div style={{ marginTop: 16 }}>선택한 조건에 맞는 문항이 없습니다.</div>
                ) : currentItem ? (
                  <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
                    <div style={styles.trainingPrompt}>
                      <div style={{ color: "#64748b", fontSize: 14 }}>현재 문항</div>
                      <div style={styles.trainingKorean}>{currentItem.korean}</div>
                    </div>

                    <div style={styles.sentenceCard}>
                      <div style={{ color: "#64748b", fontSize: 14, marginBottom: 8 }}>현재 상태</div>
                      <div style={{ lineHeight: 1.6 }}>
                        {currentPhase === "idle" && "대기 중"}
                        {currentPhase === "korean" && "한국어 cue 재생 중"}
                        {currentPhase === "pause" && "영어를 먼저 말해보세요"}
                        {currentPhase === "english" && "정답 영어 재생 중"}
                      </div>
                    </div>

                    <div style={styles.buttonRow}>
                      <button
                        style={styles.button}
                        onClick={() => speakText(currentItem.korean, "ko-KR", 0.95)}
                      >
                        한국어 다시 듣기
                      </button>
                      <button
                        style={styles.button}
                        onClick={() => setManualReveal(!manualReveal)}
                      >
                        {manualReveal ? "영어 숨기기" : "영어 보기"}
                      </button>
                      {manualReveal && (
                        <button
                          style={styles.primaryButton}
                          onClick={() => speakText(currentItem.english, "en-US", Number(englishSpeed))}
                        >
                          영어 정답 듣기
                        </button>
                      )}
                    </div>

                    {manualReveal && (
                      <div style={styles.answerBox}>{currentItem.english}</div>
                    )}
                  </div>
                ) : (
                  <div style={{ marginTop: 16 }}>시작 버튼을 누르면 훈련이 시작됩니다.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
