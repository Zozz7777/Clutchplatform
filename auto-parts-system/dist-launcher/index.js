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
const packageJsonPath = path.join(appDir, 'package.json');

// Check if we're in the right directory
if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ ERROR: package.json not found!');
    console.error('Please run this executable from the Clutch Auto Parts System directory.');
    process.exit(1);
}

try {
    // Check if node_modules exists
    const nodeModulesPath = path.join(appDir, 'node_modules');
    const distPath = path.join(appDir, 'dist');
    
    if (!fs.existsSync(nodeModulesPath)) {
        console.log('📦 Installing dependencies...');
        const installProcess = spawn('npm', ['install'], {
            cwd: appDir,
            stdio: 'inherit',
            shell: true
        });
        
        installProcess.on('close', (code) => {
            if (code !== 0) {
                console.error('❌ ERROR: Failed to install dependencies');
                process.exit(1);
            }
            buildAndStart();
        });
    } else {
        buildAndStart();
    }
    
    function buildAndStart() {
        // Check if dist exists and is recent
        if (!fs.existsSync(distPath)) {
            console.log('🔨 Building application...');
            const buildProcess = spawn('npm', ['run', 'build'], {
                cwd: appDir,
                stdio: 'inherit',
                shell: true
            });
            
            buildProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error('❌ ERROR: Failed to build application');
                    process.exit(1);
                }
                startApp();
            });
        } else {
            startApp();
        }
    }
    
    function startApp() {
        console.log('🚀 Starting Clutch Auto Parts System...');
        console.log('The application will open in a new window.');
        console.log('');
        
        const startProcess = spawn('npm', ['start'], {
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
    }

} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Please make sure Node.js is installed and try again.');
    process.exit(1);
}

module.exports = __webpack_exports__;
/******/ })()
;