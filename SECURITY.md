# Security Policy

Thank you for helping keep Congregation and its users safe.

## Supported Versions

Congregation is in active pre-1.0 development. Security fixes are applied to the `main` branch only. Once a stable release is cut, this section will be updated with a support matrix.

| Version | Supported          |
| ------- | ------------------ |
| `main`  | :white_check_mark: |

## Reporting a Vulnerability

**Please do not file public GitHub issues for security vulnerabilities.** Public disclosure before a fix is available puts every Congregation deployment — and the personal data of every congregation it manages — at risk.

Instead, report vulnerabilities privately via one of the following channels:

- **Email:** `MfonidoMark@gmail.com` with subject line `[SECURITY] Congregation: <short description>`
- **GitHub Security Advisory:** Use the [private vulnerability reporting](https://github.com/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation/security/advisories/new) form on this repository.

Please include:

1. A description of the vulnerability and its impact
2. Steps to reproduce (proof-of-concept code, screenshots, or a minimal repro repo)
3. The affected version or commit SHA
4. Any suggested mitigation
5. Whether you would like to be credited in the fix announcement

## What to Expect

- **Acknowledgement** within **72 hours** of your report
- **Triage and severity assessment** within **7 days**
- A coordinated fix and disclosure timeline — typically **30 days** for high-severity issues, longer for complex ones
- Public disclosure via a GitHub Security Advisory once a fix is released

## Scope

In scope:

- The Congregation web application source in this repository
- Default Firebase Security Rules shipped in `firestore.rules` and `storage.rules`
- The authentication and authorisation flow in `middleware/`, `stores/auth.ts`, and `plugins/firebase.client.ts`
- Documented setup paths in `docs/`

Out of scope:

- Misconfigurations of a self-hosted Firebase project that override or weaken the shipped rules
- Vulnerabilities in third-party dependencies that are already disclosed upstream — please report those to the upstream maintainers (we will track and update)
- Social engineering, physical attacks, or attacks against contributors

## Safe Harbour

We will not pursue legal action against researchers who:

- Make a good-faith effort to comply with this policy
- Do not access, modify, or delete data belonging to others
- Do not disrupt the service for other users
- Report findings privately and give us reasonable time to fix before disclosing publicly

Thank you for keeping the Congregation community safe.
