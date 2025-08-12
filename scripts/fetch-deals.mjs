import fs from "node:fs/promises";
import path from "node:path";
import Parser from "rss-parser";

const rss = new Parser({
  headers: { "User-Agent": "RewardsBuddy-IN/0.1 (contact: you@example.com)" },
});

const SOURCES = [
  { type: "rss", name: "r/IndiaDeals", url: "https://www.reddit.com/r/IndiaDeals/.rss" },
  { type: "rss", name: "r/freebies", url: "https://www.reddit.com/r/freebies/.rss" },
  { type: "rss", name: "r/FreeGameFindings", url: "https://www.reddit.com/r/FreeGameFindings/.rss" },
  { type: "rss", name: "r/FreeGamesOnSteam", url: "https://www.reddit.com/r/FreeGamesOnSteam/.rss" },
  { type: "rss", name: "DesiDime (Freebies?)", url: "https://www.desidime.com/forums/freebies.rss" },
  { type: "rss", name: "FreeKaaMaal", url: "https://freekaamaal.com/feed" },
  { type: "rss", name: "IndiaFreeStuff", url: "https://www.indiafreestuff.in/feed" },
];

const WHITELIST_DOMAINS = [
  "amazon.in", "flipkart.com", "myntra.com", "ajio.com", "tatacliq.com",
  "paytm.com", "paytmmall.com", "croma.com", "reliancedigital.in",
  "bigbasket.com", "swiggy.com", "zomato.com", "bookmyshow.com",
];

async function fromRSS(name, url) {
  try {
    const feed = await rss.parseURL(url);
    return (feed.items || []).map((i) => ({
      title: i.title || "Untitled",
      url: i.link || "#",
      source: name,
      published: i.pubDate || null,
    }));
  } catch (err) {
    console.warn(`RSS failed: ${name} -> ${url}`, err?.message || err);
    return [];
  }
}

async function epicFreeGames() {
  try {
    const res = await fetch("https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=en-US");
    const json = await res.json();
    const games = json?.data?.Catalog?.searchStore?.elements || [];
    const deals = [];
    for (const g of games) {
      const promos = g.promotions?.promotionalOffers || g.promotions?.upcomingPromotionalOffers;
      if (!promos || promos.length === 0) continue;
      const title = `${g.title} — Free on Epic`;
      const url = `https://store.epicgames.com/en-US/p/${g.productSlug || g.urlSlug || ""}`;
      deals.push({ title, url, source: "Epic Games", published: null });
    }
    return deals;
  } catch (e) {
    console.warn("Epic API failed", e?.message || e);
    return [];
  }
}

function isIndiaRelevant(deal) {
  try {
    const host = new URL(deal.url).hostname.replace(/^www\./, "");
    const isIN = WHITELIST_DOMAINS.some((d) => host.endsWith(d));
    const title = (deal.title || "").toLowerCase();
    const mentionsIndia = /india|inr|₹|\bIN\b/.test(title);
    return isIN || mentionsIndia;
  } catch {
    return false;
  }
}

function isVoucherish(deal) {
  const t = (deal.title || "").toLowerCase();
  return /voucher|coupon|promo|code|gift\s?card|free|redeem|cashback|coins/.test(t);
}

(async () => {
  const results = await Promise.allSettled([
    ...SOURCES.map((s) => fromRSS(s.name, s.url)),
    epicFreeGames(),
  ]);

  const items = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));

  const filtered = items.filter((d) => isVoucherish(d) || isIndiaRelevant(d));

  const unique = Array.from(new Map(filtered.map((d) => [d.url, d])).values());

  unique.sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0));

  const out = { count: unique.length, deals: unique };

  const outDir = path.join(process.cwd(), "public");
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, "deals.json"), JSON.stringify(out, null, 2), "utf-8");
  console.log(`Wrote ${unique.length} deals to public/deals.json`);
})();
