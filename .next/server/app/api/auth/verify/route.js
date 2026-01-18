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
exports.id = "app/api/auth/verify/route";
exports.ids = ["app/api/auth/verify/route"];
exports.modules = {

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fverify%2Froute&page=%2Fapi%2Fauth%2Fverify%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fverify%2Froute.js&appDir=D%3A%5CDEV%5CSociapa%5CDIVYANSH%5Call-codes%5Cads%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CDEV%5CSociapa%5CDIVYANSH%5Call-codes%5Cads&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fverify%2Froute&page=%2Fapi%2Fauth%2Fverify%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fverify%2Froute.js&appDir=D%3A%5CDEV%5CSociapa%5CDIVYANSH%5Call-codes%5Cads%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CDEV%5CSociapa%5CDIVYANSH%5Call-codes%5Cads&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var D_DEV_Sociapa_DIVYANSH_all_codes_ads_app_api_auth_verify_route_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/auth/verify/route.js */ \"(rsc)/./app/api/auth/verify/route.js\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/verify/route\",\n        pathname: \"/api/auth/verify\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/verify/route\"\n    },\n    resolvedPagePath: \"D:\\\\DEV\\\\Sociapa\\\\DIVYANSH\\\\all-codes\\\\ads\\\\app\\\\api\\\\auth\\\\verify\\\\route.js\",\n    nextConfigOutput,\n    userland: D_DEV_Sociapa_DIVYANSH_all_codes_ads_app_api_auth_verify_route_js__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/verify/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGdmVyaWZ5JTJGcm91dGUmcGFnZT0lMkZhcGklMkZhdXRoJTJGdmVyaWZ5JTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGYXV0aCUyRnZlcmlmeSUyRnJvdXRlLmpzJmFwcERpcj1EJTNBJTVDREVWJTVDU29jaWFwYSU1Q0RJVllBTlNIJTVDYWxsLWNvZGVzJTVDYWRzJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1EJTNBJTVDREVWJTVDU29jaWFwYSU1Q0RJVllBTlNIJTVDYWxsLWNvZGVzJTVDYWRzJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUM0QjtBQUN6RztBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL2FkbWluLWRhc2hib2FyZC1uZXh0anMvPzg1YTkiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiRDpcXFxcREVWXFxcXFNvY2lhcGFcXFxcRElWWUFOU0hcXFxcYWxsLWNvZGVzXFxcXGFkc1xcXFxhcHBcXFxcYXBpXFxcXGF1dGhcXFxcdmVyaWZ5XFxcXHJvdXRlLmpzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hdXRoL3ZlcmlmeS9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2F1dGgvdmVyaWZ5XCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hdXRoL3ZlcmlmeS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkQ6XFxcXERFVlxcXFxTb2NpYXBhXFxcXERJVllBTlNIXFxcXGFsbC1jb2Rlc1xcXFxhZHNcXFxcYXBwXFxcXGFwaVxcXFxhdXRoXFxcXHZlcmlmeVxcXFxyb3V0ZS5qc1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvYXV0aC92ZXJpZnkvcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fverify%2Froute&page=%2Fapi%2Fauth%2Fverify%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fverify%2Froute.js&appDir=D%3A%5CDEV%5CSociapa%5CDIVYANSH%5Call-codes%5Cads%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CDEV%5CSociapa%5CDIVYANSH%5Call-codes%5Cads&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/auth/verify/route.js":
/*!**************************************!*\
  !*** ./app/api/auth/verify/route.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/headers */ \"(rsc)/./node_modules/next/dist/api/headers.js\");\n\nasync function GET(request) {\n    try {\n        const token = (0,next_headers__WEBPACK_IMPORTED_MODULE_0__.cookies)().get(\"admin_token\");\n        if (token && token.value === \"valid_token\") {\n            return new Response(JSON.stringify({\n                authenticated: true\n            }), {\n                status: 200,\n                headers: {\n                    \"Content-Type\": \"application/json\"\n                }\n            });\n        }\n        return new Response(JSON.stringify({\n            authenticated: false\n        }), {\n            status: 200,\n            headers: {\n                \"Content-Type\": \"application/json\"\n            }\n        });\n    } catch (error) {\n        return new Response(JSON.stringify({\n            authenticated: false\n        }), {\n            status: 500,\n            headers: {\n                \"Content-Type\": \"application/json\"\n            }\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvdmVyaWZ5L3JvdXRlLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQXVDO0FBRWhDLGVBQWVDLElBQUlDLE9BQU87SUFDL0IsSUFBSTtRQUNGLE1BQU1DLFFBQVFILHFEQUFPQSxHQUFHSSxHQUFHLENBQUM7UUFFNUIsSUFBSUQsU0FBU0EsTUFBTUUsS0FBSyxLQUFLLGVBQWU7WUFDMUMsT0FBTyxJQUFJQyxTQUFTQyxLQUFLQyxTQUFTLENBQUM7Z0JBQUVDLGVBQWU7WUFBSyxJQUFJO2dCQUMzREMsUUFBUTtnQkFDUkMsU0FBUztvQkFBRSxnQkFBZ0I7Z0JBQW1CO1lBQ2hEO1FBQ0Y7UUFFQSxPQUFPLElBQUlMLFNBQVNDLEtBQUtDLFNBQVMsQ0FBQztZQUFFQyxlQUFlO1FBQU0sSUFBSTtZQUM1REMsUUFBUTtZQUNSQyxTQUFTO2dCQUFFLGdCQUFnQjtZQUFtQjtRQUNoRDtJQUNGLEVBQUUsT0FBT0MsT0FBTztRQUNkLE9BQU8sSUFBSU4sU0FBU0MsS0FBS0MsU0FBUyxDQUFDO1lBQUVDLGVBQWU7UUFBTSxJQUFJO1lBQzVEQyxRQUFRO1lBQ1JDLFNBQVM7Z0JBQUUsZ0JBQWdCO1lBQW1CO1FBQ2hEO0lBQ0Y7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL2FkbWluLWRhc2hib2FyZC1uZXh0anMvLi9hcHAvYXBpL2F1dGgvdmVyaWZ5L3JvdXRlLmpzPzE0ZGEiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY29va2llcyB9IGZyb20gJ25leHQvaGVhZGVycyc7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKHJlcXVlc3QpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgdG9rZW4gPSBjb29raWVzKCkuZ2V0KCdhZG1pbl90b2tlbicpO1xyXG4gICAgXHJcbiAgICBpZiAodG9rZW4gJiYgdG9rZW4udmFsdWUgPT09ICd2YWxpZF90b2tlbicpIHtcclxuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IGF1dGhlbnRpY2F0ZWQ6IHRydWUgfSksIHtcclxuICAgICAgICBzdGF0dXM6IDIwMCxcclxuICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShKU09OLnN0cmluZ2lmeSh7IGF1dGhlbnRpY2F0ZWQ6IGZhbHNlIH0pLCB7XHJcbiAgICAgIHN0YXR1czogMjAwLFxyXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcclxuICAgIH0pO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KHsgYXV0aGVudGljYXRlZDogZmFsc2UgfSksIHtcclxuICAgICAgc3RhdHVzOiA1MDAsXHJcbiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcbiJdLCJuYW1lcyI6WyJjb29raWVzIiwiR0VUIiwicmVxdWVzdCIsInRva2VuIiwiZ2V0IiwidmFsdWUiLCJSZXNwb25zZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJhdXRoZW50aWNhdGVkIiwic3RhdHVzIiwiaGVhZGVycyIsImVycm9yIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/verify/route.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fverify%2Froute&page=%2Fapi%2Fauth%2Fverify%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fverify%2Froute.js&appDir=D%3A%5CDEV%5CSociapa%5CDIVYANSH%5Call-codes%5Cads%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CDEV%5CSociapa%5CDIVYANSH%5Call-codes%5Cads&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();