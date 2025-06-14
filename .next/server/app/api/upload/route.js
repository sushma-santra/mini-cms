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
exports.id = "app/api/upload/route";
exports.ids = ["app/api/upload/route"];
exports.modules = {

/***/ "@aws-sdk/client-s3":
/*!*************************************!*\
  !*** external "@aws-sdk/client-s3" ***!
  \*************************************/
/***/ ((module) => {

module.exports = require("@aws-sdk/client-s3");

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

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "http2":
/*!************************!*\
  !*** external "http2" ***!
  \************************/
/***/ ((module) => {

module.exports = require("http2");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "node:stream":
/*!******************************!*\
  !*** external "node:stream" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:stream");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload%2Froute&page=%2Fapi%2Fupload%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload%2Froute.ts&appDir=%2Fhome%2Fsushma%2FDocuments%2FDraftMode%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fsushma%2FDocuments%2FDraftMode&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload%2Froute&page=%2Fapi%2Fupload%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload%2Froute.ts&appDir=%2Fhome%2Fsushma%2FDocuments%2FDraftMode%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fsushma%2FDocuments%2FDraftMode&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _home_sushma_Documents_DraftMode_src_app_api_upload_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/upload/route.ts */ \"(rsc)/./src/app/api/upload/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/upload/route\",\n        pathname: \"/api/upload\",\n        filename: \"route\",\n        bundlePath: \"app/api/upload/route\"\n    },\n    resolvedPagePath: \"/home/sushma/Documents/DraftMode/src/app/api/upload/route.ts\",\n    nextConfigOutput,\n    userland: _home_sushma_Documents_DraftMode_src_app_api_upload_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/upload/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZ1cGxvYWQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnVwbG9hZCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnVwbG9hZCUyRnJvdXRlLnRzJmFwcERpcj0lMkZob21lJTJGc3VzaG1hJTJGRG9jdW1lbnRzJTJGRHJhZnRNb2RlJTJGc3JjJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZob21lJTJGc3VzaG1hJTJGRG9jdW1lbnRzJTJGRHJhZnRNb2RlJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUNZO0FBQ3pGO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc2ltcGxlLWNtcy8/Mzc5OSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvaG9tZS9zdXNobWEvRG9jdW1lbnRzL0RyYWZ0TW9kZS9zcmMvYXBwL2FwaS91cGxvYWQvcm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL3VwbG9hZC9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL3VwbG9hZFwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvdXBsb2FkL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiL2hvbWUvc3VzaG1hL0RvY3VtZW50cy9EcmFmdE1vZGUvc3JjL2FwcC9hcGkvdXBsb2FkL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS91cGxvYWQvcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload%2Froute&page=%2Fapi%2Fupload%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload%2Froute.ts&appDir=%2Fhome%2Fsushma%2FDocuments%2FDraftMode%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fsushma%2FDocuments%2FDraftMode&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/upload/route.ts":
/*!*************************************!*\
  !*** ./src/app/api/upload/route.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./src/lib/auth.ts\");\n/* harmony import */ var _lib_s3__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/s3 */ \"(rsc)/./src/lib/s3.ts\");\n\n\n\nasync function POST(request) {\n    try {\n        const user = (0,_lib_auth__WEBPACK_IMPORTED_MODULE_1__.requireAuth)(request);\n        const formData = await request.formData();\n        const file = formData.get(\"file\");\n        if (!file) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"No file provided\"\n            }, {\n                status: 400\n            });\n        }\n        // Validate file type (images only)\n        const allowedTypes = [\n            \"image/jpeg\",\n            \"image/png\",\n            \"image/gif\",\n            \"image/webp\"\n        ];\n        if (!allowedTypes.includes(file.type)) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Invalid file type. Only images are allowed.\"\n            }, {\n                status: 400\n            });\n        }\n        // Validate file size (max 5MB)\n        const maxSize = 5 * 1024 * 1024 // 5MB\n        ;\n        if (file.size > maxSize) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"File too large. Maximum size is 5MB.\"\n            }, {\n                status: 400\n            });\n        }\n        // Generate unique filename\n        const fileName = (0,_lib_s3__WEBPACK_IMPORTED_MODULE_2__.generateFileName)(file.name);\n        // Upload to S3\n        const imageUrl = await (0,_lib_s3__WEBPACK_IMPORTED_MODULE_2__.uploadFile)(file, fileName);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            url: imageUrl,\n            fileName,\n            size: file.size,\n            type: file.type\n        });\n    } catch (error) {\n        console.error(\"Upload error:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Upload failed\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS91cGxvYWQvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUF1RDtBQUNmO0FBQ2U7QUFFaEQsZUFBZUksS0FBS0MsT0FBb0I7SUFDN0MsSUFBSTtRQUNGLE1BQU1DLE9BQU9MLHNEQUFXQSxDQUFDSTtRQUV6QixNQUFNRSxXQUFXLE1BQU1GLFFBQVFFLFFBQVE7UUFDdkMsTUFBTUMsT0FBT0QsU0FBU0UsR0FBRyxDQUFDO1FBRTFCLElBQUksQ0FBQ0QsTUFBTTtZQUNULE9BQU9SLHFEQUFZQSxDQUFDVSxJQUFJLENBQ3RCO2dCQUFFQyxPQUFPO1lBQW1CLEdBQzVCO2dCQUFFQyxRQUFRO1lBQUk7UUFFbEI7UUFFQSxtQ0FBbUM7UUFDbkMsTUFBTUMsZUFBZTtZQUFDO1lBQWM7WUFBYTtZQUFhO1NBQWE7UUFDM0UsSUFBSSxDQUFDQSxhQUFhQyxRQUFRLENBQUNOLEtBQUtPLElBQUksR0FBRztZQUNyQyxPQUFPZixxREFBWUEsQ0FBQ1UsSUFBSSxDQUN0QjtnQkFBRUMsT0FBTztZQUE4QyxHQUN2RDtnQkFBRUMsUUFBUTtZQUFJO1FBRWxCO1FBRUEsK0JBQStCO1FBQy9CLE1BQU1JLFVBQVUsSUFBSSxPQUFPLEtBQUssTUFBTTs7UUFDdEMsSUFBSVIsS0FBS1MsSUFBSSxHQUFHRCxTQUFTO1lBQ3ZCLE9BQU9oQixxREFBWUEsQ0FBQ1UsSUFBSSxDQUN0QjtnQkFBRUMsT0FBTztZQUF1QyxHQUNoRDtnQkFBRUMsUUFBUTtZQUFJO1FBRWxCO1FBRUEsMkJBQTJCO1FBQzNCLE1BQU1NLFdBQVdmLHlEQUFnQkEsQ0FBQ0ssS0FBS1csSUFBSTtRQUUzQyxlQUFlO1FBQ2YsTUFBTUMsV0FBVyxNQUFNbEIsbURBQVVBLENBQUNNLE1BQU1VO1FBRXhDLE9BQU9sQixxREFBWUEsQ0FBQ1UsSUFBSSxDQUFDO1lBQ3ZCVyxLQUFLRDtZQUNMRjtZQUNBRCxNQUFNVCxLQUFLUyxJQUFJO1lBQ2ZGLE1BQU1QLEtBQUtPLElBQUk7UUFDakI7SUFDRixFQUFFLE9BQU9KLE9BQU87UUFDZFcsUUFBUVgsS0FBSyxDQUFDLGlCQUFpQkE7UUFDL0IsT0FBT1gscURBQVlBLENBQUNVLElBQUksQ0FDdEI7WUFBRUMsT0FBTztRQUFnQixHQUN6QjtZQUFFQyxRQUFRO1FBQUk7SUFFbEI7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL3NpbXBsZS1jbXMvLi9zcmMvYXBwL2FwaS91cGxvYWQvcm91dGUudHM/NTEyMiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVxdWVzdCwgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInXG5pbXBvcnQgeyByZXF1aXJlQXV0aCB9IGZyb20gJ0AvbGliL2F1dGgnXG5pbXBvcnQgeyB1cGxvYWRGaWxlLCBnZW5lcmF0ZUZpbGVOYW1lIH0gZnJvbSAnQC9saWIvczMnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XG4gIHRyeSB7XG4gICAgY29uc3QgdXNlciA9IHJlcXVpcmVBdXRoKHJlcXVlc3QpXG4gICAgXG4gICAgY29uc3QgZm9ybURhdGEgPSBhd2FpdCByZXF1ZXN0LmZvcm1EYXRhKClcbiAgICBjb25zdCBmaWxlID0gZm9ybURhdGEuZ2V0KCdmaWxlJykgYXMgRmlsZVxuICAgIFxuICAgIGlmICghZmlsZSkge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IGVycm9yOiAnTm8gZmlsZSBwcm92aWRlZCcgfSxcbiAgICAgICAgeyBzdGF0dXM6IDQwMCB9XG4gICAgICApXG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgZmlsZSB0eXBlIChpbWFnZXMgb25seSlcbiAgICBjb25zdCBhbGxvd2VkVHlwZXMgPSBbJ2ltYWdlL2pwZWcnLCAnaW1hZ2UvcG5nJywgJ2ltYWdlL2dpZicsICdpbWFnZS93ZWJwJ11cbiAgICBpZiAoIWFsbG93ZWRUeXBlcy5pbmNsdWRlcyhmaWxlLnR5cGUpKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgZXJyb3I6ICdJbnZhbGlkIGZpbGUgdHlwZS4gT25seSBpbWFnZXMgYXJlIGFsbG93ZWQuJyB9LFxuICAgICAgICB7IHN0YXR1czogNDAwIH1cbiAgICAgIClcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBmaWxlIHNpemUgKG1heCA1TUIpXG4gICAgY29uc3QgbWF4U2l6ZSA9IDUgKiAxMDI0ICogMTAyNCAvLyA1TUJcbiAgICBpZiAoZmlsZS5zaXplID4gbWF4U2l6ZSkge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IGVycm9yOiAnRmlsZSB0b28gbGFyZ2UuIE1heGltdW0gc2l6ZSBpcyA1TUIuJyB9LFxuICAgICAgICB7IHN0YXR1czogNDAwIH1cbiAgICAgIClcbiAgICB9XG5cbiAgICAvLyBHZW5lcmF0ZSB1bmlxdWUgZmlsZW5hbWVcbiAgICBjb25zdCBmaWxlTmFtZSA9IGdlbmVyYXRlRmlsZU5hbWUoZmlsZS5uYW1lKVxuICAgIFxuICAgIC8vIFVwbG9hZCB0byBTM1xuICAgIGNvbnN0IGltYWdlVXJsID0gYXdhaXQgdXBsb2FkRmlsZShmaWxlLCBmaWxlTmFtZSlcblxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7XG4gICAgICB1cmw6IGltYWdlVXJsLFxuICAgICAgZmlsZU5hbWUsXG4gICAgICBzaXplOiBmaWxlLnNpemUsXG4gICAgICB0eXBlOiBmaWxlLnR5cGUsXG4gICAgfSlcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdVcGxvYWQgZXJyb3I6JywgZXJyb3IpXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgeyBlcnJvcjogJ1VwbG9hZCBmYWlsZWQnIH0sXG4gICAgICB7IHN0YXR1czogNTAwIH1cbiAgICApXG4gIH1cbn0gIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsInJlcXVpcmVBdXRoIiwidXBsb2FkRmlsZSIsImdlbmVyYXRlRmlsZU5hbWUiLCJQT1NUIiwicmVxdWVzdCIsInVzZXIiLCJmb3JtRGF0YSIsImZpbGUiLCJnZXQiLCJqc29uIiwiZXJyb3IiLCJzdGF0dXMiLCJhbGxvd2VkVHlwZXMiLCJpbmNsdWRlcyIsInR5cGUiLCJtYXhTaXplIiwic2l6ZSIsImZpbGVOYW1lIiwibmFtZSIsImltYWdlVXJsIiwidXJsIiwiY29uc29sZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/upload/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/auth.ts":
/*!*************************!*\
  !*** ./src/lib/auth.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   generateToken: () => (/* binding */ generateToken),\n/* harmony export */   getUserFromRequest: () => (/* binding */ getUserFromRequest),\n/* harmony export */   hashPassword: () => (/* binding */ hashPassword),\n/* harmony export */   requireAdmin: () => (/* binding */ requireAdmin),\n/* harmony export */   requireAuth: () => (/* binding */ requireAuth),\n/* harmony export */   verifyPassword: () => (/* binding */ verifyPassword),\n/* harmony export */   verifyToken: () => (/* binding */ verifyToken)\n/* harmony export */ });\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jsonwebtoken */ \"(rsc)/./node_modules/jsonwebtoken/index.js\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jsonwebtoken__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst JWT_SECRET = \"your-super-secret-jwt-secret-key-for-local-development-123456789\" || 0;\nasync function hashPassword(password) {\n    return await bcryptjs__WEBPACK_IMPORTED_MODULE_0___default().hash(password, 12);\n}\nasync function verifyPassword(password, hashedPassword) {\n    return await bcryptjs__WEBPACK_IMPORTED_MODULE_0___default().compare(password, hashedPassword);\n}\nfunction generateToken(user) {\n    return jsonwebtoken__WEBPACK_IMPORTED_MODULE_1___default().sign({\n        id: user.id,\n        email: user.email,\n        name: user.name,\n        role: user.role\n    }, JWT_SECRET, {\n        expiresIn: \"7d\"\n    });\n}\nfunction verifyToken(token) {\n    try {\n        const decoded = jsonwebtoken__WEBPACK_IMPORTED_MODULE_1___default().verify(token, JWT_SECRET);\n        return decoded;\n    } catch (error) {\n        console.error(\"Token verification error:\", error);\n        return null;\n    }\n}\nfunction getUserFromRequest(request) {\n    const authHeader = request.headers.get(\"Authorization\");\n    if (!authHeader || !authHeader.startsWith(\"Bearer \")) {\n        return null;\n    }\n    const token = authHeader.substring(7);\n    return verifyToken(token);\n}\nfunction requireAuth(request) {\n    const user = getUserFromRequest(request);\n    if (!user) {\n        throw new Error(\"Unauthorized\");\n    }\n    return user;\n}\nfunction requireAdmin(request) {\n    const user = requireAuth(request);\n    if (user.role !== \"ADMIN\") {\n        throw new Error(\"Admin access required\");\n    }\n    return user;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL2F1dGgudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBNkI7QUFDQztBQVU5QixNQUFNRSxhQUFhQyxrRUFBMkIsSUFBSTtBQUUzQyxlQUFlRyxhQUFhQyxRQUFnQjtJQUNqRCxPQUFPLE1BQU1QLG9EQUFXLENBQUNPLFVBQVU7QUFDckM7QUFFTyxlQUFlRSxlQUFlRixRQUFnQixFQUFFRyxjQUFzQjtJQUMzRSxPQUFPLE1BQU1WLHVEQUFjLENBQUNPLFVBQVVHO0FBQ3hDO0FBRU8sU0FBU0UsY0FBY0MsSUFBVTtJQUN0QyxPQUFPWix3REFBUSxDQUNiO1FBQ0VjLElBQUlGLEtBQUtFLEVBQUU7UUFDWEMsT0FBT0gsS0FBS0csS0FBSztRQUNqQkMsTUFBTUosS0FBS0ksSUFBSTtRQUNmQyxNQUFNTCxLQUFLSyxJQUFJO0lBQ2pCLEdBQ0FoQixZQUNBO1FBQUVpQixXQUFXO0lBQUs7QUFFdEI7QUFFTyxTQUFTQyxZQUFZQyxLQUFhO0lBQ3ZDLElBQUk7UUFDRixNQUFNQyxVQUFVckIsMERBQVUsQ0FBQ29CLE9BQU9uQjtRQUNsQyxPQUFPb0I7SUFDVCxFQUFFLE9BQU9FLE9BQU87UUFDZEMsUUFBUUQsS0FBSyxDQUFDLDZCQUE2QkE7UUFDM0MsT0FBTztJQUNUO0FBQ0Y7QUFFTyxTQUFTRSxtQkFBbUJDLE9BQW9CO0lBQ3JELE1BQU1DLGFBQWFELFFBQVFFLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDO0lBQ3ZDLElBQUksQ0FBQ0YsY0FBYyxDQUFDQSxXQUFXRyxVQUFVLENBQUMsWUFBWTtRQUNwRCxPQUFPO0lBQ1Q7SUFFQSxNQUFNVixRQUFRTyxXQUFXSSxTQUFTLENBQUM7SUFDbkMsT0FBT1osWUFBWUM7QUFDckI7QUFFTyxTQUFTWSxZQUFZTixPQUFvQjtJQUM5QyxNQUFNZCxPQUFPYSxtQkFBbUJDO0lBQ2hDLElBQUksQ0FBQ2QsTUFBTTtRQUNULE1BQU0sSUFBSXFCLE1BQU07SUFDbEI7SUFDQSxPQUFPckI7QUFDVDtBQUVPLFNBQVNzQixhQUFhUixPQUFvQjtJQUMvQyxNQUFNZCxPQUFPb0IsWUFBWU47SUFDekIsSUFBSWQsS0FBS0ssSUFBSSxLQUFLLFNBQVM7UUFDekIsTUFBTSxJQUFJZ0IsTUFBTTtJQUNsQjtJQUNBLE9BQU9yQjtBQUNUIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc2ltcGxlLWNtcy8uL3NyYy9saWIvYXV0aC50cz82NjkyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBiY3J5cHQgZnJvbSAnYmNyeXB0anMnXG5pbXBvcnQgand0IGZyb20gJ2pzb253ZWJ0b2tlbidcbmltcG9ydCB7IE5leHRSZXF1ZXN0IH0gZnJvbSAnbmV4dC9zZXJ2ZXInXG5cbmV4cG9ydCBpbnRlcmZhY2UgVXNlciB7XG4gIGlkOiBzdHJpbmdcbiAgZW1haWw6IHN0cmluZ1xuICBuYW1lOiBzdHJpbmdcbiAgcm9sZTogJ0FETUlOJyB8ICdBVVRIT1InXG59XG5cbmNvbnN0IEpXVF9TRUNSRVQgPSBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQgfHwgJ3lvdXItZmFsbGJhY2stc2VjcmV0LWtleS1jaGFuZ2UtdGhpcy1pbi1wcm9kdWN0aW9uJ1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFzaFBhc3N3b3JkKHBhc3N3b3JkOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gYXdhaXQgYmNyeXB0Lmhhc2gocGFzc3dvcmQsIDEyKVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdmVyaWZ5UGFzc3dvcmQocGFzc3dvcmQ6IHN0cmluZywgaGFzaGVkUGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICByZXR1cm4gYXdhaXQgYmNyeXB0LmNvbXBhcmUocGFzc3dvcmQsIGhhc2hlZFBhc3N3b3JkKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVUb2tlbih1c2VyOiBVc2VyKTogc3RyaW5nIHtcbiAgcmV0dXJuIGp3dC5zaWduKFxuICAgIHsgXG4gICAgICBpZDogdXNlci5pZCwgXG4gICAgICBlbWFpbDogdXNlci5lbWFpbCwgXG4gICAgICBuYW1lOiB1c2VyLm5hbWUsIFxuICAgICAgcm9sZTogdXNlci5yb2xlIFxuICAgIH0sXG4gICAgSldUX1NFQ1JFVCxcbiAgICB7IGV4cGlyZXNJbjogJzdkJyB9XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZlcmlmeVRva2VuKHRva2VuOiBzdHJpbmcpOiBVc2VyIHwgbnVsbCB7XG4gIHRyeSB7XG4gICAgY29uc3QgZGVjb2RlZCA9IGp3dC52ZXJpZnkodG9rZW4sIEpXVF9TRUNSRVQpIGFzIFVzZXJcbiAgICByZXR1cm4gZGVjb2RlZFxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1Rva2VuIHZlcmlmaWNhdGlvbiBlcnJvcjonLCBlcnJvcilcbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRVc2VyRnJvbVJlcXVlc3QocmVxdWVzdDogTmV4dFJlcXVlc3QpOiBVc2VyIHwgbnVsbCB7XG4gIGNvbnN0IGF1dGhIZWFkZXIgPSByZXF1ZXN0LmhlYWRlcnMuZ2V0KCdBdXRob3JpemF0aW9uJylcbiAgaWYgKCFhdXRoSGVhZGVyIHx8ICFhdXRoSGVhZGVyLnN0YXJ0c1dpdGgoJ0JlYXJlciAnKSkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBjb25zdCB0b2tlbiA9IGF1dGhIZWFkZXIuc3Vic3RyaW5nKDcpXG4gIHJldHVybiB2ZXJpZnlUb2tlbih0b2tlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlcXVpcmVBdXRoKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KTogVXNlciB7XG4gIGNvbnN0IHVzZXIgPSBnZXRVc2VyRnJvbVJlcXVlc3QocmVxdWVzdClcbiAgaWYgKCF1c2VyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbmF1dGhvcml6ZWQnKVxuICB9XG4gIHJldHVybiB1c2VyXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXF1aXJlQWRtaW4ocmVxdWVzdDogTmV4dFJlcXVlc3QpOiBVc2VyIHtcbiAgY29uc3QgdXNlciA9IHJlcXVpcmVBdXRoKHJlcXVlc3QpXG4gIGlmICh1c2VyLnJvbGUgIT09ICdBRE1JTicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0FkbWluIGFjY2VzcyByZXF1aXJlZCcpXG4gIH1cbiAgcmV0dXJuIHVzZXJcbn0gIl0sIm5hbWVzIjpbImJjcnlwdCIsImp3dCIsIkpXVF9TRUNSRVQiLCJwcm9jZXNzIiwiZW52IiwiTkVYVEFVVEhfU0VDUkVUIiwiaGFzaFBhc3N3b3JkIiwicGFzc3dvcmQiLCJoYXNoIiwidmVyaWZ5UGFzc3dvcmQiLCJoYXNoZWRQYXNzd29yZCIsImNvbXBhcmUiLCJnZW5lcmF0ZVRva2VuIiwidXNlciIsInNpZ24iLCJpZCIsImVtYWlsIiwibmFtZSIsInJvbGUiLCJleHBpcmVzSW4iLCJ2ZXJpZnlUb2tlbiIsInRva2VuIiwiZGVjb2RlZCIsInZlcmlmeSIsImVycm9yIiwiY29uc29sZSIsImdldFVzZXJGcm9tUmVxdWVzdCIsInJlcXVlc3QiLCJhdXRoSGVhZGVyIiwiaGVhZGVycyIsImdldCIsInN0YXJ0c1dpdGgiLCJzdWJzdHJpbmciLCJyZXF1aXJlQXV0aCIsIkVycm9yIiwicmVxdWlyZUFkbWluIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./src/lib/s3.ts":
/*!***********************!*\
  !*** ./src/lib/s3.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   deleteFile: () => (/* binding */ deleteFile),\n/* harmony export */   generateFileName: () => (/* binding */ generateFileName),\n/* harmony export */   generateUploadUrl: () => (/* binding */ generateUploadUrl),\n/* harmony export */   uploadFile: () => (/* binding */ uploadFile)\n/* harmony export */ });\n/* harmony import */ var _aws_sdk_client_s3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @aws-sdk/client-s3 */ \"@aws-sdk/client-s3\");\n/* harmony import */ var _aws_sdk_client_s3__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_aws_sdk_client_s3__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _aws_sdk_s3_request_presigner__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @aws-sdk/s3-request-presigner */ \"(rsc)/./node_modules/@aws-sdk/s3-request-presigner/dist-es/index.js\");\n\n\nconst s3Client = new _aws_sdk_client_s3__WEBPACK_IMPORTED_MODULE_0__.S3Client({\n    region: process.env.AWS_REGION || \"us-east-1\",\n    credentials: {\n        accessKeyId: process.env.AWS_ACCESS_KEY_ID || \"\",\n        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || \"\"\n    }\n});\nconst uploadFile = async (file, key)=>{\n    const buffer = await file.arrayBuffer();\n    const command = new _aws_sdk_client_s3__WEBPACK_IMPORTED_MODULE_0__.PutObjectCommand({\n        Bucket: process.env.AWS_S3_BUCKET,\n        Key: key,\n        Body: new Uint8Array(buffer),\n        ContentType: file.type\n    });\n    await s3Client.send(command);\n    return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;\n};\nconst deleteFile = async (key)=>{\n    const command = new _aws_sdk_client_s3__WEBPACK_IMPORTED_MODULE_0__.DeleteObjectCommand({\n        Bucket: process.env.AWS_S3_BUCKET,\n        Key: key\n    });\n    await s3Client.send(command);\n};\nconst generateUploadUrl = async (key, contentType)=>{\n    const command = new _aws_sdk_client_s3__WEBPACK_IMPORTED_MODULE_0__.PutObjectCommand({\n        Bucket: process.env.AWS_S3_BUCKET,\n        Key: key,\n        ContentType: contentType\n    });\n    return await (0,_aws_sdk_s3_request_presigner__WEBPACK_IMPORTED_MODULE_1__.getSignedUrl)(s3Client, command, {\n        expiresIn: 3600\n    });\n};\nconst generateFileName = (originalName)=>{\n    const timestamp = Date.now();\n    const randomString = Math.random().toString(36).substring(2, 15);\n    const extension = originalName.split(\".\").pop();\n    return `uploads/${timestamp}-${randomString}.${extension}`;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvbGliL3MzLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBb0Y7QUFDeEI7QUFFNUQsTUFBTUksV0FBVyxJQUFJSix3REFBUUEsQ0FBQztJQUM1QkssUUFBUUMsUUFBUUMsR0FBRyxDQUFDQyxVQUFVLElBQUk7SUFDbENDLGFBQWE7UUFDWEMsYUFBYUosUUFBUUMsR0FBRyxDQUFDSSxpQkFBaUIsSUFBSTtRQUM5Q0MsaUJBQWlCTixRQUFRQyxHQUFHLENBQUNNLHFCQUFxQixJQUFJO0lBQ3hEO0FBQ0Y7QUFFTyxNQUFNQyxhQUFhLE9BQU9DLE1BQVlDO0lBQzNDLE1BQU1DLFNBQVMsTUFBTUYsS0FBS0csV0FBVztJQUVyQyxNQUFNQyxVQUFVLElBQUlsQixnRUFBZ0JBLENBQUM7UUFDbkNtQixRQUFRZCxRQUFRQyxHQUFHLENBQUNjLGFBQWE7UUFDakNDLEtBQUtOO1FBQ0xPLE1BQU0sSUFBSUMsV0FBV1A7UUFDckJRLGFBQWFWLEtBQUtXLElBQUk7SUFDeEI7SUFFQSxNQUFNdEIsU0FBU3VCLElBQUksQ0FBQ1I7SUFFcEIsT0FBTyxDQUFDLFFBQVEsRUFBRWIsUUFBUUMsR0FBRyxDQUFDYyxhQUFhLENBQUMsa0JBQWtCLEVBQUVMLElBQUksQ0FBQztBQUN2RSxFQUFDO0FBRU0sTUFBTVksYUFBYSxPQUFPWjtJQUMvQixNQUFNRyxVQUFVLElBQUlqQixtRUFBbUJBLENBQUM7UUFDdENrQixRQUFRZCxRQUFRQyxHQUFHLENBQUNjLGFBQWE7UUFDakNDLEtBQUtOO0lBQ1A7SUFFQSxNQUFNWixTQUFTdUIsSUFBSSxDQUFDUjtBQUN0QixFQUFDO0FBRU0sTUFBTVUsb0JBQW9CLE9BQU9iLEtBQWFjO0lBQ25ELE1BQU1YLFVBQVUsSUFBSWxCLGdFQUFnQkEsQ0FBQztRQUNuQ21CLFFBQVFkLFFBQVFDLEdBQUcsQ0FBQ2MsYUFBYTtRQUNqQ0MsS0FBS047UUFDTFMsYUFBYUs7SUFDZjtJQUVBLE9BQU8sTUFBTTNCLDJFQUFZQSxDQUFDQyxVQUFVZSxTQUFTO1FBQUVZLFdBQVc7SUFBSztBQUNqRSxFQUFDO0FBRU0sTUFBTUMsbUJBQW1CLENBQUNDO0lBQy9CLE1BQU1DLFlBQVlDLEtBQUtDLEdBQUc7SUFDMUIsTUFBTUMsZUFBZUMsS0FBS0MsTUFBTSxHQUFHQyxRQUFRLENBQUMsSUFBSUMsU0FBUyxDQUFDLEdBQUc7SUFDN0QsTUFBTUMsWUFBWVQsYUFBYVUsS0FBSyxDQUFDLEtBQUtDLEdBQUc7SUFDN0MsT0FBTyxDQUFDLFFBQVEsRUFBRVYsVUFBVSxDQUFDLEVBQUVHLGFBQWEsQ0FBQyxFQUFFSyxVQUFVLENBQUM7QUFDNUQsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3NpbXBsZS1jbXMvLi9zcmMvbGliL3MzLnRzPzliM2YiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUzNDbGllbnQsIFB1dE9iamVjdENvbW1hbmQsIERlbGV0ZU9iamVjdENvbW1hbmQgfSBmcm9tICdAYXdzLXNkay9jbGllbnQtczMnXG5pbXBvcnQgeyBnZXRTaWduZWRVcmwgfSBmcm9tICdAYXdzLXNkay9zMy1yZXF1ZXN0LXByZXNpZ25lcidcblxuY29uc3QgczNDbGllbnQgPSBuZXcgUzNDbGllbnQoe1xuICByZWdpb246IHByb2Nlc3MuZW52LkFXU19SRUdJT04gfHwgJ3VzLWVhc3QtMScsXG4gIGNyZWRlbnRpYWxzOiB7XG4gICAgYWNjZXNzS2V5SWQ6IHByb2Nlc3MuZW52LkFXU19BQ0NFU1NfS0VZX0lEIHx8ICcnLFxuICAgIHNlY3JldEFjY2Vzc0tleTogcHJvY2Vzcy5lbnYuQVdTX1NFQ1JFVF9BQ0NFU1NfS0VZIHx8ICcnLFxuICB9LFxufSlcblxuZXhwb3J0IGNvbnN0IHVwbG9hZEZpbGUgPSBhc3luYyAoZmlsZTogRmlsZSwga2V5OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICBjb25zdCBidWZmZXIgPSBhd2FpdCBmaWxlLmFycmF5QnVmZmVyKClcbiAgXG4gIGNvbnN0IGNvbW1hbmQgPSBuZXcgUHV0T2JqZWN0Q29tbWFuZCh7XG4gICAgQnVja2V0OiBwcm9jZXNzLmVudi5BV1NfUzNfQlVDS0VULFxuICAgIEtleToga2V5LFxuICAgIEJvZHk6IG5ldyBVaW50OEFycmF5KGJ1ZmZlciksXG4gICAgQ29udGVudFR5cGU6IGZpbGUudHlwZSxcbiAgfSlcblxuICBhd2FpdCBzM0NsaWVudC5zZW5kKGNvbW1hbmQpXG4gIFxuICByZXR1cm4gYGh0dHBzOi8vJHtwcm9jZXNzLmVudi5BV1NfUzNfQlVDS0VUfS5zMy5hbWF6b25hd3MuY29tLyR7a2V5fWBcbn1cblxuZXhwb3J0IGNvbnN0IGRlbGV0ZUZpbGUgPSBhc3luYyAoa2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgY29uc3QgY29tbWFuZCA9IG5ldyBEZWxldGVPYmplY3RDb21tYW5kKHtcbiAgICBCdWNrZXQ6IHByb2Nlc3MuZW52LkFXU19TM19CVUNLRVQsXG4gICAgS2V5OiBrZXksXG4gIH0pXG5cbiAgYXdhaXQgczNDbGllbnQuc2VuZChjb21tYW5kKVxufVxuXG5leHBvcnQgY29uc3QgZ2VuZXJhdGVVcGxvYWRVcmwgPSBhc3luYyAoa2V5OiBzdHJpbmcsIGNvbnRlbnRUeXBlOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICBjb25zdCBjb21tYW5kID0gbmV3IFB1dE9iamVjdENvbW1hbmQoe1xuICAgIEJ1Y2tldDogcHJvY2Vzcy5lbnYuQVdTX1MzX0JVQ0tFVCxcbiAgICBLZXk6IGtleSxcbiAgICBDb250ZW50VHlwZTogY29udGVudFR5cGUsXG4gIH0pXG5cbiAgcmV0dXJuIGF3YWl0IGdldFNpZ25lZFVybChzM0NsaWVudCwgY29tbWFuZCwgeyBleHBpcmVzSW46IDM2MDAgfSlcbn1cblxuZXhwb3J0IGNvbnN0IGdlbmVyYXRlRmlsZU5hbWUgPSAob3JpZ2luYWxOYW1lOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICBjb25zdCB0aW1lc3RhbXAgPSBEYXRlLm5vdygpXG4gIGNvbnN0IHJhbmRvbVN0cmluZyA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCAxNSlcbiAgY29uc3QgZXh0ZW5zaW9uID0gb3JpZ2luYWxOYW1lLnNwbGl0KCcuJykucG9wKClcbiAgcmV0dXJuIGB1cGxvYWRzLyR7dGltZXN0YW1wfS0ke3JhbmRvbVN0cmluZ30uJHtleHRlbnNpb259YFxufSAiXSwibmFtZXMiOlsiUzNDbGllbnQiLCJQdXRPYmplY3RDb21tYW5kIiwiRGVsZXRlT2JqZWN0Q29tbWFuZCIsImdldFNpZ25lZFVybCIsInMzQ2xpZW50IiwicmVnaW9uIiwicHJvY2VzcyIsImVudiIsIkFXU19SRUdJT04iLCJjcmVkZW50aWFscyIsImFjY2Vzc0tleUlkIiwiQVdTX0FDQ0VTU19LRVlfSUQiLCJzZWNyZXRBY2Nlc3NLZXkiLCJBV1NfU0VDUkVUX0FDQ0VTU19LRVkiLCJ1cGxvYWRGaWxlIiwiZmlsZSIsImtleSIsImJ1ZmZlciIsImFycmF5QnVmZmVyIiwiY29tbWFuZCIsIkJ1Y2tldCIsIkFXU19TM19CVUNLRVQiLCJLZXkiLCJCb2R5IiwiVWludDhBcnJheSIsIkNvbnRlbnRUeXBlIiwidHlwZSIsInNlbmQiLCJkZWxldGVGaWxlIiwiZ2VuZXJhdGVVcGxvYWRVcmwiLCJjb250ZW50VHlwZSIsImV4cGlyZXNJbiIsImdlbmVyYXRlRmlsZU5hbWUiLCJvcmlnaW5hbE5hbWUiLCJ0aW1lc3RhbXAiLCJEYXRlIiwibm93IiwicmFuZG9tU3RyaW5nIiwiTWF0aCIsInJhbmRvbSIsInRvU3RyaW5nIiwic3Vic3RyaW5nIiwiZXh0ZW5zaW9uIiwic3BsaXQiLCJwb3AiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/lib/s3.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/semver","vendor-chunks/bcryptjs","vendor-chunks/jsonwebtoken","vendor-chunks/lodash.includes","vendor-chunks/jws","vendor-chunks/lodash.once","vendor-chunks/jwa","vendor-chunks/lodash.isinteger","vendor-chunks/ecdsa-sig-formatter","vendor-chunks/lodash.isplainobject","vendor-chunks/ms","vendor-chunks/lodash.isstring","vendor-chunks/lodash.isnumber","vendor-chunks/lodash.isboolean","vendor-chunks/safe-buffer","vendor-chunks/buffer-equal-constant-time","vendor-chunks/@smithy","vendor-chunks/@aws-sdk"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fupload%2Froute&page=%2Fapi%2Fupload%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fupload%2Froute.ts&appDir=%2Fhome%2Fsushma%2FDocuments%2FDraftMode%2Fsrc%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fsushma%2FDocuments%2FDraftMode&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();