Pokrećem: Rebuild docker...

[+] Building 19.8s (26/37)

 => [internal] load local bake definitions                                                                                                                                                                                             0.0s

 => => reading from stdin 1.33kB                                                                                                                                                                                                       0.0s

 => [frontend internal] load build definition from Dockerfile                                                                                                                                                                          0.0s

 => => transferring dockerfile: 660B                                                                                                                                                                                                   0.0s

 => [backend internal] load build definition from Dockerfile                                                                                                                                                                           0.1s

 => => transferring dockerfile: 1.31kB                                                                                                                                                                                                 0.0s

 => [frontend] resolve image config for docker-image://docker.io/docker/dockerfile:1                                                                                                                                                   0.5s

 => CACHED [frontend] docker-image://docker.io/docker/dockerfile:1@sha256:ecfaec9ed6d810b56388c508f4121597bfbba70d41a6dfeee4d8cad5f295fc32                                                                                             0.0s

 => [backend internal] load metadata for docker.io/library/node:22-bookworm-slim                                                                                                                                                       0.5s

 => [frontend internal] load metadata for docker.io/library/node:22-alpine                                                                                                                                                             0.5s

 => [backend internal] load .dockerignore                                                                                                                                                                                              0.0s

 => => transferring context: 97B                                                                                                                                                                                                       0.0s

 => [frontend internal] load .dockerignore                                                                                                                                                                                             0.1s

 => => transferring context: 69B                                                                                                                                                                                                       0.0s

 => [backend deps 1/5] FROM docker.io/library/node:22-bookworm-slim@sha256:d649c27dae7ba0137b3cef5dd75baa422c08dc3d9e3fc0c23dfb172dc3cc6436                                                                                            0.0s

 => [backend internal] load build context                                                                                                                                                                                              0.0s

 => => transferring context: 17.99kB                                                                                                                                                                                                   0.0s

 => CACHED [backend deps 2/5] WORKDIR /app                                                                                                                                                                                             0.0s

 => CACHED [backend runner  3/11] RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*                                                                                              0.0s

 => CACHED [backend runner  4/11] RUN groupadd --system app && useradd --system --gid app --home-dir /app app                                                                                                                          0.0s

 => [frontend internal] load build context                                                                                                                                                                                             0.1s

 => => transferring context: 32.26kB                                                                                                                                                                                                   0.0s

 => [frontend builder 1/6] FROM docker.io/library/node:22-alpine@sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32                                                                                               0.0s

 => CACHED [frontend builder 2/6] WORKDIR /app                                                                                                                                                                                         0.0s

 => CACHED [frontend runner 3/5] RUN npm install express@4.21.2                                                                                                                                                                        0.0s

 => CACHED [backend deps 3/5] RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*                                                                                                  0.0s

 => CACHED [backend deps 4/5] COPY package.json package-lock.json ./                                                                                                                                                                   0.0s

 => CACHED [backend deps 5/5] RUN npm ci                                                                                                                                                                                               0.0s

 => CACHED [frontend builder 3/6] COPY package.json package-lock.json ./                                                                                                                                                               0.0s

 => [backend build 1/3] COPY . .                                                                                                                                                                                                       0.1s

 => ERROR [frontend builder 4/6] RUN npm ci                                                                                                                                                                                           17.8s

 => [backend build 2/3] RUN npx prisma generate                                                                                                                                                                                        2.7s

 => [backend build 3/3] RUN npm run build                                                                                                                                                                                             10.8s

------

 > [frontend builder 4/6] RUN npm ci:

2.333 npm warn ERESOLVE overriding peer dependency

2.333 npm warn While resolving: frontend@0.0.0

2.333 npm warn Found: react@19.2.7

2.333 npm warn node_modules/react

2.333 npm warn   react@"19.2.3" from the root project

2.333 npm warn   15 more (@dnd-kit/accessibility, @dnd-kit/core, ...)

2.333 npm warn

2.333 npm warn Could not resolve dependency:

2.333 npm warn peer react@"^19.2.7" from react-dom@19.2.7

2.333 npm warn node_modules/react-dom

2.333 npm warn   react-dom@"19.2.3" from the root project

2.333 npm warn   6 more (@dnd-kit/core, @tanstack/react-table, @tiptap/react, ...)

2.333 npm warn ERESOLVE overriding peer dependency

2.334 npm warn While resolving: frontend@0.0.0

2.334 npm warn Found: react@19.2.7

2.334 npm warn node_modules/react

2.334 npm warn   react@"19.2.3" from the root project

2.334 npm warn   15 more (@dnd-kit/accessibility, @dnd-kit/core, ...)

2.334 npm warn

2.334 npm warn Could not resolve dependency:

2.334 npm warn peer react@"^19.2.7" from react-dom@19.2.7

2.334 npm warn node_modules/react-dom

2.334 npm warn   react-dom@"19.2.3" from the root project

2.334 npm warn   6 more (@dnd-kit/core, @tanstack/react-table, @tiptap/react, ...)

2.334 npm warn ERESOLVE overriding peer dependency

2.334 npm warn While resolving: frontend@0.0.0

2.334 npm warn Found: react@19.2.7

2.334 npm warn node_modules/react

2.334 npm warn   react@"19.2.3" from the root project

2.334 npm warn   15 more (@dnd-kit/accessibility, @dnd-kit/core, ...)

2.334 npm warn

2.334 npm warn Could not resolve dependency:

2.334 npm warn peer react@"^19.2.7" from react-dom@19.2.7

2.334 npm warn node_modules/react-dom

2.334 npm warn   react-dom@"19.2.3" from the root project

2.334 npm warn   6 more (@dnd-kit/core, @tanstack/react-table, @tiptap/react, ...)

2.334 npm warn ERESOLVE overriding peer dependency

2.334 npm warn While resolving: frontend@0.0.0

2.334 npm warn Found: react@19.2.7

2.334 npm warn node_modules/react

2.334 npm warn   react@"19.2.3" from the root project

2.334 npm warn   15 more (@dnd-kit/accessibility, @dnd-kit/core, ...)

2.334 npm warn

2.334 npm warn Could not resolve dependency:

2.334 npm warn peer react@"^19.2.7" from react-dom@19.2.7

2.334 npm warn node_modules/react-dom

2.334 npm warn   react-dom@"19.2.3" from the root project

2.334 npm warn   6 more (@dnd-kit/core, @tanstack/react-table, @tiptap/react, ...)

2.335 npm warn ERESOLVE overriding peer dependency

2.335 npm warn While resolving: frontend@0.0.0

2.335 npm warn Found: react@19.2.7

2.335 npm warn node_modules/react

2.335 npm warn   react@"19.2.3" from the root project

2.335 npm warn   15 more (@dnd-kit/accessibility, @dnd-kit/core, ...)

2.335 npm warn

2.335 npm warn Could not resolve dependency:

2.335 npm warn peer react@"^19.2.7" from react-dom@19.2.7

2.335 npm warn node_modules/react-dom

2.335 npm warn   react-dom@"19.2.3" from the root project

2.335 npm warn   6 more (@dnd-kit/core, @tanstack/react-table, @tiptap/react, ...)

2.335 npm warn ERESOLVE overriding peer dependency

2.335 npm warn While resolving: frontend@0.0.0

2.335 npm warn Found: react@19.2.7

2.335 npm warn node_modules/react

2.335 npm warn   react@"19.2.3" from the root project

2.335 npm warn   15 more (@dnd-kit/accessibility, @dnd-kit/core, ...)

2.335 npm warn

2.335 npm warn Could not resolve dependency:

2.335 npm warn peer react@"^19.2.7" from react-dom@19.2.7

2.335 npm warn node_modules/react-dom

2.335 npm warn   react-dom@"19.2.3" from the root project

2.335 npm warn   6 more (@dnd-kit/core, @tanstack/react-table, @tiptap/react, ...)

17.66 npm error code EUSAGE

17.66 npm error

17.66 npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.

17.66 npm error

17.66 npm error Invalid: lock file's react@19.2.7 does not satisfy react@19.2.3

17.66 npm error Invalid: lock file's react-dom@19.2.7 does not satisfy react-dom@19.2.3

17.66 npm error Missing: react-native-svg@15.15.4 from lock file

17.66 npm error Missing: react-native@0.87.0 from lock file

17.66 npm error Missing: @react-native/asset-utils@0.87.0 from lock file

17.66 npm error Missing: @react-native/codegen@0.87.0 from lock file

17.66 npm error Missing: @react-native/community-cli-plugin@0.87.0 from lock file

17.66 npm error Missing: @react-native/gradle-plugin@0.87.0 from lock file

17.66 npm error Missing: @react-native/normalize-colors@0.87.0 from lock file

17.66 npm error Missing: @react-native/virtualized-lists@0.87.0 from lock file

17.66 npm error Missing: anser@1.4.10 from lock file

17.66 npm error Missing: babel-plugin-syntax-hermes-parser@0.36.1 from lock file

17.66 npm error Missing: base64-js@1.5.1 from lock file

17.66 npm error Missing: commander@12.1.0 from lock file

17.66 npm error Missing: flow-enums-runtime@0.0.6 from lock file

17.66 npm error Missing: hermes-compiler@250829098.0.16 from lock file

17.66 npm error Missing: invariant@2.2.4 from lock file

17.66 npm error Missing: memoize-one@5.2.1 from lock file

17.66 npm error Missing: metro-runtime@0.87.0 from lock file

17.66 npm error Missing: metro-source-map@0.87.0 from lock file

17.66 npm error Missing: nullthrows@1.1.1 from lock file

17.66 npm error Missing: pretty-format@29.7.0 from lock file

17.66 npm error Missing: promise@8.3.0 from lock file

17.66 npm error Missing: react-devtools-core@6.1.5 from lock file

17.66 npm error Missing: react-refresh@0.14.2 from lock file

17.66 npm error Missing: regenerator-runtime@0.13.11 from lock file

17.66 npm error Missing: semver@7.8.5 from lock file

17.66 npm error Missing: stacktrace-parser@0.1.11 from lock file

17.66 npm error Missing: whatwg-fetch@3.6.20 from lock file

17.66 npm error Missing: ws@7.5.13 from lock file

17.66 npm error Missing: yargs@17.7.3 from lock file

17.66 npm error Missing: @babel/core@7.29.7 from lock file

17.66 npm error Missing: @babel/parser@7.29.8 from lock file

17.66 npm error Missing: hermes-parser@0.36.1 from lock file

17.66 npm error Missing: yargs@17.7.3 from lock file

17.66 npm error Missing: @babel/code-frame@7.29.7 from lock file

17.66 npm error Missing: @babel/generator@7.29.8 from lock file

17.66 npm error Missing: @babel/helper-compilation-targets@7.29.7 from lock file

17.66 npm error Missing: @babel/helper-module-transforms@7.29.7 from lock file

17.66 npm error Missing: @babel/helpers@7.29.7 from lock file

17.66 npm error Missing: @babel/template@7.29.7 from lock file

17.66 npm error Missing: @babel/traverse@7.29.8 from lock file

17.66 npm error Missing: @babel/types@7.29.8 from lock file

17.66 npm error Missing: convert-source-map@2.0.0 from lock file

17.66 npm error Missing: gensync@1.0.0-beta.2 from lock file

17.66 npm error Missing: json5@2.2.3 from lock file

17.66 npm error Missing: semver@6.3.1 from lock file

17.66 npm error Missing: @babel/helper-validator-identifier@7.29.7 from lock file

17.66 npm error Missing: js-tokens@4.0.0 from lock file

17.66 npm error Missing: jsesc@3.1.0 from lock file

17.66 npm error Missing: @babel/compat-data@7.29.7 from lock file

17.66 npm error Missing: @babel/helper-validator-option@7.29.7 from lock file

17.66 npm error Missing: browserslist@4.28.8 from lock file

17.66 npm error Missing: lru-cache@5.1.1 from lock file

17.66 npm error Missing: semver@6.3.1 from lock file

17.66 npm error Missing: @babel/helper-module-imports@7.29.7 from lock file

17.66 npm error Missing: @babel/helper-globals@7.29.7 from lock file

17.66 npm error Missing: @babel/helper-string-parser@7.29.7 from lock file

17.66 npm error Missing: @react-native/dev-middleware@0.87.0 from lock file

17.66 npm error Missing: metro@0.87.0 from lock file

17.66 npm error Missing: @isaacs/ttlcache@1.4.1 from lock file

17.66 npm error Missing: @react-native/debugger-frontend@0.87.0 from lock file

17.66 npm error Missing: @react-native/debugger-shell@0.87.0 from lock file

17.66 npm error Missing: chrome-launcher@0.15.2 from lock file

17.66 npm error Missing: chromium-edge-launcher@0.3.0 from lock file

17.66 npm error Missing: connect@3.7.0 from lock file

17.66 npm error Missing: open@7.4.2 from lock file

17.66 npm error Missing: serve-static@1.16.3 from lock file

17.66 npm error Missing: ws@7.5.13 from lock file

17.66 npm error Missing: cross-spawn@7.0.6 from lock file

17.66 npm error Missing: fb-dotslash@0.5.8 from lock file

17.66 npm error Missing: baseline-browser-mapping@2.11.14 from lock file

17.66 npm error Missing: caniuse-lite@1.0.30001809 from lock file

17.66 npm error Missing: electron-to-chromium@1.5.407 from lock file

17.66 npm error Missing: node-releases@2.0.53 from lock file

17.66 npm error Missing: update-browserslist-db@1.3.1 from lock file

17.66 npm error Missing: escape-string-regexp@4.0.0 from lock file

17.66 npm error Missing: is-wsl@2.2.0 from lock file

17.66 npm error Missing: lighthouse-logger@1.4.2 from lock file

17.66 npm error Missing: mkdirp@1.0.4 from lock file

17.66 npm error Missing: debug@2.6.9 from lock file

17.66 npm error Missing: finalhandler@1.1.2 from lock file

17.66 npm error Missing: parseurl@1.3.3 from lock file

17.66 npm error Missing: utils-merge@1.0.1 from lock file

17.66 npm error Missing: path-key@3.1.1 from lock file

17.66 npm error Missing: shebang-command@2.0.0 from lock file

17.66 npm error Missing: which@2.0.2 from lock file

17.66 npm error Missing: debug@2.6.9 from lock file

17.66 npm error Missing: encodeurl@1.0.2 from lock file

17.66 npm error Missing: escape-html@1.0.3 from lock file

17.66 npm error Missing: on-finished@2.3.0 from lock file

17.66 npm error Missing: statuses@1.5.0 from lock file

17.66 npm error Missing: unpipe@1.0.0 from lock file

17.66 npm error Missing: hermes-estree@0.36.1 from lock file

17.66 npm error Missing: loose-envify@1.4.0 from lock file

17.66 npm error Missing: is-docker@2.2.1 from lock file

17.66 npm error Missing: debug@2.6.9 from lock file

17.66 npm error Missing: marky@1.3.0 from lock file

17.66 npm error Missing: yallist@3.1.1 from lock file

17.66 npm error Missing: accepts@2.0.0 from lock file

17.66 npm error Missing: ci-info@2.0.0 from lock file

17.66 npm error Missing: error-stack-parser@2.1.4 from lock file

17.66 npm error Missing: image-size@1.2.1 from lock file

17.66 npm error Missing: jest-worker@29.7.0 from lock file

17.66 npm error Missing: jsc-safe-url@0.2.4 from lock file

17.66 npm error Missing: lodash.throttle@4.1.1 from lock file

17.66 npm error Missing: metro-babel-transformer@0.87.0 from lock file

17.66 npm error Missing: metro-cache@0.87.0 from lock file

17.66 npm error Missing: metro-cache-key@0.87.0 from lock file

17.66 npm error Missing: metro-config@0.87.0 from lock file

17.66 npm error Missing: metro-core@0.87.0 from lock file

17.66 npm error Missing: metro-file-map@0.87.0 from lock file

17.66 npm error Missing: metro-resolver@0.87.0 from lock file

17.66 npm error Missing: metro-symbolicate@0.87.0 from lock file

17.66 npm error Missing: metro-transform-plugins@0.87.0 from lock file

17.66 npm error Missing: metro-transform-worker@0.87.0 from lock file

17.66 npm error Missing: mime-types@3.0.2 from lock file

17.66 npm error Missing: serialize-error@2.1.0 from lock file

17.66 npm error Missing: source-map@0.5.7 from lock file

17.66 npm error Missing: throat@5.0.0 from lock file

17.66 npm error Missing: ws@7.5.13 from lock file

17.66 npm error Missing: yargs@17.7.3 from lock file

17.66 npm error Missing: mime-types@3.0.2 from lock file

17.66 npm error Missing: negotiator@1.0.0 from lock file

17.66 npm error Missing: stackframe@1.3.4 from lock file

17.66 npm error Missing: queue@6.0.2 from lock file

17.66 npm error Missing: jest-util@29.7.0 from lock file

17.66 npm error Missing: merge-stream@2.0.0 from lock file

17.66 npm error Missing: supports-color@8.1.1 from lock file

17.66 npm error Missing: @jest/types@29.6.3 from lock file

17.66 npm error Missing: chalk@4.1.2 from lock file

17.66 npm error Missing: ci-info@3.9.0 from lock file

17.66 npm error Missing: picomatch@2.3.2 from lock file

17.66 npm error Missing: @jest/schemas@29.6.3 from lock file

17.66 npm error Missing: @types/istanbul-lib-coverage@2.0.6 from lock file

17.66 npm error Missing: @types/istanbul-reports@3.0.4 from lock file

17.66 npm error Missing: @types/yargs@17.0.35 from lock file

17.66 npm error Missing: @sinclair/typebox@0.27.12 from lock file

17.66 npm error Missing: @types/istanbul-lib-report@3.0.3 from lock file

17.66 npm error Missing: @types/yargs-parser@21.0.3 from lock file

17.66 npm error Missing: supports-color@7.2.0 from lock file

17.66 npm error Missing: exponential-backoff@3.1.3 from lock file

17.66 npm error Missing: https-proxy-agent@7.0.6 from lock file

17.66 npm error Missing: jest-validate@29.7.0 from lock file

17.66 npm error Missing: camelcase@6.3.0 from lock file

17.66 npm error Missing: jest-get-type@29.6.3 from lock file

17.66 npm error Missing: leven@3.1.0 from lock file

17.66 npm error Missing: fb-watchman@2.0.2 from lock file

17.66 npm error Missing: micromatch@4.0.8 from lock file

17.66 npm error Missing: walker@1.0.8 from lock file

17.66 npm error Missing: bser@2.1.1 from lock file

17.66 npm error Missing: node-int64@0.4.0 from lock file

17.66 npm error Missing: ob1@0.87.0 from lock file

17.66 npm error Missing: vlq@1.0.1 from lock file

17.66 npm error Missing: metro-minify-terser@0.87.0 from lock file

17.66 npm error Missing: terser@5.50.0 from lock file

17.66 npm error Missing: braces@3.0.3 from lock file

17.66 npm error Missing: picomatch@2.3.2 from lock file

17.66 npm error Missing: fill-range@7.1.1 from lock file

17.66 npm error Missing: to-regex-range@5.0.1 from lock file

17.66 npm error Missing: ee-first@1.1.1 from lock file

17.66 npm error Missing: ansi-styles@5.2.0 from lock file

17.66 npm error Missing: react-is@18.3.1 from lock file

17.66 npm error Missing: asap@2.0.6 from lock file

17.66 npm error Missing: inherits@2.0.4 from lock file

17.66 npm error Missing: shell-quote@1.10.0 from lock file

17.66 npm error Missing: ws@7.5.13 from lock file

17.66 npm error Missing: css-select@5.2.2 from lock file

17.66 npm error Missing: css-tree@1.1.3 from lock file

17.66 npm error Missing: warn-once@0.1.1 from lock file

17.66 npm error Missing: boolbase@1.0.0 from lock file

17.66 npm error Missing: css-what@6.2.2 from lock file

17.66 npm error Missing: domhandler@5.0.3 from lock file

17.66 npm error Missing: domutils@3.2.2 from lock file

17.66 npm error Missing: nth-check@2.1.1 from lock file

17.66 npm error Missing: mdn-data@2.0.14 from lock file

17.66 npm error Missing: source-map@0.6.1 from lock file

17.66 npm error Missing: domelementtype@2.3.0 from lock file

17.66 npm error Missing: dom-serializer@2.0.0 from lock file

17.66 npm error Missing: entities@4.5.0 from lock file

17.66 npm error Missing: encodeurl@2.0.0 from lock file

17.66 npm error Missing: send@0.19.2 from lock file

17.66 npm error Missing: debug@2.6.9 from lock file

17.66 npm error Missing: depd@2.0.0 from lock file

17.66 npm error Missing: destroy@1.2.0 from lock file

17.66 npm error Missing: encodeurl@2.0.0 from lock file

17.66 npm error Missing: etag@1.8.1 from lock file

17.66 npm error Missing: fresh@0.5.2 from lock file

17.66 npm error Missing: http-errors@2.0.1 from lock file

17.66 npm error Missing: mime@1.6.0 from lock file

17.66 npm error Missing: on-finished@2.4.1 from lock file

17.66 npm error Missing: range-parser@1.2.1 from lock file

17.66 npm error Missing: statuses@2.0.2 from lock file

17.66 npm error Missing: setprototypeof@1.2.0 from lock file

17.66 npm error Missing: statuses@2.0.2 from lock file

17.66 npm error Missing: toidentifier@1.0.1 from lock file

17.66 npm error Missing: shebang-regex@3.0.0 from lock file

17.66 npm error Missing: type-fest@0.7.1 from lock file

17.66 npm error Missing: has-flag@4.0.0 from lock file

17.66 npm error Missing: @jridgewell/source-map@0.3.11 from lock file

17.66 npm error Missing: acorn@8.18.0 from lock file

17.66 npm error Missing: commander@2.20.3 from lock file

17.66 npm error Missing: source-map-support@0.5.21 from lock file

17.66 npm error Missing: buffer-from@1.1.2 from lock file

17.66 npm error Missing: source-map@0.6.1 from lock file

17.66 npm error Missing: is-number@7.0.0 from lock file

17.66 npm error Missing: escalade@3.2.0 from lock file

17.66 npm error Missing: makeerror@1.0.12 from lock file

17.66 npm error Missing: tmpl@1.0.5 from lock file

17.66 npm error Missing: isexe@2.0.0 from lock file

17.66 npm error Missing: cliui@8.0.1 from lock file

17.66 npm error Missing: y18n@5.0.8 from lock file

17.66 npm error Missing: yargs-parser@21.1.1 from lock file

17.66 npm error Missing: wrap-ansi@7.0.0 from lock file

17.66 npm error Missing: mime-db@1.54.0 from lock file

17.66 npm error Missing: ms@2.0.0 from lock file

17.66 npm error Missing: ms@2.0.0 from lock file

17.66 npm error Missing: ms@2.0.0 from lock file

17.66 npm error Missing: agent-base@7.1.4 from lock file

17.66 npm error Missing: mime-db@1.54.0 from lock file

17.66 npm error Missing: cliui@8.0.1 from lock file

17.66 npm error Missing: y18n@5.0.8 from lock file

17.66 npm error Missing: yargs-parser@21.1.1 from lock file

17.66 npm error Missing: wrap-ansi@7.0.0 from lock file

17.66 npm error Missing: cliui@8.0.1 from lock file

17.66 npm error Missing: y18n@5.0.8 from lock file

17.66 npm error Missing: yargs-parser@21.1.1 from lock file

17.66 npm error Missing: wrap-ansi@7.0.0 from lock file

17.66 npm error Missing: ms@2.0.0 from lock file

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

17.66 npm error [-w|--workspace <workspace-name> [-w|--workspace <workspace-name> ...]]

17.66 npm error [-ws|--workspaces] [--include-workspace-root] [--install-links]

17.66 npm error

17.66 npm error aliases: clean-install, ic, install-clean, isntall-clean

17.66 npm error

17.66 npm error Run "npm help ci" for more info

17.66 npm notice

17.66 npm notice New major version of npm available! 10.9.8 -> 12.0.2

17.66 npm notice Changelog: [https://github.com/npm/cli/releases/tag/v12.0.2](https://github.com/npm/cli/releases/tag/v12.0.2)

17.66 npm notice To update run: npm install -g npm@12.0.2

17.66 npm notice

17.66 npm error A complete log of this run can be found in: /root/.npm/_logs/2026-08-15T14_04_05_706Z-debug-0.log

------

[+] build 0/2

 ⠙ Image fkgracanica-backend:prod  Building                                                                                                                                                                                            19.9s

 ⠙ Image fkgracanica-frontend:prod Building                                                                                                                                                                                            19.9s

Dockerfile:6

--------------------

   4 |     WORKDIR /app

   5 |     COPY package.json package-lock.json ./

   6 | >>> RUN npm ci

   7 |     COPY . .

   8 |     ARG VITE_API_URL=[https://fkgracanica.ba101.top/backend/api/v1](https://fkgracanica.ba101.top/backend/api/v1)

--------------------

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
