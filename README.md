Congregation[!\[GitHub stars\](https://img.shields.io/github/stars/mfonidomark/congregation?style=social)](https://github.com/mfonidomark/congregation/stargazers)[!\[GitHub forks\](https://img.shields.io/github/forks/mfonidomark/congregation?style=social)](https://github.com/mfonidomark/congregation/network/members)[!\[GitHub issues\](https://img.shields.io/github/issues/mfonidomark/congregation)](https://github.com/mfonidomark/congregation/issues)[!\[GitHub license\](https://img.shields.io/github/license/mfonidomark/congregation)](https://github.com/mfonidomark/congregation/blob/main/LICENSE)[!\[npm version\](https://img.shields.io/npm/v/congregation?color=orange)](https://www.npmjs.com/package/congregation) Congregation is an open-source Church Management System (CMS) and public landing platform that empowers churches and faith-based organizations to manage members, attendance, giving, events, and communications — all in one accessible and modern interface.Built with Vue.js, Nuxt 3, and Firebase, Congregation brings simplicity, transparency, and connection to ministry administration — whether online or offline. It's designed to be scalable, secure, and easy to deploy, supporting both small house churches and larger congregations. ScreenshotsAdmin DashboardAdmin Dashboard Screenshot Public Landing PagePublic Landing Page Screenshot Mobile ViewMobile Responsive Screenshot Table of Contents

*   Overview (#-overview)
    
*   Features (#-features)
    
*   Tech Stack (#-tech-stack)
    
*   Project Structure (#-project-structure)
    
*   Prerequisites (#-prerequisites)
    
*   Getting Started (#-getting-started)
    
*   Firebase Setup (#-firebase-setup)
    
*   Deployment (#-deployment)
    
*   Configuration (#-configuration)
    
*   Contribution Guide (#-contribution-guide)
    
*   Issue & PR Templates (#-issue--pr-templates)
    
*   Code of Conduct (#-code-of-conduct)
    
*   Security (#-security)
    
*   Roadmap (#-roadmap)
    
*   License (#-license)
    
*   Acknowledgements (#-acknowledgements)
    
*   Support & Contact (#-support--contact)
    
*   Changelog (#-changelog)
    

OverviewCongregation serves two main purposes:Admin Dashboard (CMS)

*   Centralized Management: Manage members, families, attendance, giving, announcements, small groups, and events from a single, intuitive dashboard.
    
*   Data Insights: Generate reports on attendance trends, giving summaries, and member engagement to inform ministry decisions.
    
*   Collaboration Tools: Enable role-based access for pastors, admins, staff, and members to foster teamwork.
    

Public Landing Page

*   Engaging Frontend: A clean, customizable website to share sermons, news, service times, upcoming events, and contact details with visitors.
    
*   Community Interaction: Features like prayer request forms, newsletter sign-ups, and live stream integrations to build connections.
    
*   SEO Optimized: Built for discoverability, with meta tags, sitemaps, and fast loading times.
    

This project was built to help ministries embrace technology with accessibility and excellence, particularly in underrepresented communities around the world. It's free to use, modify, and deploy under the AGPL-3.0 license. Features Admin Dashboard

*   Member Management: Add, edit, and search members with profiles including contact info, family links, and involvement history.
    
*   Family & Group Management: Organize households and small groups with automated notifications.
    
*   Giving & Tithe Tracking: Securely record donations with categorized reports, exportable to CSV/PDF, and integration for recurring pledges.
    
*   Event Scheduling: Create events with RSVPs, reminders via email/SMS (via Firebase), and shared calendars.
    
*   Attendance Management: Check-ins via QR codes or manual entry, with analytics on participation rates.
    
*   Sermon & Content Management: Upload audio/video sermons, blog posts, and resources with rich media support.
    
*   Role-Based Access Control (RBAC): Granular permissions for Pastor (full access), Admin (management), Staff (limited), and Member (view-only).
    
*   Custom Reports: Dashboard widgets for quick insights, with export options.
    

Public Landing Page

*   Dynamic Sections: Modular homepage with About Us, Ministries, Upcoming Events, Recent Sermons, and Testimonials.
    
*   Interactive Forms: Contact, Prayer Request, and Volunteer Sign-Up forms with real-time validation and Firestore integration.
    
*   Newsletter Subscriptions: Opt-in forms with Firebase Extensions for email delivery (e.g., via SendGrid integration).
    
*   Multimedia Support: Embed videos, photo galleries, and live streams from YouTube or Vimeo.
    
*   Mobile-First Design: Fully responsive with Tailwind CSS, ensuring seamless experience on all devices.
    
*   Accessibility Compliance: WCAG 2.1 AA standards, including alt text, keyboard navigation, and screen reader support.
    

Backend (Firebase)

*   Authentication: Multi-provider login (Email/Password, Google OAuth) with JWT tokens for secure sessions.
    
*   Database: Cloud Firestore for real-time data syncing, with collections for users, events, sermons, and donations.
    
*   Storage: Firebase Storage for uploading media files (sermons, images) with automatic optimization and CDN delivery.
    
*   Automation: Cloud Functions for tasks like sending event reminders, processing donations, and generating reports.
    
*   Hosting & CI/CD: Firebase Hosting for zero-config deployment, with GitHub Actions integration for automated builds.
    
*   Analytics: Built-in Firebase Analytics to track user engagement and feature usage.
    

Security Features

*   Data encryption at rest and in transit.
    
*   Input validation and sanitization to prevent XSS/SQL injection.
    
*   Rate limiting on forms and APIs.
    
*   Audit logs for admin actions.
    

Tech Stack**AreaTechnologyVersion/Notes**Frontend FrameworkVue.js 3 / Nuxt 3SSR/SSG supportStylingTailwind CSSUtility-first CSS frameworkState ManagementPiniaVue's official storeUI ComponentsHeadless UI / HeroiconsAccessible, unstyled componentsBackend & HostingFirebaseServerless backendDatabaseCloud FirestoreNoSQL, real-timeAuthenticationFirebase AuthMulti-provider supportStorageFirebase StorageFile uploads & CDNFunctionsFirebase Cloud FunctionsNode.js runtimeDeploymentFirebase Hosting / NetlifyCI/CD readyVersion ControlGit + GitHubBranch protection enabledTestingVitest / CypressUnit & E2E testsLinting/FormattingESLint / PrettierCode quality enforcementLicenseGNU AGPL v3Copyleft open-source Project StructureThe project follows Nuxt 3 conventions for a clean, modular architecture. Here's a detailed breakdown:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   congregation/  │  ├── assets/                 # Static assets like images, fonts, and SCSS files  │   └── css/  ├── components/             # Reusable Vue components (e.g., MemberCard.vue, EventCalendar.vue)  │   ├── admin/  │   └── public/  ├── composables/            # Nuxt 3 composables for logic reuse (e.g., useAuth.js, useFirestore.js)  ├── layouts/                # Page layouts (e.g., default.vue for public, admin.vue for dashboard)  ├── middleware/             # Route guards (e.g., auth.js for protected routes)  ├── pages/                  # Route-based pages (e.g., index.vue, admin/members.vue)  │   ├── admin/  │   └── public/  ├── plugins/                # Nuxt plugins (e.g., firebase.client.js, tailwindcss.js)  ├── public/                 # Public static files served directly (e.g., favicon.ico)  ├── server/                 # Server-side code (e.g., API routes, middleware)  ├── stores/                 # Pinia stores (e.g., members.js, events.js)  ├── utils/                  # Helper utilities (e.g., dateFormat.js, validation.js)  ├── .env.example            # Environment variables template  ├── .eslintrc.js            # ESLint configuration  ├── .gitignore              # Git ignore rules  ├── nuxt.config.ts          # Nuxt configuration  ├── package.json            # Dependencies and scripts  ├── README.md               # This file  ├── tailwind.config.js      # Tailwind configuration  └── tsconfig.json           # TypeScript configuration (if using TS)   `

For a full file tree, run tree in the root directory or check the GitHub repo. PrerequisitesBefore starting, ensure you have the following installed:

*   Node.js: v18+ (LTS recommended) – [Download here](https://nodejs.org/)
    
*   npm or yarn: Package manager (npm 9+)
    
*   Git: For cloning the repo – [Download here](https://git-scm.com/)
    
*   Firebase CLI: For deployment – Install via npm install -g firebase-tools
    
*   Google Account: For Firebase project setup
    

Optional:

*   VS Code with extensions: Volar (Vue), Tailwind CSS IntelliSense, Prettier
    
*   Firebase Emulator Suite: For local testing without costs
    

Getting StartedLocal Development

1.  git clone https://github.com/mfonidomark/congregation.gitcd congregation
    
2.  npm install# Or with yarn: yarn install
    
3.  Set Up Environment VariablesCopy .env.example to .env.local and fill in your Firebase config (see Firebase Setup (#-firebase-setup)).
    
4.  npm run dev# Or with yarn: yarn devOpen [http://localhost:3000](http://localhost:3000) in your browser. The app will auto-reload on changes.
    
5.  npm run test# Unit tests: npm run test:unit# E2E: npm run test:e2e
    
6.  npm run buildnpm run preview # Preview the built app
    

Using Firebase Emulator (Local Backend)For offline development:

1.  Install emulators: firebase init emulators
    
2.  Start emulator: firebase emulators:start
    
3.  Update .env to use emulator URLs.
    

Firebase Setup

1.  Create a Firebase Project
    
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
        
    *   Click "Add project" and name it (e.g., "congregation-prod").
        
    *   Enable Google Analytics if desired.
        
2.  Enable Services
    
    *   Authentication: Enable Email/Password and Google providers. Set up authorized domains.
        
    *   Firestore Database: Start in test mode, then secure with rules (sample rules provided in /firestore.rules).
        
    *   Storage: Set up buckets for images/media; configure security rules.
        
    *   Cloud Functions: Install Firebase CLI and deploy functions from /functions/.
        
    *   Hosting: Connect your GitHub repo for CI/CD.
        
3.  Get Configuration
    
    *   In Project Settings > General > Your apps, add a web app.
        
    *   Copy the firebaseConfig object.
        
4.  FIREBASE\_API\_KEY=your\_api\_keyFIREBASE\_AUTH\_DOMAIN=your\_project.firebaseapp.comFIREBASE\_PROJECT\_ID=your\_project\_idFIREBASE\_STORAGE\_BUCKET=your\_project.appspot.comFIREBASE\_MESSAGING\_SENDER\_ID=your\_sender\_idFIREBASE\_APP\_ID=your\_app\_idNUXT\_PUBLIC\_FIREBASE\_EMULATOR\_HOST=localhost:4000 # For local dev
    
5.  rules\_version = '2';service cloud.firestore { match /databases/{database}/documents { match /users/{userId} { allow read, write: if request.auth != null && request.auth.uid == userId; } // Add more rules for events, sermons, etc. }}
    

DeploymentFirebase Hosting (Recommended)

1.  Login: firebase login
    
2.  Init: firebase init hosting (select existing project)
    
3.  npm run buildfirebase deployYour site will be live at https://your\_project.web.app.
    

Alternative: Netlify

1.  Connect GitHub repo to Netlify.
    
2.  Set build command: npm run build
    
3.  Publish directory: .output/public
    
4.  Add env vars in Netlify dashboard.
    

Docker Support (Optional)Dockerfile provided for containerized deployment:bash

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   docker build -t congregation .  docker run -p 3000:3000 congregation   `

Configuration

*   Tailwind: Customize in tailwind.config.js for church branding (colors, fonts).
    
*   Nuxt: Extend modules in nuxt.config.ts (e.g., add @nuxtjs/seo).
    
*   Firebase Rules: Always test rules in the emulator before production.
    
*   Custom Domains: Set up in Firebase Hosting or Netlify for branded URLs.
    

Contribution GuideWe welcome contributions from the global community! Whether it's bug fixes, new features, documentation, or translations, your input helps make Congregation better for ministries worldwide.How to Contribute

1.  Fork the Repository on GitHub.
    
2.  Create a Feature Branch: git checkout -b feature/amazing-new-feature
    
3.  Make Changes: Follow coding standards (run npm run lint before committing).
    
4.  git commit -m "feat: add amazing new feature- Description of changes- Closes #issue-number"Use [Conventional Commits](https://www.conventionalcommits.org/) for semantic versioning.
    
5.  Push to Branch: git push origin feature/amazing-new-feature
    
6.  Open a Pull Request: Link to the issue it resolves and include screenshots if applicable.
    

Development Workflow

*   Use npm run dev for hot-reloading.
    
*   Run tests: npm test.
    
*   Lint: npm run lint -- --fix.
    

Translation Contributions

*   Edit files in /locales/ (using i18n).
    
*   Add new languages via PR.
    

Issue & PR Templates

*   Issues: Use the [Bug Report](https://github.com/mfonidomark/congregation/issues/new?template=bug_report.md) or [Feature Request](https://github.com/mfonidomark/congregation/issues/new?template=feature_request.md) template.
    
*   PRs: Follow the [Pull Request](https://github.com/mfonidomark/congregation/pulls) template for reviews.
    

Report security issues privately (see Security (#-security)). Code of ConductThis project adheres to the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you agree to uphold it. Instances of abusive behavior will be addressed. SecuritySecurity is paramount for handling sensitive member data.

*   Report Vulnerabilities: Email mfonidomark@gmail.com with a detailed description (do not open public issues).
    
*   Best Practices: Use HTTPS, validate inputs, and keep dependencies updated (npm audit).
    
*   Dependency Scanning: We use GitHub's Dependabot for alerts.
    

For more, see our SECURITY.md. RoadmapUpcoming Features (v2.0+)

*   SMS notifications via Twilio integration.
    
*   Mobile app with Capacitor (iOS/Android).
    
*   Advanced analytics with Google Analytics 4.
    
*   Multi-church support (sub-accounts).
    
*   AI-powered sermon transcription.
    

Planned Releases

*   v1.1: Bug fixes & performance (Q1 2026)
    
*   v2.0: Mobile app & SMS (Q3 2026)
    

Track progress in [Projects](https://github.com/mfonidomark/congregation/projects). LicenseThis project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) (LICENSE).You are free to:

*   Use, study, modify, and redistribute the software.
    
*   Host it publicly, provided the source code remains accessible to users interacting with the service.
    
*   Attribute the original authors in distributions.
    

For proprietary use, contact the authors for licensing options.See LICENSE for full details. Compatible with GNU projects; not suitable for closed-source SaaS without modifications. AcknowledgementsHeartfelt thanks to:

*   Core Technologies: [Vue.js](https://vuejs.org/), [Nuxt 3](https://nuxt.com/), [Tailwind CSS](https://tailwindcss.com/), [Firebase](https://firebase.google.com/)
    
*   Communities: [Open Source Community Africa (OSCA)](https://oscafrica.org/), Vue/Nuxt Discord, Firebase community
    
*   Inspiration: Projects like ChurchCRM and Planning Center for church tech standards
    
*   Contributors: [List will be auto-generated](https://github.com/mfonidomark/congregation/graphs/contributors) as PRs merge
    
*   Beta Testers: Early adopter churches in Nigeria and beyond
    

Everyone contributing to make church technology open, inclusive, and accessible Support & ContactNeed Help?

*   Documentation: Read this README and [Wiki](https://github.com/mfonidomark/congregation/wiki).
    
*   Discussions: Join [GitHub Discussions](https://github.com/mfonidomark/congregation/discussions) for Q&A.
    
*   Community: Follow @mfonidomark on X for updates.
    

Authors & MaintainersAuthor / Software Engineer Mfonido Mark

*   GitHub: [@favourmark05](https://github.com/favourmark05)
    
*   X (Twitter): @mfonidomark
    
*   Email: mfonidomark@gmail.com
    
*   LinkedIn: [mfonidomark](https://linkedin.com/in/mfonidomark)
    

Designer / Product Manager Abasifreke Antia

*   Email: seantantia7@gmail.com
    
*   Portfolio: \[Coming Soon\]
    

Hiring?Congregation is maintained part-time. For custom development or consultations, reach out via email.“Technology for the Kingdom — because stewardship should be as excellent as worship.” ChangelogSee CHANGELOG.md for detailed release notes.

*   v1.0.0 (2025-10-22): Initial release with core CMS and landing page features.
    
*   v0.1.0: Pre-alpha prototype.