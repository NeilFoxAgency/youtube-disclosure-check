/**
 * Plain-text one-page report builder for a campaign folder.
 * Pairs with src/disclosure.js. Planning helper output — not legal advice.
 *
 * Wrapped in an IIFE: this file shares the page with src/disclosure.js as a
 * classic script, so top-level const bindings must not leak into the global
 * lexical scope.
 */
(function () {
  const RELATIONSHIP_LABELS = {
    paid_cash: "Paid cash sponsorship",
    gifted_product: "Gifted product",
    affiliate: "Affiliate / commission",
    mixed: "Mixed (fee + affiliate)",
    none: "No material connection",
  };

  const FORMAT_LABELS = {
    longform: "Long-form video",
    shorts: "Shorts",
  };

  function labelFor(map, value) {
    const key = String(value || "");
    return map[key] || key || "unknown";
  }

  function verdictLine(plan) {
    if (!plan.needed) {
      return "No disclosure plan required (no material connection selected).";
    }
    return plan.ready
      ? "Ready: every required check passes. Review once as a viewer before publish."
      : "Not ready: fix the failing checks below before publish.";
  }

  /**
   * Build a plain-text one-pager from a planDisclosure() result and the
   * original input. Pass options.generatedAt (e.g. an ISO date) for a
   * deterministic header; omit it to leave a fill-in-the-blank line.
   */
  function planToTextReport(plan, input, options) {
    const opts = options || {};
    const src = input || {};
    const lines = [];

    lines.push("YOUTUBE DISCLOSURE PLAN — ONE-PAGER");
    lines.push("Generated: " + (opts.generatedAt || "__________"));
    lines.push("");

    const brand = String(src.brandName || "").trim() || "(not named)";
    lines.push("Brand: " + brand);
    lines.push("Relationship: " + labelFor(RELATIONSHIP_LABELS, src.relationship));
    lines.push("Format: " + labelFor(FORMAT_LABELS, src.format));
    lines.push("");

    lines.push("Verdict: " + verdictLine(plan));
    if (plan.score) {
      lines.push(
        `Score: ${plan.score.pass} pass, ${plan.score.fail} fail, ${plan.score.warn} warn`
      );
    }
    lines.push("");

    lines.push("Checks:");
    for (const c of plan.checks || []) {
      const mark = String(c.status || "").toUpperCase();
      lines.push(`[${mark}] ${c.id} — ${c.detail}`);
    }

    if (plan.suggestedLine) {
      lines.push("");
      lines.push("Suggested first line: " + plan.suggestedLine);
    }

    lines.push("");
    lines.push(
      "Planning helper only. Not legal advice and not an FTC or platform certification."
    );
    if (plan.sources && plan.sources.ftcQa) {
      lines.push("Reference: " + plan.sources.ftcQa);
    }

    return lines.join("\n") + "\n";
  }

  const reportApi = {
    RELATIONSHIP_LABELS,
    FORMAT_LABELS,
    planToTextReport,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = reportApi;
  }
  if (typeof window !== "undefined") {
    window.planToTextReport = planToTextReport;
  }
})();
