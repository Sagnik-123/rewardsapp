import { useState } from "react";
import RewardsCoach from "./components/RewardsCoach";
import Deals from "./components/Deals";
export default function App() {
const [tab, setTab] = useState<"rewards" | "deals">("rewards");

return (
<main className="container">
<header className="header">
<h1>Rewards Buddy 🇮🇳</h1>
<nav className="tabs">
<button
className={tab === "rewards" ? "tab active" : "tab"}
onClick={() => setTab("rewards")}
>
Rewards Coach
</button>
<button
className={tab === "deals" ? "tab active" : "tab"}
onClick={() => setTab("deals")}
>
Voucher Finder
</button>
</nav>
</header>
{tab === "rewards" ? <RewardsCoach /> : <Deals />}

  <footer className="footer">
    <small>Uses only public feeds/APIs. No automation or account access. Respect site terms.</small>
  </footer>
</main>
);
}
