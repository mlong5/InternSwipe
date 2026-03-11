import { useState } from "react";

// ─── Wireframe Tokens ───
const T = {
  bg: "#FFFFFF",
  surface: "#F5F5F5",
  card: "#FFFFFF",
  border: "#D0D0D0",
  borderDark: "#999999",
  black: "#1A1A1A",
  gray: "#666666",
  grayLight: "#999999",
  grayFaint: "#E0E0E0",
  font: "'Courier New', Courier, monospace",
};

// ─── Placeholder box ───
function Box({ w = "100%", h = 40, label, style = {} }) {
  return (
    <div style={{
      width: w, height: h, border: `1.5px dashed ${T.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, color: T.grayLight, fontFamily: T.font, borderRadius: 4,
      background: T.surface, ...style,
    }}>
      {label}
    </div>
  );
}

// ─── Wireframe button ───
function WireBtn({ children, onClick, primary, disabled, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "12px 24px", borderRadius: 6, fontFamily: T.font, fontSize: 13,
      fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
      border: `2px solid ${T.black}`,
      background: primary ? T.black : T.bg,
      color: primary ? T.bg : T.black,
      opacity: disabled ? 0.3 : 1,
      width: "100%", textAlign: "center",
      ...style,
    }}>
      {children}
    </button>
  );
}

// ─── Wireframe input ───
function WireInput({ label, placeholder, value, onChange, type = "text", style = {} }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      <div style={{ fontSize: 10, fontFamily: T.font, color: T.gray, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={onChange}
        style={{
          width: "100%", padding: "10px 12px", borderRadius: 4,
          border: `1.5px solid ${T.border}`, background: T.bg, color: T.black,
          fontFamily: T.font, fontSize: 13, outline: "none", boxSizing: "border-box",
        }}
      />
    </div>
  );
}

// ─── Chip ───
function Chip({ label, active, onClick }) {
  return (
    <span onClick={onClick} style={{
      display: "inline-block", padding: "5px 12px", borderRadius: 20, fontSize: 12,
      fontFamily: T.font, cursor: "pointer", userSelect: "none",
      border: `1.5px solid ${active ? T.black : T.border}`,
      background: active ? T.black : T.bg,
      color: active ? T.bg : T.gray,
      fontWeight: active ? 700 : 400,
    }}>
      {label}
    </span>
  );
}

// ─── Nav ───
function Nav({ screen, setScreen }) {
  const items = [
    { id: "deck", label: "SWIPE" },
    { id: "history", label: "HISTORY" },
    { id: "profile", label: "PROFILE" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: T.bg, borderTop: `2px solid ${T.black}`,
      display: "flex", justifyContent: "center",
    }}>
      <div style={{ display: "flex", maxWidth: 400, width: "100%" }}>
        {items.map(it => (
          <button key={it.id} onClick={() => setScreen(it.id)} style={{
            flex: 1, padding: "12px 0", background: "none",
            border: "none", cursor: "pointer", fontFamily: T.font,
            fontSize: 11, fontWeight: 700, letterSpacing: 1,
            color: screen === it.id ? T.black : T.grayLight,
            borderBottom: screen === it.id ? `3px solid ${T.black}` : "3px solid transparent",
          }}>
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Data ───
const LISTINGS = [
  { id: 1, company: "Acme Corp", role: "Software Engineer Intern", location: "San Francisco, CA", pay: "$X,XXX/mo", match: 87, deadline: "Oct 15", tag: "STRONG MATCH", skills: ["Python", "SQL", "APIs"], scores: { technical: 92, experience: 78, gpa: 88, coursework: 84 }, peer: "72% of similar students get interviews" },
  { id: 2, company: "Widgets Inc", role: "Product Design Intern", location: "New York, NY", pay: "$X,XXX/mo", match: 73, deadline: "Nov 1", tag: "STRETCH", skills: ["Figma", "Research", "Prototyping"], scores: { technical: 65, experience: 70, gpa: 90, coursework: 68 }, peer: "58% of similar students get interviews" },
  { id: 3, company: "DataCo", role: "Data Science Intern", location: "Austin, TX", pay: "$X,XXX/mo", match: 81, deadline: "Dec 1", tag: "STRONG MATCH", skills: ["Python", "ML", "Statistics"], scores: { technical: 88, experience: 72, gpa: 85, coursework: 90 }, peer: "61% of similar students get interviews" },
  { id: 4, company: "BuildIt", role: "Frontend Intern", location: "Remote", pay: "$X,XXX/mo", match: 79, deadline: "Oct 28", tag: "TRENDING", skills: ["React", "TypeScript", "CSS"], scores: { technical: 82, experience: 74, gpa: 86, coursework: 78 }, peer: "65% of similar students get interviews" },
  { id: 5, company: "LearnApp", role: "ML Engineering Intern", location: "Pittsburgh, PA", pay: "$X,XXX/mo", match: 68, deadline: "Nov 15", tag: "STRETCH", skills: ["Python", "NLP", "TensorFlow"], scores: { technical: 74, experience: 60, gpa: 82, coursework: 72 }, peer: "52% of similar students get interviews" },
];

const SKILLS_LIST = ["Python", "JavaScript", "React", "SQL", "Java", "C++", "Figma", "TypeScript", "Machine Learning", "Data Analysis", "Node.js", "AWS", "Docker", "Git", "Product Mgmt", "Statistics"];
const INTERESTS_LIST = ["Software Eng", "Data Science", "Product Design", "Product Mgmt", "ML / AI", "Cloud Infra", "Cybersecurity", "Fintech", "Healthcare", "Climate Tech", "EdTech", "Robotics"];

// ═══════════════════════════════════════════════
// LANDING
// ═══════════════════════════════════════════════
function Landing({ onNext }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: T.font }}>
      <div style={{ maxWidth: 380, width: "100%", textAlign: "center" }}>

        <Box w={48} h={48} label="LOGO" style={{ margin: "0 auto 32px", borderRadius: 8, borderStyle: "solid" }} />

        <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 4px", letterSpacing: -1, color: T.black }}>InternSwipe</h1>
        <p style={{ fontSize: 12, color: T.grayLight, margin: "0 0 28px", letterSpacing: 1, textTransform: "uppercase" }}>Swipe. Match. Intern.</p>

        <div style={{ border: `1.5px dashed ${T.border}`, borderRadius: 6, padding: 24, marginBottom: 28 }}>
          <p style={{ fontSize: 13, color: T.gray, lineHeight: 1.7, margin: 0 }}>
            AI-powered internship matching.<br />
            Swipe through personalized opportunities.<br />
            Get coached on every application.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 32 }}>
          {["Smart Feed", "Match Scores", "App Coach", "Timeline"].map(f => (
            <span key={f} style={{ padding: "5px 12px", border: `1px solid ${T.border}`, borderRadius: 20, fontSize: 11, color: T.gray }}>{f}</span>
          ))}
        </div>

        <WireBtn primary onClick={onNext}>GET STARTED →</WireBtn>

        <p style={{ fontSize: 11, color: T.grayLight, marginTop: 14 }}>Free for university students</p>

        <div style={{ display: "flex", justifyContent: "space-around", marginTop: 36, padding: "16px 0", borderTop: `1px solid ${T.grayFaint}` }}>
          {[["12.4k", "Students"], ["850+", "Employers"], ["94%", "Match Rate"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.black }}>{n}</div>
              <div style={{ fontSize: 10, color: T.grayLight, textTransform: "uppercase", letterSpacing: 0.5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════
function Login({ onLogin, onBack }) {
  const [tab, setTab] = useState("login");
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: T.font }}>
      <div style={{ maxWidth: 380, width: "100%" }}>

        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: T.font, fontSize: 12, color: T.grayLight, marginBottom: 28 }}>← Back</button>

        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px", color: T.black }}>InternSwipe</h2>
        <p style={{ fontSize: 13, color: T.gray, margin: "0 0 28px" }}>{tab === "login" ? "Welcome back" : "Create account"}</p>

        {/* Tabs */}
        <div style={{ display: "flex", marginBottom: 24, borderBottom: `1.5px solid ${T.grayFaint}` }}>
          {["login", "signup"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "10px 0", background: "none", border: "none",
              fontFamily: T.font, fontSize: 12, fontWeight: 700, cursor: "pointer",
              letterSpacing: 1, textTransform: "uppercase",
              color: tab === t ? T.black : T.grayLight,
              borderBottom: tab === t ? `2px solid ${T.black}` : "2px solid transparent",
            }}>
              {t === "login" ? "LOG IN" : "SIGN UP"}
            </button>
          ))}
        </div>

        {/* SSO */}
        <WireBtn onClick={() => {}} style={{ marginBottom: 20 }}>◊ UNIVERSITY SSO</WireBtn>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0", color: T.grayLight, fontSize: 11 }}>
          <div style={{ flex: 1, height: 1, background: T.grayFaint }} />
          OR
          <div style={{ flex: 1, height: 1, background: T.grayFaint }} />
        </div>

        {tab === "signup" && <WireInput label="Full Name" placeholder="Jane Doe" />}
        <WireInput label="Email" placeholder="jane@university.edu" type="email" />
        <WireInput label="Password" placeholder="••••••••" type="password" />

        <div style={{ marginTop: 8 }}>
          <WireBtn primary onClick={onLogin}>{tab === "login" ? "LOG IN" : "CREATE ACCOUNT"} →</WireBtn>
        </div>

        {tab === "login" && (
          <p style={{ fontSize: 11, color: T.grayLight, textAlign: "center", marginTop: 14, cursor: "pointer", textDecoration: "underline" }}>Forgot password?</p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// PROFILE SETUP
// ═══════════════════════════════════════════════
function ProfileSetup({ onComplete }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ school: "", major: "", year: "", gpa: "", skills: [], interests: [] });

  const toggle = (field, item) => {
    setProfile(p => ({
      ...p, [field]: p[field].includes(item) ? p[field].filter(x => x !== item) : [...p[field], item],
    }));
  };

  const canNext = step === 0 ? profile.school && profile.major && profile.year
    : step === 1 ? profile.skills.length >= 2
    : profile.interests.length >= 1;

  const titles = ["Academics", "Skills", "Interests"];
  const subs = ["Tell us about your studies", "Select at least 2 skills", "What fields interest you?"];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "36px 24px", fontFamily: T.font }}>
      <div style={{ maxWidth: 400, width: "100%" }}>

        {/* Progress */}
        <div style={{ display: "flex", gap: 6, marginBottom: 36 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? T.black : T.grayFaint }} />
          ))}
        </div>

        <div style={{ fontSize: 10, color: T.grayLight, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Step {step + 1} of 3</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px", color: T.black }}>{titles[step]}</h2>
        <p style={{ fontSize: 13, color: T.gray, margin: "0 0 28px" }}>{subs[step]}</p>

        {step === 0 && (
          <>
            <WireInput label="University" placeholder="e.g. UC Berkeley" value={profile.school} onChange={e => setProfile({ ...profile, school: e.target.value })} />
            <WireInput label="Major" placeholder="e.g. Computer Science" value={profile.major} onChange={e => setProfile({ ...profile, major: e.target.value })} />
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontFamily: T.font, color: T.gray, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Year</div>
                <select value={profile.year} onChange={e => setProfile({ ...profile, year: e.target.value })} style={{
                  width: "100%", padding: "10px 12px", borderRadius: 4, border: `1.5px solid ${T.border}`,
                  background: T.bg, fontFamily: T.font, fontSize: 13, color: profile.year ? T.black : T.grayLight,
                }}>
                  <option value="">Select</option>
                  <option>Freshman</option><option>Sophomore</option><option>Junior</option><option>Senior</option><option>Grad</option>
                </select>
              </div>
              <WireInput label="GPA (opt)" placeholder="3.7" value={profile.gpa} onChange={e => setProfile({ ...profile, gpa: e.target.value })} style={{ flex: 1, marginBottom: 0 }} />
            </div>
          </>
        )}

        {step === 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SKILLS_LIST.map(s => <Chip key={s} label={s} active={profile.skills.includes(s)} onClick={() => toggle("skills", s)} />)}
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {INTERESTS_LIST.map(s => <Chip key={s} label={s} active={profile.interests.includes(s)} onClick={() => toggle("interests", s)} />)}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 36 }}>
          {step > 0 && <WireBtn onClick={() => setStep(step - 1)} style={{ flex: 1 }}>← BACK</WireBtn>}
          <WireBtn primary disabled={!canNext} onClick={() => step < 2 ? setStep(step + 1) : onComplete()} style={{ flex: 2 }}>
            {step < 2 ? "CONTINUE →" : "START SWIPING →"}
          </WireBtn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// SWIPE DECK
// ═══════════════════════════════════════════════
function SwipeDeck({ history, setHistory }) {
  const [idx, setIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [swiping, setSwiping] = useState(null);
  const card = LISTINGS[idx];
  const done = idx >= LISTINGS.length;

  const handleSwipe = (dir) => {
    setSwiping(dir);
    setTimeout(() => {
      setHistory(h => [...h, { ...card, action: dir, date: new Date().toLocaleDateString() }]);
      setSwiping(null);
      setExpanded(false);
      setIdx(i => i + 1);
    }, 250);
  };

  if (done) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: T.font, paddingBottom: 80 }}>
        <div style={{ textAlign: "center", maxWidth: 300 }}>
          <Box w={60} h={60} label="✓" style={{ margin: "0 auto 20px", borderRadius: "50%", borderStyle: "solid", fontSize: 20 }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>All caught up</h2>
          <p style={{ fontSize: 13, color: T.gray, lineHeight: 1.6 }}>You've reviewed all current matches. Check back for new listings.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 16px 100px", fontFamily: T.font }}>
      <div style={{ maxWidth: 400, width: "100%" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>InternSwipe</h2>
          <span style={{ fontSize: 11, color: T.grayLight }}>{idx + 1} / {LISTINGS.length}</span>
        </div>

        {/* Card */}
        <div style={{
          border: `2px solid ${T.black}`, borderRadius: 8, overflow: "hidden", background: T.bg,
          opacity: swiping ? 0.4 : 1,
          transform: swiping === "right" ? "translateX(60px) rotate(3deg)" : swiping === "left" ? "translateX(-60px) rotate(-3deg)" : swiping === "bookmark" ? "translateY(-10px)" : "none",
          transition: "all 0.25s ease",
        }}>
          {/* Tag */}
          <div style={{ padding: "16px 18px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "3px 8px",
              border: `1px solid ${T.borderDark}`, borderRadius: 3,
            }}>{card.tag}</span>
            <span style={{ fontSize: 11, color: T.grayLight }}>⏱ {card.deadline}</span>
          </div>

          {/* Role + company */}
          <div style={{ padding: "12px 18px 0" }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 2px" }}>{card.role}</h3>
            <p style={{ fontSize: 14, color: T.gray, margin: "0 0 6px" }}>{card.company}</p>
            <div style={{ display: "flex", gap: 14, fontSize: 12, color: T.grayLight }}>
              <span>📍 {card.location}</span>
              <span>💰 {card.pay}</span>
            </div>
          </div>

          {/* Match score */}
          <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", border: `3px solid ${T.black}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700,
            }}>{card.match}%</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>MATCH SCORE</div>
              <div style={{ fontSize: 11, color: T.grayLight }}>Based on profile, skills & peers</div>
            </div>
          </div>

          {/* Skills */}
          <div style={{ padding: "0 18px 14px", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {card.skills.map(s => (
              <span key={s} style={{ padding: "3px 10px", border: `1px solid ${T.border}`, borderRadius: 3, fontSize: 11, color: T.gray }}>{s}</span>
            ))}
          </div>

          {/* Expandable breakdown */}
          <div style={{ borderTop: `1px solid ${T.grayFaint}`, padding: "10px 18px" }}>
            <button onClick={() => setExpanded(!expanded)} style={{
              background: "none", border: "none", cursor: "pointer", fontFamily: T.font,
              fontSize: 11, fontWeight: 700, color: T.gray, letterSpacing: 0.5,
            }}>
              {expanded ? "▾ HIDE" : "▸ SHOW"} BREAKDOWN
            </button>

            {expanded && (
              <div style={{ marginTop: 12 }}>
                {Object.entries(card.scores).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, fontSize: 12 }}>
                    <span style={{ width: 90, color: T.gray, textTransform: "capitalize" }}>{k}</span>
                    <div style={{ flex: 1, height: 6, background: T.grayFaint, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${v}%`, height: "100%", background: T.black, borderRadius: 3 }} />
                    </div>
                    <span style={{ width: 30, textAlign: "right", fontWeight: 700 }}>{v}%</span>
                  </div>
                ))}
                <div style={{ marginTop: 8, padding: "8px 10px", border: `1px dashed ${T.border}`, borderRadius: 4, fontSize: 11, color: T.gray }}>
                  ★ {card.peer}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, marginTop: 20 }}>
          <button onClick={() => handleSwipe("left")} style={{
            width: 56, height: 56, borderRadius: "50%", border: `2px solid ${T.black}`,
            background: T.bg, cursor: "pointer", fontSize: 20, fontFamily: T.font,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>

          <button onClick={() => handleSwipe("bookmark")} style={{
            width: 46, height: 46, borderRadius: "50%", border: `2px solid ${T.borderDark}`,
            background: T.bg, cursor: "pointer", fontSize: 16, fontFamily: T.font,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>☆</button>

          <button onClick={() => handleSwipe("right")} style={{
            width: 56, height: 56, borderRadius: "50%", border: `2px solid ${T.black}`,
            background: T.black, color: T.bg, cursor: "pointer", fontSize: 20, fontFamily: T.font,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✓</button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 8, fontSize: 10, color: T.grayLight, letterSpacing: 0.5, fontWeight: 700 }}>
          <span style={{ width: 56, textAlign: "center" }}>PASS</span>
          <span style={{ width: 46, textAlign: "center" }}>SAVE</span>
          <span style={{ width: 56, textAlign: "center" }}>APPLY</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// HISTORY
// ═══════════════════════════════════════════════
function History({ history }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? history : history.filter(h => h.action === filter);
  const labels = { right: "APPLIED", left: "PASSED", bookmark: "SAVED" };
  const icons = { right: "✓", left: "✕", bookmark: "☆" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 16px 100px", fontFamily: T.font }}>
      <div style={{ maxWidth: 400, width: "100%" }}>

        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>History</h2>
        <p style={{ fontSize: 12, color: T.grayLight, margin: "0 0 18px" }}>{history.length} reviewed</p>

        {/* Stats */}
        {history.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            {[
              { l: "Applied", c: history.filter(h => h.action === "right").length },
              { l: "Saved", c: history.filter(h => h.action === "bookmark").length },
              { l: "Passed", c: history.filter(h => h.action === "left").length },
            ].map(s => (
              <div key={s.l} style={{ flex: 1, padding: "10px 0", border: `1.5px solid ${T.border}`, borderRadius: 4, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{s.c}</div>
                <div style={{ fontSize: 10, color: T.grayLight, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          {[{ id: "all", l: "All" }, { id: "right", l: "Applied" }, { id: "bookmark", l: "Saved" }, { id: "left", l: "Passed" }].map(f => (
            <Chip key={f.id} label={f.l} active={filter === f.id} onClick={() => setFilter(f.id)} />
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: T.grayLight, fontSize: 13 }}>
            {history.length === 0 ? "No history yet — start swiping." : "No items for this filter."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((item, i) => (
              <div key={`${item.id}-${i}`} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                border: `1.5px solid ${T.border}`, borderRadius: 6,
              }}>
                {/* Match */}
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", border: `2px solid ${T.black}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>{item.match}%</div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.role}</div>
                  <div style={{ fontSize: 12, color: T.gray }}>{item.company}</div>
                  <div style={{ fontSize: 11, color: T.grayLight }}>📍 {item.location}</div>
                </div>

                {/* Action */}
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", border: `1.5px solid ${T.borderDark}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, margin: "0 auto 2px",
                  }}>{icons[item.action]}</div>
                  <div style={{ fontSize: 9, color: T.grayLight, fontWeight: 700, letterSpacing: 0.5 }}>{labels[item.action]}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// PROFILE (stub)
// ═══════════════════════════════════════════════
function Profile({ history, onLogout }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 16px 100px", fontFamily: T.font }}>
      <div style={{ maxWidth: 400, width: "100%" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 20px" }}>Profile</h2>

        <div style={{ border: `1.5px solid ${T.border}`, borderRadius: 6, padding: 20, textAlign: "center" }}>
          <Box w={56} h={56} label="JD" style={{ margin: "0 auto 14px", borderRadius: "50%", borderStyle: "solid", fontWeight: 700, fontSize: 16, color: T.black }} />
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Jane Doe</div>
          <div style={{ fontSize: 12, color: T.gray, marginBottom: 16 }}>CS @ UC Berkeley · Junior</div>

          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 18 }}>
            {["Python", "React", "SQL", "ML"].map(s => <Chip key={s} label={s} active />)}
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            {[
              { n: history.filter(h => h.action === "right").length, l: "Applied" },
              { n: history.filter(h => h.action === "bookmark").length, l: "Saved" },
              { n: history.length, l: "Total" },
            ].map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{s.n}</div>
                <div style={{ fontSize: 10, color: T.grayLight, textTransform: "uppercase" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <WireBtn onClick={onLogout}>LOG OUT</WireBtn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [history, setHistory] = useState([]);
  const showNav = ["deck", "history", "profile"].includes(screen);

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; }
        input::placeholder { color: ${T.grayLight}; }
        select { color: ${T.black}; }
      `}</style>

      {screen === "landing" && <Landing onNext={() => setScreen("login")} />}
      {screen === "login" && <Login onLogin={() => setScreen("setup")} onBack={() => setScreen("landing")} />}
      {screen === "setup" && <ProfileSetup onComplete={() => setScreen("deck")} />}
      {screen === "deck" && <SwipeDeck history={history} setHistory={setHistory} />}
      {screen === "history" && <History history={history} />}
      {screen === "profile" && <Profile history={history} onLogout={() => setScreen("landing")} />}

      {showNav && <Nav screen={screen} setScreen={setScreen} />}
    </div>
  );
}
