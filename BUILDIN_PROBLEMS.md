DOM Bundling failed 218ms node_modules\expo\dom\entry.js (197 modules)

Unable to resolve "react-native-web/dist/exports/AppRegistry" from "node_modules\expo\src\launch\AppRegistry.ts"

> 1 | export { AppRegistry as default } from 'react-native';

  2 |

Import stack:

 node_modules\expo\src\launch\AppRegistry.ts

 | import "react-native-web/dist/exports/AppRegistry"

 node_modules\expo\src\launch\registerRootComponent.web.tsx

 | import "./AppRegistry"

 node_modules\expo\src\dom\dom-entry.tsx

 | import "../launch/registerRootComponent"

 node_modules\expo\src\dom\internal.web.ts

 | import "./dom-entry"

 node_modules\expo\dom\internal.js

 | import "../src/dom/internal"

 node_modules\expo\dom\entry.js

 | import "expo/dom/internal"

 | import "./node_modules/expo/dom/entry"

 ERROR  [Error: Uncaught (in promise, id: 0) Error: Call to function 'DomWebView.injectJavaScript' has been rejected.

→ Caused by: The 1st argument cannot be cast to type class expo.modules.webview.DomWebView (received class java.lang.Integer)

→ Caused by: Unable to find the class expo.modules.webview.DomWebView view with tag 4068]

17.66 npm error Missing: [commander@2.20.3](mailto:commander@2.20.3) from lock file

17.66 npm error Missing: [source-map-support@0.5.21](mailto:source-map-support@0.5.21) from lock file

17.66 npm error Missing: [buffer-from@1.1.2](mailto:buffer-from@1.1.2) from lock file

17.66 npm error Missing: [source-map@0.6.1](mailto:source-map@0.6.1) from lock file

17.66 npm error Missing: [is-number@7.0.0](mailto:is-number@7.0.0) from lock file

17.66 npm error Missing: [escalade@3.2.0](mailto:escalade@3.2.0) from lock file

17.66 npm error Missing: [makeerror@1.0.12](mailto:makeerror@1.0.12) from lock file

17.66 npm error Missing: [tmpl@1.0.5](mailto:tmpl@1.0.5) from lock file

17.66 npm error Missing: [isexe@2.0.0](mailto:isexe@2.0.0) from lock file

17.66 npm error Missing: [cliui@8.0.1](mailto:cliui@8.0.1) from lock file

17.66 npm error Missing: [y18n@5.0.8](mailto:y18n@5.0.8) from lock file

17.66 npm error Missing: [yargs-parser@21.1.1](mailto:yargs-parser@21.1.1) from lock file

17.66 npm error Missing: [wrap-ansi@7.0.0](mailto:wrap-ansi@7.0.0) from lock file

17.66 npm error Missing: [mime-db@1.54.0](mailto:mime-db@1.54.0) from lock file

17.66 npm error Missing: [ms@2.0.0](mailto:ms@2.0.0) from lock file

17.66 npm error Missing: [ms@2.0.0](mailto:ms@2.0.0) from lock file

17.66 npm error Missing: [ms@2.0.0](mailto:ms@2.0.0) from lock file

17.66 npm error Missing: [agent-base@7.1.4](mailto:agent-base@7.1.4) from lock file

17.66 npm error Missing: [mime-db@1.54.0](mailto:mime-db@1.54.0) from lock file

17.66 npm error Missing: [cliui@8.0.1](mailto:cliui@8.0.1) from lock file

17.66 npm error Missing: [y18n@5.0.8](mailto:y18n@5.0.8) from lock file

17.66 npm error Missing: [yargs-parser@21.1.1](mailto:yargs-parser@21.1.1) from lock file

17.66 npm error Missing: [wrap-ansi@7.0.0](mailto:wrap-ansi@7.0.0) from lock file

17.66 npm error Missing: [cliui@8.0.1](mailto:cliui@8.0.1) from lock file

17.66 npm error Missing: [y18n@5.0.8](mailto:y18n@5.0.8) from lock file

17.66 npm error Missing: [yargs-parser@21.1.1](mailto:yargs-parser@21.1.1) from lock file

17.66 npm error Missing: [wrap-ansi@7.0.0](mailto:wrap-ansi@7.0.0) from lock file

17.66 npm error Missing: [ms@2.0.0](mailto:ms@2.0.0) from lock file

17.66 npm error

17.66 npm error Clean install a project

17.66 npm error

17.66 npm error Usage:

17.66 npm error npm ci

17.66 npm error

17.66 npm error Options:

17.66 npm error [--install-strategy <hoisted|nested|shallow|linked>] [--legacy-bundling]

17.66 npm error [--global-style] [--omit <dev|optional|peer> [--omit <dev|optional|peer> ...]]

17.66 npm error [--include <prod|dev|optional|peer> [--include <prod|dev|optional|peer> ...]]

17.66 npm error [--strict-peer-deps] [--foreground-scripts] [--ignore-scripts] [--no-audit]

17.66 npm error [--no-bin-links] [--no-fund] [--dry-run]

17.66 npm error [-w|--workspace  [-w|--workspace  ...]]

17.66 npm error [-ws|--workspaces] [--include-workspace-root] [--install-links]

17.66 npm error

17.66 npm error aliases: clean-install, ic, install-clean, isntall-clean

17.66 npm error

17.66 npm error Run "npm help ci" for more info

17.66 npm notice

17.66 npm notice New major version of npm available! 10.9.8 -> 12.0.2

17.66 npm notice Changelog: [https://github.com/npm/cli/releases/tag/v12.0.2](https://github.com/npm/cli/releases/tag/v12.0.2)

17.66 npm notice To update run: npm install -g [npm@12.0.2](mailto:npm@12.0.2)

17.66 npm notice

17.66 npm error A complete log of this run can be found in: /root/.npm/_logs/2026-08-15T14_04_05_706Z-debug-0.log

---

[+] build 0/2

 ⠙ Image fkgracanica-backend:prod  Building                                                                                                                                                                                            19.9s

 ⠙ Image fkgracanica-frontend:prod Building                                                                                                                                                                                            19.9s

Dockerfile:6

---

   4 |     WORKDIR /app

   5 |     COPY package.json package-lock.json ./

   6 | >>> RUN npm ci

   7 |     COPY . .

   8 |     ARG VITE_API_URL=[https://fkgracanica.ba101.top/backend/api/v1](https://fkgracanica.ba101.top/backend/api/v1)

---

target frontend: failed to solve: process "/bin/sh -c npm ci" did not complete successfully: exit code: 1

22.16 npm notice To update run: npm install -g [npm@12.0.2](mailto:npm@12.0.2)

22.16 npm notice

22.16 npm error A complete log of this run can be found in: /root/.npm/_logs/2026-08-15T13_50_10_380Z-debug-0.log

---

[+] build 0/2

 ⠙ Image fkgracanica-frontend:prod Building                                                                                                                                                                                            28.4s

 ⠙ Image fkgracanica-backend:prod  Building                                                                                                                                                                                            28.4s

Dockerfile:6

---

   4 |     WORKDIR /app

   5 |     COPY package.json package-lock.json ./

   6 | >>> RUN npm ci

   7 |     COPY . .

   8 |     ARG VITE_API_URL=[https://fkgracanica.ba101.top/backend/api/v1](https://fkgracanica.ba101.top/backend/api/v1)
