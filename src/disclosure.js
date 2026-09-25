/**
 * Planning helpers for YouTube sponsorship disclosure.
 * Not legal advice. Operators still read the FTC Endorsement Guides.
 */

const CLEAR_WORDS = [
  "ad",
  "ads",
  "advertisement",
  "sponsored",
  "sponsor",
  "paid partnership",
  "paid partner",
  "paid promotion",
  "paid to promote",
];

const WEAK_WORDS = [
  "thanks",
  "thank you",
  "collab",
  "collaboration",
  "partner",
  "partnership",
  "ambassador",
  "sp",
  "spon",
];

const RELATIONSHIPS = new Set([
  "paid_cash",
  "gifted_product",
  "affiliate",
  "mixed",
  "none",
]);

const FORMATS = new Set(["longform", "shorts"]);

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[#*_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstLines(text, maxChars) {
  const raw = String(text || "");
  return raw.slice(0, maxChars);
}

function containsAny(haystack, phrases) {
  return phrases.filter((p) => haystack.includes(p));
}

function wordBoundaryHit(haystack, word) {
  const re = new RegExp(`(?:^|[^a-z0-9])${word}(?:$|[^a-z0-9])`, "i");
  return re.test(haystack);
}

function findWeak(haystack) {
  return WEAK_WORDS.filter((w) => wordBoundaryHit(haystack, w));
}

function findClear(haystack) {
  return CLEAR_WORDS.filter((w) => haystack.includes(w));
}

function planDisclosure(input) {
  const relationship = String(input?.relationship || "");
  const format = String(input?.format || "longform");
  if (!RELATIONSHIPS.has(relationship)) {
    return { ok: false, error: "unknown_relationship" };
  }
  if (!FORMATS.has(format)) {
    return { ok: false, error: "unknown_format" };
  }

  const box = Boolean(input.paidPromotionBox);
  const verbal = Boolean(input.verbalInFirst30s);
  const onScreen = Boolean(input.onScreenLabel);
  const description = String(input.description || "");
  const hasPromo = Boolean(input.hasPromoCode);
  const hasAffiliate = Boolean(input.hasAffiliateLink);

  const needed = relationship !== "none";
  const head = normalize(firstLines(description, 160));
  const clearHits = findClear(head);
  const weakHits = findWeak(head);
  const clearInHead = clearHits.length > 0;

  const flags = [];
  const checks = [];

  if (!needed) {
    return {
      ok: true,
      needed: false,
      ready: true,
      flags: [],
      checks: [
        {
          id: "none",
          status: "pass",
          detail: "No material connection selected. No disclosure plan required.",
        },
      ],
      suggestedLine: "",
      score: { pass: 1, fail: 0, warn: 0 },
    };
  }

  checks.push({
    id: "platform_box",
    status: box ? "pass" : "fail",
    detail: box
      ? "YouTube paid-promotion box is marked."
      : "Mark YouTube Studio → Details → Paid promotion. The platform label is not a substitute for spoken and written disclosure.",
  });
  if (!box) flags.push("missing_paid_promotion_box");

  if (format === "longform") {
    checks.push({
      id: "verbal_first_30s",
      status: verbal ? "pass" : "fail",
      detail: verbal
        ? "Verbal disclosure is planned in the first 30 seconds."
        : "Plan a spoken line with a clear word (sponsored / paid partnership / ad) in the first 30 seconds, before the pitch.",
    });
    if (!verbal) flags.push("missing_verbal_disclosure");
  } else {
    checks.push({
      id: "shorts_onscreen",
      status: onScreen || verbal ? "pass" : "fail",
      detail:
        onScreen || verbal
          ? "Shorts plan includes an on-screen or spoken disclosure in the first seconds."
          : "Shorts hide descriptions. Add an on-screen 'Ad' / 'Sponsored' label in the first 1–2 seconds, plus a spoken line if there is audio.",
    });
    if (!(onScreen || verbal)) flags.push("missing_shorts_overlay");
  }

  if (!description.trim()) {
    checks.push({
      id: "description_head",
      status: "fail",
      detail: "Add a written disclosure in the first lines of the description, above the fold.",
    });
    flags.push("missing_description_disclosure");
  } else if (!clearInHead) {
    checks.push({
      id: "description_head",
      status: "fail",
      detail:
        weakHits.length > 0
          ? `First lines use weak wording (${weakHits.join(", ")}). Use Ad, Sponsored, Paid partnership, or Paid promotion.`
          : "First 160 characters of the description do not contain a clear disclosure word.",
    });
    flags.push("weak_or_missing_description_words");
  } else {
    checks.push({
      id: "description_head",
      status: "pass",
      detail: `Clear wording found near the top: ${clearHits.join(", ")}.`,
    });
  }

  if (hasPromo || hasAffiliate || relationship === "affiliate") {
    const nearOffer = clearInHead;
    checks.push({
      id: "offer_near_disclosure",
      status: nearOffer ? "pass" : "warn",
      detail: nearOffer
        ? "Offer / affiliate language sits with a clear disclosure in the first lines."
        : "If a code or affiliate link is used, put the disclosure in the same opening block as the link — not after a hashtag wall.",
    });
    if (!nearOffer) flags.push("offer_separated_from_disclosure");
  }

  if (weakHits.length && !clearInHead) {
    flags.push("weak_only_wording");
  }

  const pass = checks.filter((c) => c.status === "pass").length;
  const fail = checks.filter((c) => c.status === "fail").length;
  const warn = checks.filter((c) => c.status === "warn").length;

  const brand = String(input.brandName || "the brand").trim() || "the brand";
  const suggestedLine =
    relationship === "affiliate"
      ? `Ad: I may earn a commission if you use the link or code for ${brand}.`
      : relationship === "gifted_product"
        ? `Ad: ${brand} sent this product for me to try.`
        : `This video is sponsored by ${brand}.`;

  return {
    ok: true,
    needed: true,
    ready: fail === 0,
    flags,
    checks,
    suggestedLine,
    score: { pass, fail, warn },
    sources: {
      ftcQa: "https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking",
    },
  };
}

function csvSafe(value) {
  const s = String(value ?? "");
  const neutralized = /^[=+\-@|]/.test(s) ? `'${s}` : s;
  if (/[",\n\r]/.test(neutralized)) {
    return `"${neutralized.replace(/"/g, '""')}"`;
  }
  return neutralized;
}

function planToCsv(plan) {
  const rows = [["check_id", "status", "detail"]];
  for (const c of plan.checks || []) {
    rows.push([c.id, c.status, c.detail]);
  }
  return rows.map((r) => r.map(csvSafe).join(",")).join("\n") + "\n";
}

const api = {
  CLEAR_WORDS,
  WEAK_WORDS,
  planDisclosure,
  planToCsv,
  csvSafe,
  findClear,
  findWeak,
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = api;
}
if (typeof window !== "undefined") {
  window.planDisclosure = planDisclosure;
  window.planToCsv = planToCsv;
}
