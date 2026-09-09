# youtube-disclosure-check

Privacy-first pre-publish planner for YouTube sponsorship, gifted-product, and affiliate disclosures.

Brands and creators already have fee calculators and UTM builders. They still miss the same operational step: *will a viewer understand there is a material connection before the pitch?* YouTube’s paid-promotion label is not enough by itself. Weak caption words (`thanks`, `collab`, `spon`) also fail that test.

This tool is a planning helper. It is **not legal advice** and does not certify FTC or YouTube compliance.

## Who it is for

- Agency operators reviewing a creator upload packet
- Creators who want a one-page check before they hit publish
- Brands that need a shared, inspectable checklist instead of a slide deck

## What it does

- Flags a missing YouTube paid-promotion box
- Requires a spoken plan in the first 30 seconds for long-form video
- Requires an on-screen or spoken disclosure for Shorts
- Scans the first 160 characters of a draft description for clear vs weak wording
- Warns when a promo code or affiliate link sits away from a clear disclosure
- Flags a `#ad` or “sponsored” line buried after the first 160 characters
- Fails plans that put the only written disclosure in a pinned comment or on the end screen
- Treats `bad` as a non-match for `ad` (word boundaries)
- Suggests a plain first line
- Exports a CSV of checks (formula-safe)

It does **not** fetch YouTube Studio, scan a live video, or store campaign data.

## Setup

Node 20+. No install required.

```bash
node --test tests/disclosure.test.js
```

Open `index.html` in a browser. The page loads only same-origin `src/disclosure.js`.

Library use:

```js
const { planDisclosure } = require("./src/disclosure.js");
const plan = planDisclosure({
  relationship: "paid_cash",
  format: "longform",
  paidPromotionBox: true,
  verbalInFirst30s: true,
  description: "Sponsored by DemoBrand.",
  brandName: "DemoBrand",
});
```

## Privacy

No accounts, cookies, analytics, or network calls from page logic. Example copy is synthetic.

## Limitations

- Word lists are conservative planning defaults, not a statute.
- The tool cannot hear the video or see Studio settings. Operators tick those boxes themselves.
- Other countries have their own advertising rules. This planner follows common U.S. FTC video guidance as a checklist, not as counsel.

## Roadmap

- Optional second-language word lists
- Printable one-pager for a campaign folder
- Pairing with `creator-deal-math` fee output without sharing data

## License

MIT. See `SECURITY.md` and `CONTRIBUTING.md`.
