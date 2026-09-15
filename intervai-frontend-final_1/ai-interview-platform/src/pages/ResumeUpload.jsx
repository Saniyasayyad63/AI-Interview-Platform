import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CloudUpload, FileText, CheckCircle2, XCircle, ArrowLeft, File, Loader2 } from "lucide-react";
import { uploadResume } from "../services/api";
import Navbar from "../components/Navbar";

const ACCEPTED = ["application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ACCEPTED_EXT = [".pdf", ".doc", ".docx"];

const ResumeUpload = () => {
  const [file, setFile]         = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState("");
  const [analysis, setAnalysis] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const validateFile = (f) => {
    if (!ACCEPTED.includes(f.type) && !ACCEPTED_EXT.some(ext => f.name.toLowerCase().endsWith(ext)))
      return "Please upload a PDF or Word document (.pdf, .doc, .docx)";
    if (f.size > 5 * 1024 * 1024) return "File must be smaller than 5MB";
    return null;
  };

  const handleFile = (f) => {
    const err = validateFile(f);
    if (err) { setError(err); setFile(null); return; }
    setError(""); setFile(f); setSuccess(false); setAnalysis(null);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setProgress(0);
    const formData = new FormData();
    formData.append("resume", file);

    const iv = setInterval(() => {
      setProgress(p => { if (p >= 85) { clearInterval(iv); return p; } return p + Math.random() * 14; });
    }, 200);

    try {
      const response = await uploadResume(formData);
      clearInterval(iv);
      setProgress(100);
      setSuccess(true);
      setAnalysis(response.data?.analysis || null);
    } catch (err) {
      clearInterval(iv);
      setError(err.response?.data?.message || "Upload failed. Please try again.");
      setProgress(0);
    } finally { setUploading(false); }
  };

  const removeFile = () => {
    setFile(null); setError(""); setSuccess(false); setProgress(0); setAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fmtSize = (b) => b < 1024 * 1024 ? `${(b/1024).toFixed(1)} KB` : `${(b/(1024*1024)).toFixed(1)} MB`;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1a" }}>
      <Navbar />
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "36px 24px 60px" }}>

        {/* Back */}
        <button onClick={() => navigate("/dashboard")}
          style={{ display: "flex", alignItems: "center", gap: "7px", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "13px", cursor: "pointer", marginBottom: "28px" }}
          onMouseEnter={e => e.currentTarget.style.color = "white"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        {/* Header */}
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "white", marginBottom: "6px" }}>Upload Resume</h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", marginBottom: "28px" }}>
          We'll analyze your resume to generate personalized interview questions tailored to your experience.
        </p>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => !file && fileInputRef.current?.click()}
          style={{ padding: "40px 20px", borderRadius: "14px", border: `2px dashed ${dragging ? "rgba(37,99,235,0.6)" : "rgba(255,255,255,0.12)"}`, background: dragging ? "rgba(37,99,235,0.05)" : "rgba(255,255,255,0.02)", textAlign: "center", cursor: file ? "default" : "pointer", transition: "all 0.2s", marginBottom: "16px" }}>
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx"
            onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }}
            style={{ display: "none" }} />

          {!file ? (
            <>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(37,99,235,0.2)", border: "1px solid rgba(37,99,235,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <CloudUpload size={24} style={{ color: "#60a5fa" }} />
              </div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "white", marginBottom: "6px" }}>
                {dragging ? "Drop your file here" : "Drag & drop your resume"}
              </p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginBottom: "12px" }}>or click to browse</p>
              <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                {[".pdf", ".doc", ".docx"].map(e => (
                  <span key={e} style={{ padding: "3px 8px", borderRadius: "5px", background: "rgba(255,255,255,0.06)", fontSize: "11px", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>{e}</span>
                ))}
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>· Max 5MB</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: success ? "rgba(74,222,128,0.15)" : "rgba(37,99,235,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                {success ? <CheckCircle2 size={24} style={{ color: "#4ade80" }} /> : <FileText size={24} style={{ color: "#60a5fa" }} />}
              </div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "white", marginBottom: "4px" }}>{file.name}</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>{fmtSize(file.size)}</p>
              {success && <p style={{ fontSize: "12px", color: "#4ade80", marginTop: "8px" }}>✓ Upload successful! Resume analyzed.</p>}
            </>
          )}
        </div>

        {/* Progress */}
        {uploading && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> Uploading and analyzing...</span>
              <span style={{ fontFamily: "monospace" }}>{Math.round(progress)}%</span>
            </div>
            <div style={{ height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.08)" }}>
              <div style={{ height: "100%", borderRadius: "2px", background: "#2563eb", width: `${progress}%`, transition: "width 0.3s" }} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", fontSize: "12px", color: "#fca5a5", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <XCircle size={14} /> {error}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          {file && !success ? (
            <>
              <button onClick={removeFile} disabled={uploading}
                style={{ flex: 1, padding: "11px", borderRadius: "9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                Remove File
              </button>
              <button onClick={handleUpload} disabled={uploading}
                style={{ flex: 1, padding: "11px", borderRadius: "9px", background: "#2563eb", border: "none", color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
                {uploading ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Uploading...</> : <><CloudUpload size={13} /> Upload Resume</>}
              </button>
            </>
          ) : !file ? (
            <button onClick={() => fileInputRef.current?.click()}
              style={{ width: "100%", padding: "11px", borderRadius: "9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
              <File size={13} /> Choose File
            </button>
          ) : null}
        </div>

        {/* How it works note */}
        <div style={{ padding: "14px 16px", borderRadius: "10px", background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.2)", marginBottom: "20px" }}>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
            <span style={{ color: "white", fontWeight: 600 }}>How it works: </span>
            Our AI parses your resume to identify skills, experience, and tech stack — then generates tailored interview questions that match your background.
          </p>
        </div>

        {/* Analysis results */}
        {analysis && (
          <div style={{ padding: "24px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "white", marginBottom: "16px" }}>Resume Strength Analysis</h3>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: "16px" }}>{analysis.summary}</p>
            {[
              { label: "Programming Languages", value: analysis.languages?.join(", ") || "None detected" },
              { label: "Skills", value: analysis.skills?.join(", ") || "None detected" },
              { label: "Project Titles", value: analysis.projectTitles?.join(" | ") || "None detected" },
            ].map(({ label, value }) => (
              <div key={label} style={{ marginBottom: "12px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "#60a5fa", textTransform: "uppercase", marginBottom: "4px" }}>{label}</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};
export default ResumeUpload;
