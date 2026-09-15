/* eslint-disable */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, BookOpen, Headphones, Mic2, FileText, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import GrammarSection from "../components/versant/GrammarSection";
import PassageSection from "../components/versant/PassageSection";
import SpeakingSection from "../components/versant/SpeakingSection";
import { getVersantModule, submitVersant, submitVersantSpeaking } from "../services/api";

const MODULES = [
  { key: "grammar",   label: "Spot the Error",           icon: FileText,   color: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.25)", text: "#f87171",  num: "01", desc: "Identify grammatical errors in sentences" },
  { key: "reading",   label: "Reading Comprehension",    icon: BookOpen,   color: "rgba(37,99,235,0.12)",   border: "rgba(37,99,235,0.25)",   text: "#60a5fa",  num: "02", desc: "Read passages and answer questions" },
  { key: "listening", label: "Listening Comprehension",  icon: Headphones, color: "rgba(168,85,247,0.12)",  border: "rgba(168,85,247,0.25)",  text: "#c084fc",  num: "03", desc: "Listen to audio and answer questions" },
  { key: "speaking",  label: "Speaking Assessment",      icon: Mic2,       color: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.25)",  text: "#fbbf24",  num: "04", desc: "Speak your answer and get AI evaluation" },
];

const VersantTest = () => {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState(null);
  const [questions, setQuestions]       = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [submitted, setSubmitted]       = useState(false);
  const [results, setResults]           = useState(null);
  const [submitting, setSubmitting]     = useState(false);

  const loadModule = async (key) => {
    setLoading(true); setError(""); setSubmitted(false); setResults(null); setQuestions([]);
    try {
      const res = await getVersantModule(key);
      setQuestions(res.data.data);
      setActiveModule(key);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load module.");
    } finally { setLoading(false); }
  };

  const handleMCQSubmit = async (answers) => {
    if (submitting || submitted) return;
    setSubmitting(true);
    try {
      if (activeModule === "grammar") {
        const res = await submitVersant({ module: activeModule, questionId: String(questions[0]?._id || ""), answers });
        setResults(res.data);
      } else {
        const grouped = {};
        answers.forEach((a) => { if (!grouped[a.questionId]) grouped[a.questionId] = []; grouped[a.questionId].push(a); });
        let totalScore = 0, totalCount = 0;
        const allAnswers = [];
        for (const [qId, qAnswers] of Object.entries(grouped)) {
          const res = await submitVersant({ module: activeModule, questionId: qId, answers: qAnswers });
          totalScore += res.data.score; totalCount += res.data.total;
          allAnswers.push(...(res.data.answers || []));
        }
        setResults({ score: totalScore, total: totalCount, percentage: totalCount > 0 ? Math.round((totalScore / totalCount) * 100) : 0, answers: allAnswers });
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed.");
    } finally { setSubmitting(false); }
  };

  const handleSpeakingSubmit = async ({ questionId, transcript, submitAll }) => {
    if (submitAll) { setSubmitted(true); return; }
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await submitVersantSpeaking({ questionId, transcript });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Speaking evaluation failed.");
    } finally { setSubmitting(false); }
  };

  const handleBack = () => { setActiveModule(null); setQuestions([]); setSubmitted(false); setResults(null); setError(""); };

  const activeMeta = MODULES.find((m) => m.key === activeModule);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1a" }}>
      <Navbar />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "36px 24px 60px" }}>

        {/* Back */}
        {activeModule && (
          <button onClick={handleBack}
            style={{ display: "flex", alignItems: "center", gap: "7px", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "13px", cursor: "pointer", marginBottom: "24px" }}
            onMouseEnter={e => e.currentTarget.style.color = "white"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>
            <ArrowLeft size={14} /> Back to Modules
          </button>
        )}

        {/* Header */}
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "white", marginBottom: "6px" }}>
          {activeModule ? activeMeta?.label : "Versant Assessment"}
        </h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", marginBottom: "28px" }}>
          {activeModule ? activeMeta?.desc : "Evaluate your English proficiency across grammar, comprehension, and speaking."}
        </p>

        {/* Error */}
        {error && (
          <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", fontSize: "12px", color: "#fca5a5", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Module selection */}
        {!activeModule && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "12px" }}>
            {MODULES.map(({ key, label, icon: Icon, color, border, text, num, desc }) => (
              <button key={key} onClick={() => loadModule(key)}
                style={{ padding: "24px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.background = color; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)" }}>{num}</span>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: color, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={17} style={{ color: text }} />
                  </div>
                </div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "white", marginBottom: "5px" }}>{label}</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{desc}</p>
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Loader2 size={28} style={{ color: "#60a5fa", margin: "0 auto 12px", animation: "spin 1s linear infinite" }} />
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Loading module...</p>
          </div>
        )}

        {/* Submitting */}
        {submitting && (
          <div style={{ textAlign: "center", padding: "16px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <Loader2 size={16} style={{ color: "#60a5fa", animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>Evaluating your answers...</span>
          </div>
        )}

        {/* Active module */}
        {!loading && activeModule && questions.length > 0 && (
          <>
            {activeModule === "grammar"   && <GrammarSection questions={questions} onSubmit={handleMCQSubmit} submitted={submitted} results={results} />}
            {activeModule === "reading"   && <PassageSection passages={questions} mode="reading"   onSubmit={handleMCQSubmit} submitted={submitted} results={results} />}
            {activeModule === "listening" && <PassageSection passages={questions} mode="listening" onSubmit={handleMCQSubmit} submitted={submitted} results={results} />}
            {activeModule === "speaking"  && <SpeakingSection prompts={questions} onSubmit={handleSpeakingSubmit} submitted={submitted} results={results} />}
          </>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default VersantTest;
