# Contributing

1. Keep the planner client-side. No analytics, accounts, or fetch of YouTube data.
2. Do not present results as legal certification.
3. Add a Node test for each new check id.
4. Use synthetic brand names in fixtures.
5. Open a pull request against `main`. Do not force-push shared branches.

```bash
node --test tests/disclosure.test.js
```
