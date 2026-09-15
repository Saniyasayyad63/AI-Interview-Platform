/* eslint-disable */
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FlaskConical, Zap, Users, Star, Upload,
  BookOpen, LogOut, BarChart2, Mic2, Brain,
  Target, ClipboardList, ChevronRight, Play
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useStats } from "../context/StatsContext";
import Navbar from "../components/Navbar";
import { getSavedTestResult } from "../utils/testSessionStorage";
import { getAccuracyPercentage, formatCategoryLabel, formatDifficultyLabel } from "../utils/testHelpers";

const NAV_ITEMS = [
  { label: "Take test",          icon: FlaskConical, path: "/take-test" },
  { label: "Live tests",         icon: Zap,          path: "/live-tests" },
  { label: "Group discussion",   icon: Users,        path: "/gd" },
  { label: "Versant assessment", icon: Star,         path: "/versant" },
  { label: "Upload resume",      icon: Upload,       path: "/upload-resume" },
  { label: "Learning hub",       icon: BookOpen,     path: "/question-bank" },
  { label: "Logout",             icon: LogOut,       path: null, danger: true },
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { stats } = useStats();
  const navigate = useNavigate();

  const firstName  = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "User";
  const fullName   = user?.name || user?.email?.split("@")[0] || "User";
  const initial    = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();
  const lastResult = getSavedTestResult();

  const avgScore   = stats?.avgScore       ?? 0;
  const interviews = stats?.totalInterviews ?? 0;
  const hours      = stats?.hourspracticed  ?? 0;
  const streak     = stats?.currentStreak   ?? 0;

  const handleNav = (item) => {
    if (item.danger) { logout(); navigate("/login"); return; }
    if (item.path) navigate(item.path);
  };

  const kpis = [
    { icon: "🎯", label: "Avg score",        value: `${avgScore}%` },
    { icon: "🎤", label: "Interviews",        value: `${interviews}` },
    { icon: "⏱",  label: "Hours practiced",  value: `${hours}h` },
    { icon: "🔥", label: "Day streak",        value: `${streak}` },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--app-bg, #0a0f1a)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: "220px", flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.07)",
          padding: "24px 0", display: "flex", flexDirection: "column", gap: "4px",
          background: "rgba(255,255,255,0.01)",
        }}>
          {/* User block */}
          <div style={{ padding: "0 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: "12px" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "white", marginBottom: "3px" }}>{fullName}</p>
            <p style={{ fontSize: "11px", color: "var(--text-dim, #6b7280)", marginBottom: "10px",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email || ""}
            </p>
            <span style={{
              display: "inline-block", padding: "3px 10px", borderRadius: "6px", fontSize: "10px",
              fontWeight: 700, letterSpacing: "0.08em", background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc",
            }}>STUDENT</span>
          </div>

          {/* Nav items */}
          {NAV_ITEMS.map((item) => (
            <button key={item.label} onClick={() => handleNav(item)}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 20px", background: "none", border: "none", cursor: "pointer",
                fontSize: "13px", fontWeight: 500, textAlign: "left", transition: "all 0.15s",
                color: item.danger ? "rgba(248,113,113,0.75)" : "rgba(255,255,255,0.55)",
                borderLeft: "2px solid transparent",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = item.danger ? "#f87171" : "white";
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = item.danger ? "rgba(248,113,113,0.75)" : "rgba(255,255,255,0.55)";
                e.currentTarget.style.background = "none";
              }}
            >
              <item.icon size={15} />
              {item.label}
            </button>
          ))}
        </aside>

        {/* ── Main ── */}
        <main style={{ flex: 1, overflowY: "auto", padding: "32px 32px 48px" }}>

          {/* Header */}
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: "#3b82f6", marginBottom: "8px", textTransform: "uppercase" }}>
            DASHBOARD
          </p>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "white", marginBottom: "6px" }}>
            Welcome back, {firstName}
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", marginBottom: "28px" }}>
            Review interview progress, launch a new session, and improve with AI feedback.
          </p>

          {/* KPI row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "24px" }}>
            {kpis.map(({ icon, label, value }) => (
              <div key={label} style={{
                padding: "20px", borderRadius: "12px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "14px" }}>{icon}</span>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>{label}</span>
                </div>
                <p style={{ fontSize: "26px", fontWeight: 800, color: "white", fontFamily: "JetBrains Mono,monospace" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Cards row 1 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>

            {/* Past interviews */}
            <div style={{ padding: "24px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "white", marginBottom: "4px" }}>Past interviews</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>No completed interviews yet.</p>
              <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "20px", textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "14px" }}>
                Complete your first interview to see session history here.
              </div>
              <button onClick={() => navigate("/interview")}
                style={{ width: "100%", padding: "11px", borderRadius: "9px", background: "#2563eb", border: "none", color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
                <Play size={13} /> Start first interview
              </button>
            </div>

            {/* AI feedback score */}
            <div style={{ padding: "24px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "white", marginBottom: "4px" }}>AI feedback score</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>Latest session performance.</p>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: "rgba(255,255,255,0.4)" }}>—</span>
                </div>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                  Take an interview to generate your first score.
                </p>
              </div>
            </div>
          </div>

          {/* Cards row 2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>

            {/* Performance chart */}
            <div style={{ padding: "24px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "white", marginBottom: "4px" }}>Performance chart</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>Visual trend of recent session scores.</p>
              <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "24px", textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "14px" }}>
                No chart data yet.
              </div>
              <button onClick={() => navigate("/analytics")}
                style={{ width: "100%", padding: "10px", borderRadius: "9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                View full analytics
              </button>
            </div>

            {/* Last test result */}
            <div style={{ padding: "24px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "white", marginBottom: "4px" }}>Last test result</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>Your most recent aptitude test attempt.</p>
              {lastResult ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                    <div style={{ width: "60px", height: "60px", borderRadius: "12px", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <p style={{ fontSize: "18px", fontWeight: 800, color: "white" }}>{getAccuracyPercentage(lastResult.correct, lastResult.total)}%</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>{formatCategoryLabel(lastResult.meta?.category || lastResult.category)}</p>
                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{lastResult.correct} correct · {lastResult.wrong} wrong</p>
                    </div>
                  </div>
                  <button onClick={() => navigate("/take-test")}
                    style={{ width: "100%", padding: "10px", borderRadius: "9px", background: "#2563eb", border: "none", color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                    Take aptitude test
                  </button>
                </>
              ) : (
                <>
                  <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "20px", textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.3)", marginBottom: "14px" }}>
                    No test completed yet.
                  </div>
                  <button onClick={() => navigate("/take-test")}
                    style={{ width: "100%", padding: "10px", borderRadius: "9px", background: "#2563eb", border: "none", color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                    Take aptitude test
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {[
              { icon: BookOpen, label: "Question bank",  desc: "Curated practice questions", path: "/question-bank" },
              { icon: BarChart2, label: "My analytics",  desc: `${avgScore}% avg score`,      path: "/analytics" },
            ].map(({ icon: Icon, label, desc, path }) => (
              <button key={label} onClick={() => navigate(path)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", textAlign: "left", transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Icon size={18} style={{ color: "rgba(255,255,255,0.4)" }} />
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>{label}</p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>{desc}</p>
                  </div>
                </div>
                <ChevronRight size={15} style={{ color: "rgba(255,255,255,0.3)" }} />
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
