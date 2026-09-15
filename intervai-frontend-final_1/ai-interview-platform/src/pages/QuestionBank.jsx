/* eslint-disable */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import { DSA_PROBLEMS } from "../data/dsaProblems";

// Category tag config
const CAT_STYLES = {
  "DSA":           { bg: "rgba(99,102,241,0.18)",  color: "#a5b4fc",  label: "Coding" },
  "System Design": { bg: "rgba(249,115,22,0.18)",  color: "#fb923c",  label: "System design" },
  "Frontend":      { bg: "rgba(20,184,166,0.18)",  color: "#2dd4bf",  label: "Frontend" },
  "Behavioral":    { bg: "rgba(34,197,94,0.18)",   color: "#4ade80",  label: "Behavioral" },
  "HR":            { bg: "rgba(168,85,247,0.18)",  color: "#c084fc",  label: "HR" },
};

const FILTER_TABS = ["All", "Behavioral", "System design", "Coding", "HR"];

const STATIC_QUESTIONS = [
  { id:"s1", title:"Describe a situation where you had to meet a tight deadline.", category:"Behavioral",    diff:"easy",   tags:["pressure","deadline"],          asked:"All companies" },
  { id:"s2", title:"How would you design a URL shortening service?",              category:"System Design", diff:"medium", tags:["system","scalability"],         asked:"Uber, Twitter" },
  { id:"s3", title:"Find the longest substring without repeating characters.",    category:"DSA",           diff:"medium", tags:["string","sliding-window"],      asked:"Google, Meta" },
  { id:"s4", title:"Why do you want to work at this company?",                    category:"HR",            diff:"easy",   tags:["motivation","culture"],         asked:"All companies" },
  { id:"s5", title:"Explain the virtual DOM in React.",                           category:"Frontend",      diff:"easy",   tags:["react","dom","rendering"],      asked:"Meta, Airbnb" },
  { id:"s6", title:"Design a distributed cache system.",                          category:"System Design", diff:"hard",   tags:["cache","distributed"],          asked:"Amazon, Google" },
  { id:"s7", title:"How do you prioritize tasks when deadlines conflict?",        category:"Behavioral",    diff:"easy",   tags:["prioritization","soft-skills"], asked:"All companies" },
  { id:"s8", title:"What are your strengths and weaknesses?",                    category:"HR",            diff:"easy",   tags:["self-awareness"],               asked:"All companies" },
  { id:"s9", title:"Implement a LRU cache.",                                     category:"DSA",           diff:"medium", tags:["cache","hashmap","linkedlist"], asked:"Google, Meta" },
  { id:"s10",title:"Explain CSS Box Model.",                                     category:"Frontend",      diff:"easy",   tags:["css","layout"],                 asked:"All companies" },
];

const DSA_QUESTIONS = DSA_PROBLEMS.slice(0, 60).map((p) => ({
  id: p.id,
  title: p.title,
  category: "DSA",
  diff: p.difficulty,
  tags: p.tags?.map((t) => t.toLowerCase()) ?? [],
  asked: p.companies?.join(", ") ?? "",
  hasSolver: true,
}));

const ALL_QUESTIONS = [...DSA_QUESTIONS, ...STATIC_QUESTIONS];

// Map category → filter tab
const catToTab = (cat) => {
  if (cat === "DSA") return "Coding";
  if (cat === "System Design") return "System design";
  if (cat === "Behavioral") return "Behavioral";
  if (cat === "HR") return "HR";
  if (cat === "Frontend") return "Frontend";
  return "All";
};

const QuestionBank = () => {
  const navigate = useNavigate();
  const [search, setSearch]   = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const filtered = ALL_QUESTIONS.filter((q) => {
    const matchSearch = !search ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.tags.some((t) => t.includes(search.toLowerCase()));
    const matchTab = activeTab === "All" || catToTab(q.category) === activeTab || q.category === activeTab;
    return matchSearch && matchTab;
  });

  const getCatStyle = (cat) => CAT_STYLES[cat] || { bg: "rgba(255,255,255,0.1)", color: "#9ca3af", label: cat };

  return (
    <div style={{ minHeight: "100vh", background: "var(--app-bg, #0a0f1a)" }}>
      <Navbar />

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "36px 24px 60px" }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "white" }}>Question bank</h1>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "9px 14px", width: "220px" }}>
            <Search size={13} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search topics..."
              style={{ background: "none", border: "none", outline: "none", color: "white", fontSize: "13px", width: "100%" }} />
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
          {FILTER_TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: "7px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 500, cursor: "pointer", border: "1px solid", transition: "all 0.15s",
                background: activeTab === tab ? "rgba(37,99,235,0.25)" : "transparent",
                borderColor: activeTab === tab ? "rgba(37,99,235,0.6)" : "rgba(255,255,255,0.12)",
                color: activeTab === tab ? "#93c5fd" : "rgba(255,255,255,0.5)" }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Question list */}
        <div style={{ display: "flex", flexDirection: "column", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", fontSize: "13px", color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.02)" }}>
              No questions match your search.
            </div>
          ) : filtered.map((q, i) => {
            const style = getCatStyle(q.category);
            return (
              <button key={q.id}
                onClick={() => q.hasSolver ? navigate(`/question-bank/${q.id}`) : null}
                style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px", background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.01)", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none", border: "none", cursor: "pointer", textAlign: "left", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.01)"}
              >
                {/* Category tag */}
                <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, background: style.bg, color: style.color, flexShrink: 0, whiteSpace: "nowrap" }}>
                  {style.label}
                </span>

                {/* Title */}
                <span style={{ flex: 1, fontSize: "13px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                  {q.title}
                </span>

                {/* Arrow */}
                <ChevronRight size={15} style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;
