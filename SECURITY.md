# Security

This project is a static planning page plus Node tests.

- Do not send campaign briefs, creator emails, or unpublished scripts to a hosted service.
- The page makes no network calls after load.
- CSV export prefixes cells that start with `= + - @ |` so spreadsheet apps do not treat them as formulas.
- Report vulnerabilities privately to the repository owner. Do not file a public issue with exploit details.
