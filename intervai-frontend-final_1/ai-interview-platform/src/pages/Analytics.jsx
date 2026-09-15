/* eslint-disable */
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useStats } from "../context/StatsContext";
import { useNavigate } from "react-router-dom";

const Analytics = () => {
  const [period, setPeriod] = useState("30");
  const { stats, loading }  = useStats();
  const navigate = useNavigate();

  const avgScore   = stats?.avgScore ?? 0;
  const interviews = stats?.totalInterviews ?? 0;
  const commAvg    = stats?.communicationAvg ?? { fluency: 0, confidence: 0, clarity: 0 };
  const recentSessions = stats?.recentSessions ?? [];

  const fmtAgo = (d) => {
    if (!d) return "";
    const diff = Math.floor((Date.now() - new Date(d)) / 1000);
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const metrics = [
    { label: "Communication",   value: commAvg.fluency },
    { label: "Technical depth", value: avgScore },
    { label: "Confidence",      value: commAvg.confidence },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--app-bg, #0a0f1a)" }}>
      <Navbar />

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "36px 24px 60px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "white" }}>My analytics</h1>
          <div style={{ display: "flex", gap: "4px", padding: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "10px" }}>
            {[["30","30 days"],["90","90 days"],["all","All time"]].map(([v, l]) => (
              <button key={v} onClick={() => setPeriod(v)}
                style={{ padding: "7px 16px", borderRadius: "7px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "none", transition: "all 0.15s",
                  background: period === v ? "rgba(255,255,255,0.12)" : "transparent",
                  color: period === v ? "white" : "rgba(255,255,255,0.45)" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Metric cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "16px" }}>
          {metrics.map(({ label, value }, i) => (
            <div key={label} style={{ padding: "24px", background: "rgba(255,255,255,0.03)", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "14px" }}>{label}</p>
              <p style={{ fontSize: "22px", fontWeight: 700, color: "white" }}>
                {loading ? "…" : value > 0 ? `${value}%` : "—"}
              </p>
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div style={{ padding: "32px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center", marginBottom: "32px", minHeight: "160px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {recentSessions.length === 0 ? (
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", lineHeight: 1.7 }}>
              No session data yet — your skill breakdown chart will appear after your first completed interview.
            </p>
          ) : (
            <div style={{ width: "100%", display: "flex", alignItems: "flex-end", gap: "8px", height: "120px" }}>
              {(stats?.scoreTrend ?? []).map(({ label, score }, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%" }}>
                  <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                    <div style={{ width: "100%", background: "#2563eb", borderRadius: "4px 4px 2px 2px", height: `${Math.max(score, 4)}%`, opacity: score > 0 ? 0.85 : 0.2 }} />
                  </div>
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Session history */}
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "white", marginBottom: "12px" }}>Session history</h2>
        <div style={{ borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
          {recentSessions.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
              No sessions logged yet.
            </div>
          ) : recentSessions.map((s, i) => (
            <div key={s.sessionId || i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 20px", borderBottom: i < recentSessions.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: "rgba(37,99,235,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: "16px" }}>🎤</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "white" }}>{s.role || "Interview"} Session</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>{fmtAgo(s.completedAt)}</p>
              </div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: s.score >= 80 ? "#4ade80" : s.score >= 60 ? "#fbbf24" : "#f87171", fontFamily: "JetBrains Mono,monospace" }}>
                {s.score}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
