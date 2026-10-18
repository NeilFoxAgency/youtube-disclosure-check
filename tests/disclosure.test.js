const test = require("node:test");
const assert = require("node:assert/strict");
const {
  planDisclosure,
  planToCsv,
  csvSafe,
  findClear,
  findWeak,
  firstClearIndex,
  HEAD_CHARS,
} = require("../src/disclosure.js");

test("rejects unknown relationship", () => {
  const r = planDisclosure({ relationship: "secret" });
  assert.equal(r.ok, false);
  assert.equal(r.error, "unknown_relationship");
});

test("none relationship needs no disclosure", () => {
  const r = planDisclosure({ relationship: "none", format: "longform" });
  assert.equal(r.needed, false);
  assert.equal(r.ready, true);
});

test("paid longform fails without box, verbal, and description", () => {
  const r = planDisclosure({
    relationship: "paid_cash",
    format: "longform",
    paidPromotionBox: false,
    verbalInFirst30s: false,
    description: "",
  });
  assert.equal(r.ready, false);
  assert.ok(r.flags.includes("missing_paid_promotion_box"));
  assert.ok(r.flags.includes("missing_verbal_disclosure"));
  assert.ok(r.flags.includes("missing_description_disclosure"));
  assert.equal(r.score.fail, 3);
});

test("clear description wording passes the head check", () => {
  const r = planDisclosure({
    relationship: "paid_cash",
    format: "longform",
    paidPromotionBox: true,
    verbalInFirst30s: true,
    description: "Sponsored by Acme. Use code DEMO10.\n\nMore notes below.",
    brandName: "Acme",
  });
  assert.equal(r.ready, true);
  const head = r.checks.find((c) => c.id === "description_head");
  assert.equal(head.status, "pass");
  assert.match(r.suggestedLine, /sponsored by Acme/i);
});

test("weak thanks-only description fails", () => {
  const r = planDisclosure({
    relationship: "gifted_product",
    format: "longform",
    paidPromotionBox: true,
    verbalInFirst30s: true,
    description: "Thanks Acme for the collab. Partner post.",
  });
  const head = r.checks.find((c) => c.id === "description_head");
  assert.equal(head.status, "fail");
  assert.ok(r.flags.includes("weak_or_missing_description_words"));
});

test("shorts require overlay or verbal", () => {
  const r = planDisclosure({
    relationship: "paid_cash",
    format: "shorts",
    paidPromotionBox: true,
    verbalInFirst30s: false,
    onScreenLabel: false,
    description: "Ad: sponsored by Acme",
  });
  assert.equal(r.ready, false);
  assert.ok(r.flags.includes("missing_shorts_overlay"));
});

test("affiliate without clear head warns about offer placement", () => {
  const r = planDisclosure({
    relationship: "affiliate",
    format: "longform",
    paidPromotionBox: true,
    verbalInFirst30s: true,
    description: "Shop the merch dump below. Link in the last line after twenty hashtags.",
    hasAffiliateLink: true,
  });
  const offer = r.checks.find((c) => c.id === "offer_near_disclosure");
  assert.equal(offer.status, "warn");
});

test("findClear and findWeak are conservative", () => {
  assert.deepEqual(findClear("this video is sponsored by acme"), ["sponsored"]);
  assert.ok(findWeak("thanks for watching this collab").includes("thanks"));
  assert.ok(!findWeak("this spacetime experiment").includes("sp"));
});

test("csvSafe neutralizes formula cells", () => {
  assert.equal(csvSafe("=cmd"), "'=cmd");
  assert.equal(csvSafe("ok"), "ok");
});

test("planToCsv includes check rows", () => {
  const r = planDisclosure({
    relationship: "paid_cash",
    format: "longform",
    paidPromotionBox: true,
    verbalInFirst30s: true,
    description: "Paid partnership with DemoBrand",
  });
  const csv = planToCsv(r);
  assert.match(csv, /check_id,status,detail/);
  assert.match(csv, /platform_box,pass/);
});

test("buried #ad after the fold is flagged", () => {
  const pad = "Watch the full setup, gear list, and chapters below. ".repeat(6);
  assert.ok(pad.length > HEAD_CHARS);
  const r = planDisclosure({
    relationship: "paid_cash",
    format: "longform",
    paidPromotionBox: true,
    verbalInFirst30s: true,
    description: pad + "#ad Sponsored by Acme",
  });
  assert.equal(r.ready, false);
  assert.ok(r.flags.includes("disclosure_buried"));
  assert.ok(r.buriedAt >= HEAD_CHARS);
});

test("pinned-comment-only plan fails even with a good description", () => {
  const r = planDisclosure({
    relationship: "paid_cash",
    format: "longform",
    paidPromotionBox: true,
    verbalInFirst30s: true,
    description: "Sponsored by Acme.",
    disclosureOnlyInPinnedComment: true,
  });
  assert.equal(r.ready, false);
  assert.ok(r.flags.includes("pinned_comment_only"));
  const row = r.checks.find((c) => c.id === "pinned_comment");
  assert.equal(row.status, "fail");
});

test("end-screen-only plan fails", () => {
  const r = planDisclosure({
    relationship: "gifted_product",
    format: "longform",
    paidPromotionBox: true,
    verbalInFirst30s: true,
    description: "Ad: Acme sent this product for me to try.",
    disclosureOnlyOnEndScreen: true,
  });
  assert.equal(r.ready, false);
  assert.ok(r.flags.includes("end_screen_only"));
});

test("firstClearIndex finds #ad after punctuation", () => {
  assert.equal(firstClearIndex("Ad: hello"), 0);
  assert.ok(firstClearIndex("hello world #sponsored") > 10);
  assert.equal(firstClearIndex("no material words here"), -1);
});

test("findClear uses word boundaries so 'bad' is not an ad", () => {
  assert.deepEqual(findClear("this was a bad idea"), []);
  assert.ok(findClear("ad: acme paid this").includes("ad"));
});
