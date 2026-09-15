/* eslint-disable */
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, LogIn, ArrowLeft, Loader2, Users, Video, Mic2, BarChart2 } from "lucide-react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { createGDRoom, joinGDRoom } from "../../services/api";

const TOPICS = [
  "Should AI replace human jobs?",
  "Is remote work more productive than office work?",
  "Social media: boon or bane for society?",
  "Climate change — individual vs corporate responsibility",
  "Should college education be free?",
  "Is technology making us more isolated?",
  "Work-life balance in the modern era",
  "The role of leadership in team success",
];

const GDLobby = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [searchParams] = useSearchParams();
  const wasKicked  = searchParams.get("kicked") === "1";
  const [tab, setTab] = useState("create");

  const [title, setTitle]           = useState("");
  const [topic, setTopic]           = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [duration, setDuration]     = useState(600);
  const [joinCode, setJoinCode]     = useState("");
  const [joinName, setJoinName]     = useState(user?.name || "");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const userId   = user?._id || user?.email || `user_${Date.now()}`;
  const hostName = user?.name || "Host";

  const handleCreate = async () => {
    const finalTopic = customTopic.trim() || topic;
    if (!title.trim()) { setError("Please enter a room title."); return; }
    if (!finalTopic)   { setError("Please select or enter a discussion topic."); return; }
    setLoading(true); setError("");
    try {
      const res = await createGDRoom({ hostId: userId, hostName, topic: finalTopic, durationSec: duration });
      sessionStorage.setItem("gd-user", JSON.stringify({ userId, name: hostName, isHost: true }));
      navigate(`/gd/room/${res.data.room._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create room.");
    } finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) { setError("Enter a join code."); return; }
    if (!joinName.trim()) { setError("Enter your name."); return; }
    setLoading(true); setError("");
    try {
      const res = await joinGDRoom({ joinCode: joinCode.trim().toUpperCase(), userId, name: joinName.trim() });
      sessionStorage.setItem("gd-user", JSON.stringify({ userId, name: joinName.trim(), isHost: false }));
      navigate(`/gd/room/${res.data.room._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join room.");
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: "9px",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    color: "white", fontSize: "13px", outline: "none", boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "8px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1a" }}>
      <Navbar />
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "36px 24px 60px" }}>

        {/* Back */}
        <button onClick={() => navigate("/dashboard")}
          style={{ display: "flex", alignItems: "center", gap: "7px", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "13px", cursor: "pointer", marginBottom: "28px" }}
          onMouseEnter={e => e.currentTarget.style.color = "white"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        {/* Header */}
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "white", marginBottom: "6px" }}>Group Discussion</h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", marginBottom: "28px" }}>
          Real-time video + audio group discussions with AI-powered evaluation. Up to 6 participants.
        </p>

        {/* Kicked banner */}
        {wasKicked && (
          <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", fontSize: "12px", color: "#fca5a5", marginBottom: "16px" }}>
            You were removed from the discussion by the host.
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", fontSize: "12px", color: "#fca5a5", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: "4px", padding: "4px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "24px" }}>
          {[{ key: "create", label: "Create Room", icon: Plus }, { key: "join", label: "Join Room", icon: LogIn }].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => { setTab(key); setError(""); }}
              style={{ flex: 1, padding: "10px", borderRadius: "7px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none", transition: "all 0.15s",
                background: tab === key ? "rgba(255,255,255,0.1)" : "transparent",
                color: tab === key ? "white" : "rgba(255,255,255,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Create tab */}
        {tab === "create" && (
          <div style={{ padding: "28px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Room title */}
            <div>
              <label style={labelStyle}>Room Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Team Alpha GD Round" style={inputStyle} />
            </div>

            {/* Topic */}
            <div>
              <label style={labelStyle}>Discussion Topic</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginBottom: "10px" }}>
                {TOPICS.map((t) => (
                  <button key={t} onClick={() => { setTopic(t); setCustomTopic(""); }}
                    style={{ padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 500, cursor: "pointer", border: "1px solid", transition: "all 0.15s",
                      background: topic === t && !customTopic ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.04)",
                      borderColor: topic === t && !customTopic ? "rgba(37,99,235,0.5)" : "rgba(255,255,255,0.1)",
                      color: topic === t && !customTopic ? "#93c5fd" : "rgba(255,255,255,0.5)" }}>
                    {t}
                  </button>
                ))}
              </div>
              <input value={customTopic} onChange={e => { setCustomTopic(e.target.value); setTopic(""); }}
                placeholder="Or type a custom topic..." style={inputStyle} />
            </div>

            {/* Duration */}
            <div>
              <label style={labelStyle}>Duration</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[{ s: 600, l: "10 min" }, { s: 900, l: "15 min" }, { s: 1200, l: "20 min" }].map(({ s, l }) => (
                  <button key={s} onClick={() => setDuration(s)}
                    style={{ padding: "9px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "1px solid", transition: "all 0.15s",
                      background: duration === s ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.04)",
                      borderColor: duration === s ? "rgba(37,99,235,0.5)" : "rgba(255,255,255,0.1)",
                      color: duration === s ? "#93c5fd" : "rgba(255,255,255,0.5)" }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Create button */}
            <button onClick={handleCreate} disabled={loading}
              style={{ padding: "13px", borderRadius: "9px", background: "#2563eb", border: "none", color: "white", fontSize: "14px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: loading ? 0.7 : 1 }}>
              {loading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Creating...</> : <><Plus size={15} /> Create Room</>}
            </button>
          </div>
        )}

        {/* Join tab */}
        {tab === "join" && (
          <div style={{ padding: "28px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={labelStyle}>Join Code</label>
              <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code" maxLength={6}
                style={{ ...inputStyle, fontFamily: "JetBrains Mono,monospace", fontSize: "20px", letterSpacing: "0.2em", textAlign: "center" }} />
            </div>
            <div>
              <label style={labelStyle}>Your Name</label>
              <input value={joinName} onChange={e => setJoinName(e.target.value)}
                placeholder="How you'll appear in the discussion" style={inputStyle} />
            </div>
            <button onClick={handleJoin} disabled={loading}
              style={{ padding: "13px", borderRadius: "9px", background: "#2563eb", border: "none", color: "white", fontSize: "14px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: loading ? 0.7 : 1 }}>
              {loading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Joining...</> : <><LogIn size={15} /> Join Discussion</>}
            </button>
          </div>
        )}

        {/* Feature cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginTop: "24px" }}>
          {[
            { icon: Video,    label: "Video + Audio",  desc: "WebRTC peer-to-peer video and audio for all participants" },
            { icon: Mic2,     label: "AI Evaluation",  desc: "Scored on participation, communication & relevance" },
            { icon: BarChart2,label: "Results",         desc: "Detailed performance report after discussion ends" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} style={{ padding: "18px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Icon size={18} style={{ color: "rgba(255,255,255,0.35)", marginBottom: "10px" }} />
              <p style={{ fontSize: "13px", fontWeight: 700, color: "white", marginBottom: "4px" }}>{label}</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default GDLobby;
