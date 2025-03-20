"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/register";
exports.ids = ["pages/register"];
exports.modules = {

/***/ "./lib/auth.ts":
/*!*********************!*\
  !*** ./lib/auth.ts ***!
  \*********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"fetchWithAuth\": () => (/* binding */ fetchWithAuth),\n/* harmony export */   \"getToken\": () => (/* binding */ getToken),\n/* harmony export */   \"login\": () => (/* binding */ login),\n/* harmony export */   \"logout\": () => (/* binding */ logout),\n/* harmony export */   \"register\": () => (/* binding */ register)\n/* harmony export */ });\n/* harmony import */ var _simplewebauthn_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @simplewebauthn/browser */ \"@simplewebauthn/browser\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_simplewebauthn_browser__WEBPACK_IMPORTED_MODULE_0__]);\n_simplewebauthn_browser__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\nconst API_URL = \"http://127.0.0.1:8080\";\nasync function register(username) {\n    try {\n        // Step 1: Fetch registration options\n        const initResp = await fetch(`${API_URL}/api/reg/init`, {\n            method: \"POST\",\n            headers: {\n                \"Content-Type\": \"application/json\"\n            },\n            body: JSON.stringify({\n                username\n            })\n        });\n        const initData = await initResp.json();\n        if (!initResp.ok) throw new Error(initData.error || \"Failed to init registration\");\n        // Log and validate response\n        console.log(\"Registration init response:\", JSON.stringify(initData, null, 2));\n        if (!initData.challenge || !initData.challenge.publicKey || !initData.challenge.publicKey.challenge) {\n            throw new Error(\"Invalid registration options: missing challenge data\");\n        }\n        if (!initData.user_id) {\n            throw new Error(\"Missing user_id in response\");\n        }\n        // Step 2: Generate passkey\n        const options = initData.challenge; // Already includes publicKey\n        console.log(\"Options for startRegistration:\", JSON.stringify(options, null, 2));\n        const credential = await (0,_simplewebauthn_browser__WEBPACK_IMPORTED_MODULE_0__.startRegistration)(options);\n        // Step 3: Complete registration\n        const completeResp = await fetch(`${API_URL}/api/reg/complete`, {\n            method: \"POST\",\n            headers: {\n                \"Content-Type\": \"application/json\"\n            },\n            body: JSON.stringify({\n                user_id: initData.user_id,\n                credential\n            })\n        });\n        const completeData = await completeResp.json();\n        if (!completeResp.ok) throw new Error(completeData.error || \"Registration failed\");\n        localStorage.setItem(\"token\", completeData.token);\n        return completeData.user;\n    } catch (error) {\n        console.error(\"Register error:\", error);\n        throw error;\n    }\n}\nasync function login(username) {\n    try {\n        // Step 1: Fetch authentication options\n        const startResp = await fetch(`${API_URL}/api/auth/start`, {\n            method: \"POST\",\n            headers: {\n                \"Content-Type\": \"application/json\"\n            },\n            body: JSON.stringify({\n                username\n            })\n        });\n        const startData = await startResp.json();\n        if (!startResp.ok) throw new Error(startData.error || \"Failed to start authentication\");\n        // Log and validate response\n        console.log(\"Authentication start response:\", JSON.stringify(startData, null, 2));\n        if (!startData.challenge || !startData.allowCredentials) {\n            throw new Error(\"Invalid authentication options: missing challenge or allowCredentials\");\n        }\n        // Step 2: Authenticate with passkey\n        const options = startData; // Directly use the response\n        console.log(\"Options for startAuthentication:\", JSON.stringify(options, null, 2));\n        const credential = await (0,_simplewebauthn_browser__WEBPACK_IMPORTED_MODULE_0__.startAuthentication)(options);\n        // Step 3: Complete authentication\n        const completeResp = await fetch(`${API_URL}/api/auth/complete`, {\n            method: \"POST\",\n            headers: {\n                \"Content-Type\": \"application/json\"\n            },\n            body: JSON.stringify({\n                username,\n                credential\n            })\n        });\n        const completeData = await completeResp.json();\n        if (!completeResp.ok) throw new Error(completeData.error || \"Login failed\");\n        localStorage.setItem(\"token\", completeData.token);\n        return completeData.user;\n    } catch (error) {\n        console.error(\"Login error:\", error);\n        throw error;\n    }\n}\nfunction getToken() {\n    return localStorage.getItem(\"token\");\n}\nfunction logout() {\n    localStorage.removeItem(\"token\");\n}\nasync function fetchWithAuth(url, options = {}) {\n    const token = getToken();\n    const headers = {\n        ...options.headers,\n        \"Authorization\": `Bearer ${token}`,\n        \"Content-Type\": \"application/json\"\n    };\n    return fetch(url, {\n        ...options,\n        headers\n    });\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Oi8vcG9sbGluZy1mcm9udGVuZC8uL2xpYi9hdXRoLnRzP2JmN2UiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc3RhcnRSZWdpc3RyYXRpb24sIHN0YXJ0QXV0aGVudGljYXRpb24gfSBmcm9tICdAc2ltcGxld2ViYXV0aG4vYnJvd3Nlcic7XHJcblxyXG5jb25zdCBBUElfVVJMID0gJ2h0dHA6Ly8xMjcuMC4wLjE6ODA4MCc7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVnaXN0ZXIodXNlcm5hbWU6IHN0cmluZykge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICAvLyBTdGVwIDE6IEZldGNoIHJlZ2lzdHJhdGlvbiBvcHRpb25zXHJcbiAgICAgICAgY29uc3QgaW5pdFJlc3AgPSBhd2FpdCBmZXRjaChgJHtBUElfVVJMfS9hcGkvcmVnL2luaXRgLCB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcclxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyB1c2VybmFtZSB9KSxcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zdCBpbml0RGF0YSA9IGF3YWl0IGluaXRSZXNwLmpzb24oKTtcclxuICAgICAgICBpZiAoIWluaXRSZXNwLm9rKSB0aHJvdyBuZXcgRXJyb3IoaW5pdERhdGEuZXJyb3IgfHwgJ0ZhaWxlZCB0byBpbml0IHJlZ2lzdHJhdGlvbicpO1xyXG5cclxuICAgICAgICAvLyBMb2cgYW5kIHZhbGlkYXRlIHJlc3BvbnNlXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1JlZ2lzdHJhdGlvbiBpbml0IHJlc3BvbnNlOicsIEpTT04uc3RyaW5naWZ5KGluaXREYXRhLCBudWxsLCAyKSk7XHJcbiAgICAgICAgaWYgKCFpbml0RGF0YS5jaGFsbGVuZ2UgfHwgIWluaXREYXRhLmNoYWxsZW5nZS5wdWJsaWNLZXkgfHwgIWluaXREYXRhLmNoYWxsZW5nZS5wdWJsaWNLZXkuY2hhbGxlbmdlKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCByZWdpc3RyYXRpb24gb3B0aW9uczogbWlzc2luZyBjaGFsbGVuZ2UgZGF0YScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWluaXREYXRhLnVzZXJfaWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIHVzZXJfaWQgaW4gcmVzcG9uc2UnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFN0ZXAgMjogR2VuZXJhdGUgcGFzc2tleVxyXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBpbml0RGF0YS5jaGFsbGVuZ2U7IC8vIEFscmVhZHkgaW5jbHVkZXMgcHVibGljS2V5XHJcbiAgICAgICAgY29uc29sZS5sb2coJ09wdGlvbnMgZm9yIHN0YXJ0UmVnaXN0cmF0aW9uOicsIEpTT04uc3RyaW5naWZ5KG9wdGlvbnMsIG51bGwsIDIpKTtcclxuICAgICAgICBjb25zdCBjcmVkZW50aWFsID0gYXdhaXQgc3RhcnRSZWdpc3RyYXRpb24ob3B0aW9ucyk7XHJcblxyXG4gICAgICAgIC8vIFN0ZXAgMzogQ29tcGxldGUgcmVnaXN0cmF0aW9uXHJcbiAgICAgICAgY29uc3QgY29tcGxldGVSZXNwID0gYXdhaXQgZmV0Y2goYCR7QVBJX1VSTH0vYXBpL3JlZy9jb21wbGV0ZWAsIHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxyXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHVzZXJfaWQ6IGluaXREYXRhLnVzZXJfaWQsIGNyZWRlbnRpYWwgfSksXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29uc3QgY29tcGxldGVEYXRhID0gYXdhaXQgY29tcGxldGVSZXNwLmpzb24oKTtcclxuICAgICAgICBpZiAoIWNvbXBsZXRlUmVzcC5vaykgdGhyb3cgbmV3IEVycm9yKGNvbXBsZXRlRGF0YS5lcnJvciB8fCAnUmVnaXN0cmF0aW9uIGZhaWxlZCcpO1xyXG5cclxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndG9rZW4nLCBjb21wbGV0ZURhdGEudG9rZW4pO1xyXG4gICAgICAgIHJldHVybiBjb21wbGV0ZURhdGEudXNlcjtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignUmVnaXN0ZXIgZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9naW4odXNlcm5hbWU6IHN0cmluZykge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICAvLyBTdGVwIDE6IEZldGNoIGF1dGhlbnRpY2F0aW9uIG9wdGlvbnNcclxuICAgICAgICBjb25zdCBzdGFydFJlc3AgPSBhd2FpdCBmZXRjaChgJHtBUElfVVJMfS9hcGkvYXV0aC9zdGFydGAsIHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxyXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHVzZXJuYW1lIH0pLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnN0IHN0YXJ0RGF0YSA9IGF3YWl0IHN0YXJ0UmVzcC5qc29uKCk7XHJcbiAgICAgICAgaWYgKCFzdGFydFJlc3Aub2spIHRocm93IG5ldyBFcnJvcihzdGFydERhdGEuZXJyb3IgfHwgJ0ZhaWxlZCB0byBzdGFydCBhdXRoZW50aWNhdGlvbicpO1xyXG5cclxuICAgICAgICAvLyBMb2cgYW5kIHZhbGlkYXRlIHJlc3BvbnNlXHJcbiAgICAgICAgY29uc29sZS5sb2coJ0F1dGhlbnRpY2F0aW9uIHN0YXJ0IHJlc3BvbnNlOicsIEpTT04uc3RyaW5naWZ5KHN0YXJ0RGF0YSwgbnVsbCwgMikpO1xyXG4gICAgICAgIGlmICghc3RhcnREYXRhLmNoYWxsZW5nZSB8fCAhc3RhcnREYXRhLmFsbG93Q3JlZGVudGlhbHMpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGF1dGhlbnRpY2F0aW9uIG9wdGlvbnM6IG1pc3NpbmcgY2hhbGxlbmdlIG9yIGFsbG93Q3JlZGVudGlhbHMnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFN0ZXAgMjogQXV0aGVudGljYXRlIHdpdGggcGFzc2tleVxyXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBzdGFydERhdGE7IC8vIERpcmVjdGx5IHVzZSB0aGUgcmVzcG9uc2VcclxuICAgICAgICBjb25zb2xlLmxvZygnT3B0aW9ucyBmb3Igc3RhcnRBdXRoZW50aWNhdGlvbjonLCBKU09OLnN0cmluZ2lmeShvcHRpb25zLCBudWxsLCAyKSk7XHJcbiAgICAgICAgY29uc3QgY3JlZGVudGlhbCA9IGF3YWl0IHN0YXJ0QXV0aGVudGljYXRpb24ob3B0aW9ucyk7XHJcblxyXG4gICAgICAgIC8vIFN0ZXAgMzogQ29tcGxldGUgYXV0aGVudGljYXRpb25cclxuICAgICAgICBjb25zdCBjb21wbGV0ZVJlc3AgPSBhd2FpdCBmZXRjaChgJHtBUElfVVJMfS9hcGkvYXV0aC9jb21wbGV0ZWAsIHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxyXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHVzZXJuYW1lLCBjcmVkZW50aWFsIH0pLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnN0IGNvbXBsZXRlRGF0YSA9IGF3YWl0IGNvbXBsZXRlUmVzcC5qc29uKCk7XHJcbiAgICAgICAgaWYgKCFjb21wbGV0ZVJlc3Aub2spIHRocm93IG5ldyBFcnJvcihjb21wbGV0ZURhdGEuZXJyb3IgfHwgJ0xvZ2luIGZhaWxlZCcpO1xyXG5cclxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndG9rZW4nLCBjb21wbGV0ZURhdGEudG9rZW4pO1xyXG4gICAgICAgIHJldHVybiBjb21wbGV0ZURhdGEudXNlcjtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignTG9naW4gZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VG9rZW4oKSB7XHJcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBsb2dvdXQoKSB7XHJcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndG9rZW4nKTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoV2l0aEF1dGgodXJsOiBzdHJpbmcsIG9wdGlvbnM6IFJlcXVlc3RJbml0ID0ge30pIHtcclxuICAgIGNvbnN0IHRva2VuID0gZ2V0VG9rZW4oKTtcclxuICAgIGNvbnN0IGhlYWRlcnMgPSB7XHJcbiAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzLFxyXG4gICAgICAgICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke3Rva2VufWAsXHJcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgIH07XHJcbiAgICByZXR1cm4gZmV0Y2godXJsLCB7IC4uLm9wdGlvbnMsIGhlYWRlcnMgfSk7XHJcbn0iXSwibmFtZXMiOlsic3RhcnRSZWdpc3RyYXRpb24iLCJzdGFydEF1dGhlbnRpY2F0aW9uIiwiQVBJX1VSTCIsInJlZ2lzdGVyIiwidXNlcm5hbWUiLCJpbml0UmVzcCIsImZldGNoIiwibWV0aG9kIiwiaGVhZGVycyIsImJvZHkiLCJKU09OIiwic3RyaW5naWZ5IiwiaW5pdERhdGEiLCJqc29uIiwib2siLCJFcnJvciIsImVycm9yIiwiY29uc29sZSIsImxvZyIsImNoYWxsZW5nZSIsInB1YmxpY0tleSIsInVzZXJfaWQiLCJvcHRpb25zIiwiY3JlZGVudGlhbCIsImNvbXBsZXRlUmVzcCIsImNvbXBsZXRlRGF0YSIsImxvY2FsU3RvcmFnZSIsInNldEl0ZW0iLCJ0b2tlbiIsInVzZXIiLCJsb2dpbiIsInN0YXJ0UmVzcCIsInN0YXJ0RGF0YSIsImFsbG93Q3JlZGVudGlhbHMiLCJnZXRUb2tlbiIsImdldEl0ZW0iLCJsb2dvdXQiLCJyZW1vdmVJdGVtIiwiZmV0Y2hXaXRoQXV0aCIsInVybCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./lib/auth.ts\n");

/***/ }),

/***/ "./lib/store.ts":
/*!**********************!*\
  !*** ./lib/store.ts ***!
  \**********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"useStore\": () => (/* binding */ useStore)\n/* harmony export */ });\n/* harmony import */ var zustand__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! zustand */ \"zustand\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([zustand__WEBPACK_IMPORTED_MODULE_0__]);\nzustand__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\nconst useStore = (0,zustand__WEBPACK_IMPORTED_MODULE_0__.create)((set)=>({\n        user: null,\n        setUser: (user)=>set({\n                user\n            })\n    }));\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9saWIvc3RvcmUudHMuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBaUM7QUFZMUIsTUFBTUMsV0FBV0QsK0NBQU1BLENBQVEsQ0FBQ0UsTUFBUztRQUM1Q0MsTUFBTSxJQUFJO1FBQ1ZDLFNBQVMsQ0FBQ0QsT0FBU0QsSUFBSTtnQkFBRUM7WUFBSztJQUNsQyxJQUFJIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcG9sbGluZy1mcm9udGVuZC8uL2xpYi9zdG9yZS50cz9lODQyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZSB9IGZyb20gJ3p1c3RhbmQnO1xyXG5cclxuaW50ZXJmYWNlIFVzZXIge1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIHVzZXJuYW1lOiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBTdG9yZSB7XHJcbiAgICB1c2VyOiBVc2VyIHwgbnVsbDtcclxuICAgIHNldFVzZXI6ICh1c2VyOiBVc2VyIHwgbnVsbCkgPT4gdm9pZDtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IHVzZVN0b3JlID0gY3JlYXRlPFN0b3JlPigoc2V0KSA9PiAoe1xyXG4gICAgdXNlcjogbnVsbCxcclxuICAgIHNldFVzZXI6ICh1c2VyKSA9PiBzZXQoeyB1c2VyIH0pLFxyXG59KSk7Il0sIm5hbWVzIjpbImNyZWF0ZSIsInVzZVN0b3JlIiwic2V0IiwidXNlciIsInNldFVzZXIiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./lib/store.ts\n");

/***/ }),

/***/ "./pages/register.tsx":
/*!****************************!*\
  !*** ./pages/register.tsx ***!
  \****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Register)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_store__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/store */ \"./lib/store.ts\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/auth */ \"./lib/auth.ts\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! next/router */ \"next/router\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_4__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_lib_store__WEBPACK_IMPORTED_MODULE_2__, _lib_auth__WEBPACK_IMPORTED_MODULE_3__]);\n([_lib_store__WEBPACK_IMPORTED_MODULE_2__, _lib_auth__WEBPACK_IMPORTED_MODULE_3__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n\n\nfunction Register() {\n    const [username, setUsername] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(\"\");\n    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const { setUser  } = (0,_lib_store__WEBPACK_IMPORTED_MODULE_2__.useStore)();\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_4__.useRouter)();\n    const handleRegister = async (e)=>{\n        e.preventDefault();\n        setError(null);\n        try {\n            const user = await (0,_lib_auth__WEBPACK_IMPORTED_MODULE_3__.register)(username);\n            setUser(user);\n            router.push(\"/\");\n        } catch (err) {\n            setError(err.message || \"Registration failed\");\n        }\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h1\", {\n                children: \"Register\"\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\shann\\\\Downloads\\\\Catalog-Assignments\\\\week-5\\\\catalog-week5-polling\\\\frontend\\\\pages\\\\register.tsx\",\n                lineNumber: 26,\n                columnNumber: 13\n            }, this),\n            error && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                style: {\n                    color: \"red\"\n                },\n                children: error\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\shann\\\\Downloads\\\\Catalog-Assignments\\\\week-5\\\\catalog-week5-polling\\\\frontend\\\\pages\\\\register.tsx\",\n                lineNumber: 27,\n                columnNumber: 23\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"form\", {\n                onSubmit: handleRegister,\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"input\", {\n                        type: \"text\",\n                        value: username,\n                        onChange: (e)=>setUsername(e.target.value),\n                        placeholder: \"Username\",\n                        required: true\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\shann\\\\Downloads\\\\Catalog-Assignments\\\\week-5\\\\catalog-week5-polling\\\\frontend\\\\pages\\\\register.tsx\",\n                        lineNumber: 29,\n                        columnNumber: 17\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                        type: \"submit\",\n                        children: \"Register with Passkey\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Users\\\\shann\\\\Downloads\\\\Catalog-Assignments\\\\week-5\\\\catalog-week5-polling\\\\frontend\\\\pages\\\\register.tsx\",\n                        lineNumber: 36,\n                        columnNumber: 17\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"C:\\\\Users\\\\shann\\\\Downloads\\\\Catalog-Assignments\\\\week-5\\\\catalog-week5-polling\\\\frontend\\\\pages\\\\register.tsx\",\n                lineNumber: 28,\n                columnNumber: 13\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"C:\\\\Users\\\\shann\\\\Downloads\\\\Catalog-Assignments\\\\week-5\\\\catalog-week5-polling\\\\frontend\\\\pages\\\\register.tsx\",\n        lineNumber: 25,\n        columnNumber: 9\n    }, this);\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9yZWdpc3Rlci50c3guanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBaUM7QUFDTztBQUNEO0FBQ0M7QUFFekIsU0FBU0ksV0FBVztJQUMvQixNQUFNLENBQUNDLFVBQVVDLFlBQVksR0FBR04sK0NBQVFBLENBQUM7SUFDekMsTUFBTSxDQUFDTyxPQUFPQyxTQUFTLEdBQUdSLCtDQUFRQSxDQUFnQixJQUFJO0lBQ3RELE1BQU0sRUFBRVMsUUFBTyxFQUFFLEdBQUdSLG9EQUFRQTtJQUM1QixNQUFNUyxTQUFTUCxzREFBU0E7SUFFeEIsTUFBTVEsaUJBQWlCLE9BQU9DLElBQXVCO1FBQ2pEQSxFQUFFQyxjQUFjO1FBQ2hCTCxTQUFTLElBQUk7UUFDYixJQUFJO1lBQ0EsTUFBTU0sT0FBTyxNQUFNWixtREFBUUEsQ0FBQ0c7WUFDNUJJLFFBQVFLO1lBQ1JKLE9BQU9LLElBQUksQ0FBQztRQUNoQixFQUFFLE9BQU9DLEtBQVU7WUFDZlIsU0FBU1EsSUFBSUMsT0FBTyxJQUFJO1FBQzVCO0lBQ0o7SUFFQSxxQkFDSSw4REFBQ0M7OzBCQUNHLDhEQUFDQzswQkFBRzs7Ozs7O1lBQ0haLHVCQUFTLDhEQUFDYTtnQkFBRUMsT0FBTztvQkFBRUMsT0FBTztnQkFBTTswQkFBSWY7Ozs7OzswQkFDdkMsOERBQUNnQjtnQkFBS0MsVUFBVWI7O2tDQUNaLDhEQUFDYzt3QkFDR0MsTUFBSzt3QkFDTEMsT0FBT3RCO3dCQUNQdUIsVUFBVSxDQUFDaEIsSUFBTU4sWUFBWU0sRUFBRWlCLE1BQU0sQ0FBQ0YsS0FBSzt3QkFDM0NHLGFBQVk7d0JBQ1pDLFFBQVE7Ozs7OztrQ0FFWiw4REFBQ0M7d0JBQU9OLE1BQUs7a0NBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUl0QyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcG9sbGluZy1mcm9udGVuZC8uL3BhZ2VzL3JlZ2lzdGVyLnRzeD9hNmM1Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyB1c2VTdG9yZSB9IGZyb20gJy4uL2xpYi9zdG9yZSc7XHJcbmltcG9ydCB7IHJlZ2lzdGVyIH0gZnJvbSAnLi4vbGliL2F1dGgnO1xyXG5pbXBvcnQgeyB1c2VSb3V0ZXIgfSBmcm9tICduZXh0L3JvdXRlcic7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBSZWdpc3RlcigpIHtcclxuICAgIGNvbnN0IFt1c2VybmFtZSwgc2V0VXNlcm5hbWVdID0gdXNlU3RhdGUoJycpO1xyXG4gICAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKTtcclxuICAgIGNvbnN0IHsgc2V0VXNlciB9ID0gdXNlU3RvcmUoKTtcclxuICAgIGNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpO1xyXG5cclxuICAgIGNvbnN0IGhhbmRsZVJlZ2lzdGVyID0gYXN5bmMgKGU6IFJlYWN0LkZvcm1FdmVudCkgPT4ge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzZXRFcnJvcihudWxsKTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgcmVnaXN0ZXIodXNlcm5hbWUpO1xyXG4gICAgICAgICAgICBzZXRVc2VyKHVzZXIpO1xyXG4gICAgICAgICAgICByb3V0ZXIucHVzaCgnLycpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XHJcbiAgICAgICAgICAgIHNldEVycm9yKGVyci5tZXNzYWdlIHx8ICdSZWdpc3RyYXRpb24gZmFpbGVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gKFxyXG4gICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgIDxoMT5SZWdpc3RlcjwvaDE+XHJcbiAgICAgICAgICAgIHtlcnJvciAmJiA8cCBzdHlsZT17eyBjb2xvcjogJ3JlZCcgfX0+e2Vycm9yfTwvcD59XHJcbiAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXtoYW5kbGVSZWdpc3Rlcn0+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXRcclxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3VzZXJuYW1lfVxyXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0VXNlcm5hbWUoZS50YXJnZXQudmFsdWUpfVxyXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiVXNlcm5hbWVcIlxyXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkXHJcbiAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCI+UmVnaXN0ZXIgd2l0aCBQYXNza2V5PC9idXR0b24+XHJcbiAgICAgICAgICAgIDwvZm9ybT5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICk7XHJcbn0iXSwibmFtZXMiOlsidXNlU3RhdGUiLCJ1c2VTdG9yZSIsInJlZ2lzdGVyIiwidXNlUm91dGVyIiwiUmVnaXN0ZXIiLCJ1c2VybmFtZSIsInNldFVzZXJuYW1lIiwiZXJyb3IiLCJzZXRFcnJvciIsInNldFVzZXIiLCJyb3V0ZXIiLCJoYW5kbGVSZWdpc3RlciIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInVzZXIiLCJwdXNoIiwiZXJyIiwibWVzc2FnZSIsImRpdiIsImgxIiwicCIsInN0eWxlIiwiY29sb3IiLCJmb3JtIiwib25TdWJtaXQiLCJpbnB1dCIsInR5cGUiLCJ2YWx1ZSIsIm9uQ2hhbmdlIiwidGFyZ2V0IiwicGxhY2Vob2xkZXIiLCJyZXF1aXJlZCIsImJ1dHRvbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/register.tsx\n");

/***/ }),

/***/ "next/router":
/*!******************************!*\
  !*** external "next/router" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("next/router");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "@simplewebauthn/browser":
/*!******************************************!*\
  !*** external "@simplewebauthn/browser" ***!
  \******************************************/
/***/ ((module) => {

module.exports = import("@simplewebauthn/browser");;

/***/ }),

/***/ "zustand":
/*!**************************!*\
  !*** external "zustand" ***!
  \**************************/
/***/ ((module) => {

module.exports = import("zustand");;

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./pages/register.tsx"));
module.exports = __webpack_exports__;

})();