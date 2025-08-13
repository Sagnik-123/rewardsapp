import { useEffect, useState } from "react";
type Task = { id: string; label: string; link: string; hint?: string };

const TASKS: Task[] = [
{ id: "dailySet", label: "Daily set (quiz + poll + activity)", link: "https://rewards.microsoft.com/?mkt=en-IN" },
{ id: "pcSearch", label: "PC searches (use Bing)", link: "https://www.bing.com/?cc=IN", hint: "Use Microsoft Edge for extra points." },
{ id: "mobileSearch", label: "Mobile searches", link: "https://www.bing.com/?cc=IN", hint: "Open in Edge mobile if possible." },
{ id: "edgeBonus", label: "Edge bonus", link: "https://www.bing.com/?cc=IN" },
{ id: "punchCards", label: "Check punch cards", link: "https://rewards.microsoft.com/?mkt=en-IN" },
{ id: "xboxQuests", label: "Xbox/Game Pass quests", link: "https://www.xbox.com/en-in/play" },
{ id: "microsoftStart", label: "Microsoft Start streak", link: "https://www.msn.com/en-in/start" },
];

function todayKey(): string {
const d = new Date();
const y = d.getFullYear();
const m = String(d.getMonth() + 1).padStart(2, "0");
const day = String(d.getDate()).padStart(2, "0");
return y + "-" + m + "-" + day;
}

export default function RewardsCoach() {
const [done, setDone] = useState<Record<string, boolean>>({});
const [goal, setGoal] = useState<number>(() => Number(localStorage.getItem("goal") || 0));

useEffect(() => {
const saved = localStorage.getItem("tasks-" + todayKey());
setDone(saved ? JSON.parse(saved) : {});
}, []);

useEffect(() => {
localStorage.setItem("tasks-" + todayKey(), JSON.stringify(done));
}, [done]);

useEffect(() => {
localStorage.setItem("goal", String(goal || 0));
}, [goal]);

const completed = Object.values(done).filter(Boolean).length;
const toggle = (id: string) => setDone((d) => ({ ...d, [id]: !d[id] }));

return (
<section>
<p className="muted">Maximize legit Microsoft Rewards actions for India.</p>
  <div className="panel">
    <div className="row">
      <label>Monthly point goal</label>
      <input
        type="number"
        min={0}
        value={goal || ""}
        placeholder="e.g., 8000"
        onChange={(e: any) => setGoal(Number(e.target.value))}
      />
    </div>
    <div className="progress">
      Progress today: {completed}/{TASKS.length}
      <div className="bar">
        <div className="fill" style={{ width: (completed / TASKS.length) * 100 + "%" }} />
      </div>
    </div>
  </div>

  <ul className="list">
    {TASKS.map((t) => (
      <li key={t.id} className="item">
        <div>
          <div className="title">{t.label}</div>
          {t.hint && <div className="hint">{t.hint}</div>}
        </div>
        <div className="actions">
          <a href={t.link} target="_blank" rel="noreferrer" className="btn">Open</a>
          <input
            type="checkbox"
            className="checkbox"
            checked={!!done[t.id]}
            onChange={() => toggle(t.id)}
            aria-label={"Mark " + t.label + " done"}
          />
        </div>
      </li>
    ))}
  </ul>

  <div className="fineprint">
    Tip: Enable auto-redeem for your preferred IN gift card (when available). Options vary by region.
  </div>
</section>
);
}
