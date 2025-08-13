import { useEffect, useMemo, useState } from "react";
type Deal = {
title: string;
url: string;
source: string;
published?: string | null;
};

const WHITELIST = [
"amazon.in", "flipkart.com", "myntra.com", "ajio.com", "tatacliq.com",
"paytm.com", "paytmmall.com", "croma.com", "reliancedigital.in",
"bigbasket.com", "swiggy.com", "zomato.com", "bookmyshow.com",
];

export default function Deals() {
const [deals, setDeals] = useState<Deal[]>([]);
const [q, setQ] = useState("");
const [domain, setDomain] = useState("");

useEffect(() => {
fetch("./deals.json")
.then((r) => r.json())
.then((json) => setDeals(json.deals || []))
.catch(() => setDeals([]));
}, []);

const filtered = useMemo(() => {
return deals
.filter((d) => !domain || d.url.includes(domain))
.filter((d) => !q || d.title.toLowerCase().includes(q.toLowerCase()));
}, [deals, q, domain]);

return (
<section>
<div className="panel">
<div className="row">
<input
placeholder="Search vouchers or freebies (e.g., Amazon, Flipkart, ₹, game)…"
value={q}
onChange={(e) => setQ(e.target.value)}
/>
<select value={domain} onChange={(e) => setDomain(e.target.value)}>
<option value="">All sites</option>
{WHITELIST.map((d) => (
<option key={d} value={d}>{d}</option>
))}
</select>
</div>
</div>
<ul className="list">
    {filtered.map((d) => (
      <li key={d.url} className="item">
        <a className="link" href={d.url} target="_blank" rel="noreferrer">{d.title}</a>
        <div className="meta">
          <span>Source: {d.source}</span>
          {d.published && <span> · {new Date(d.published).toLocaleString()}</span>}
        </div>
      </li>
    ))}
  </ul>

  <div className="fineprint">
    Add more India-specific sources in scripts/fetch-deals.mjs (RSS/JSON only) and redeploy.
  </div>
</section>
);
}
