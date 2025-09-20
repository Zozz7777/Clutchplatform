#!/usr/bin/env node/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 317:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ 896:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 928:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};


const { spawn } = __nccwpck_require__(317);
const path = __nccwpck_require__(928);
const fs = __nccwpck_require__(896);

console.log('🚀 Clutch Auto Parts System');
console.log('============================');
console.log('');

// Get the directory where this executable is located
const appDir = path.dirname(process.execPath);

try {
    // Check if dist directory exists
    const distPath = path.join(appDir, 'dist');
    if (!fs.existsSync(distPath)) {
        console.error('❌ ERROR: Application not built!');
        console.error('Please run "npm run build" first.');
        process.exit(1);
    }
    
    // Check if node_modules exists
    const nodeModulesPath = path.join(appDir, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
        console.error('❌ ERROR: Dependencies not installed!');
        console.error('Please run "npm install" first.');
        process.exit(1);
    }
    
    console.log('🚀 Starting Clutch Auto Parts System...');
    console.log('The application will open in a new window.');
    console.log('');
    
    // Start the Electron app directly
    const electronPath = path.join(nodeModulesPath, '.bin', 'electron.cmd');
    const mainPath = path.join(distPath, 'main.js');
    
    if (!fs.existsSync(electronPath)) {
        console.error('❌ ERROR: Electron not found!');
        console.error('Please run "npm install" to install dependencies.');
        process.exit(1);
    }
    
    if (!fs.existsSync(mainPath)) {
        console.error('❌ ERROR: Main application file not found!');
        console.error('Please run "npm run build" to build the application.');
        process.exit(1);
    }
    
    const startProcess = spawn(electronPath, [mainPath], {
        cwd: appDir,
        stdio: 'inherit',
        shell: true
    });
    
    startProcess.on('close', (code) => {
        if (code !== 0) {
            console.error('❌ Application exited with error code:', code);
        } else {
            console.log('✅ Application closed successfully');
        }
    });
    
    startProcess.on('error', (error) => {
        console.error('❌ ERROR starting application:', error.message);
        process.exit(1);
    });

} catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
}

module.exports = __webpack_exports__;
/******/ })()
;