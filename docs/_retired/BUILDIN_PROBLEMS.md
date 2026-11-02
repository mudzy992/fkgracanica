⚠️ PENZIONISANO (retired) – NIJE RELEVANTNO za implementaciju. Služi samo kao historijska referenca. Datum penzionisanja: 2026-11-02.

DOM Bundled 19ms node_modules\expo\dom\entry.js (1 module)

Web  INFO  %cDownload the React DevTools for a better development experience: [https://react.dev/link/react-devtools](https://react.dev/link/react-devtools) font-weight:bold

Web  ERROR  [Error: Top OS ($$EXPO_DOM_HOST_OS) is not defined. This is a bug in the DOM Component runtime.]

Code: dom-entry.tsx

  60 | export function registerDOMComponent(AppModule: any) {

  61 |   if (typeof window.$$EXPO_DOM_HOST_OS === 'undefined') {

> 62 |     throw new Error(

     |           ^

  63 |       'Top OS ($$EXPO_DOM_HOST_OS) is not defined. This is a bug in the DOM Component runtime.'

  64 |     );

  65 |   }

Call Stack

  registerDOMComponent (node_modules\expo\src\dom\dom-entry.tsx:62:11)

  <global> (node_modules\expo\dom\entry.js:1:30)

  loadModuleImplementation (node_modules\@expo\cli\build\metro-require\require.js:248:36)

  guardedLoadModule (node_modules\@expo\cli\build\metro-require\require.js:156:27)

  metroRequire (node_modules\@expo\cli\build\metro-require\require.js:74:75)

  <unknown> (mobile\http:\192.168.31.247:8081\node_modules\expo\dom\entry.bundle)
