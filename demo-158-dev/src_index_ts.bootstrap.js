"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkcreate_wasm_app"] = self["webpackChunkcreate_wasm_app"] || []).push([["src_index_ts"],{

/***/ "../pkg/demo_158.js":
/*!**************************!*\
  !*** ../pkg/demo_158.js ***!
  \**************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   NARS: () => (/* reexport safe */ _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.NARS),\n/* harmony export */   __wbg_error_f851667af71bcfc6: () => (/* reexport safe */ _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbg_error_f851667af71bcfc6),\n/* harmony export */   __wbg_new_abda76e883ba8a5f: () => (/* reexport safe */ _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbg_new_abda76e883ba8a5f),\n/* harmony export */   __wbg_set_wasm: () => (/* reexport safe */ _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbg_set_wasm),\n/* harmony export */   __wbg_stack_658279fe44541cf6: () => (/* reexport safe */ _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbg_stack_658279fe44541cf6),\n/* harmony export */   __wbindgen_object_drop_ref: () => (/* reexport safe */ _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_object_drop_ref),\n/* harmony export */   __wbindgen_string_new: () => (/* reexport safe */ _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_string_new),\n/* harmony export */   __wbindgen_throw: () => (/* reexport safe */ _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_throw)\n/* harmony export */ });\n/* harmony import */ var _demo_158_bg_wasm__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./demo_158_bg.wasm */ \"../pkg/demo_158_bg.wasm\");\n/* harmony import */ var _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./demo_158_bg.js */ \"../pkg/demo_158_bg.js\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_demo_158_bg_wasm__WEBPACK_IMPORTED_MODULE_1__]);\n_demo_158_bg_wasm__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n(0,_demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbg_set_wasm)(_demo_158_bg_wasm__WEBPACK_IMPORTED_MODULE_1__);\n\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });\n\n//# sourceURL=webpack://create-wasm-app/../pkg/demo_158.js?");

/***/ }),

/***/ "../pkg/demo_158_bg.js":
/*!*****************************!*\
  !*** ../pkg/demo_158_bg.js ***!
  \*****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   NARS: () => (/* binding */ NARS),\n/* harmony export */   __wbg_error_f851667af71bcfc6: () => (/* binding */ __wbg_error_f851667af71bcfc6),\n/* harmony export */   __wbg_new_abda76e883ba8a5f: () => (/* binding */ __wbg_new_abda76e883ba8a5f),\n/* harmony export */   __wbg_set_wasm: () => (/* binding */ __wbg_set_wasm),\n/* harmony export */   __wbg_stack_658279fe44541cf6: () => (/* binding */ __wbg_stack_658279fe44541cf6),\n/* harmony export */   __wbindgen_object_drop_ref: () => (/* binding */ __wbindgen_object_drop_ref),\n/* harmony export */   __wbindgen_string_new: () => (/* binding */ __wbindgen_string_new),\n/* harmony export */   __wbindgen_throw: () => (/* binding */ __wbindgen_throw)\n/* harmony export */ });\n/* module decorator */ module = __webpack_require__.hmd(module);\nlet wasm;\nfunction __wbg_set_wasm(val) {\n    wasm = val;\n}\n\n\nconst lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;\n\nlet cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });\n\ncachedTextDecoder.decode();\n\nlet cachedUint8Memory0 = null;\n\nfunction getUint8Memory0() {\n    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {\n        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);\n    }\n    return cachedUint8Memory0;\n}\n\nfunction getStringFromWasm0(ptr, len) {\n    ptr = ptr >>> 0;\n    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));\n}\n\nconst heap = new Array(128).fill(undefined);\n\nheap.push(undefined, null, true, false);\n\nlet heap_next = heap.length;\n\nfunction addHeapObject(obj) {\n    if (heap_next === heap.length) heap.push(heap.length + 1);\n    const idx = heap_next;\n    heap_next = heap[idx];\n\n    heap[idx] = obj;\n    return idx;\n}\n\nfunction getObject(idx) { return heap[idx]; }\n\nfunction dropObject(idx) {\n    if (idx < 132) return;\n    heap[idx] = heap_next;\n    heap_next = idx;\n}\n\nfunction takeObject(idx) {\n    const ret = getObject(idx);\n    dropObject(idx);\n    return ret;\n}\n\nlet cachedInt32Memory0 = null;\n\nfunction getInt32Memory0() {\n    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {\n        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);\n    }\n    return cachedInt32Memory0;\n}\n\nlet WASM_VECTOR_LEN = 0;\n\nconst lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;\n\nlet cachedTextEncoder = new lTextEncoder('utf-8');\n\nconst encodeString = (typeof cachedTextEncoder.encodeInto === 'function'\n    ? function (arg, view) {\n    return cachedTextEncoder.encodeInto(arg, view);\n}\n    : function (arg, view) {\n    const buf = cachedTextEncoder.encode(arg);\n    view.set(buf);\n    return {\n        read: arg.length,\n        written: buf.length\n    };\n});\n\nfunction passStringToWasm0(arg, malloc, realloc) {\n\n    if (realloc === undefined) {\n        const buf = cachedTextEncoder.encode(arg);\n        const ptr = malloc(buf.length, 1) >>> 0;\n        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);\n        WASM_VECTOR_LEN = buf.length;\n        return ptr;\n    }\n\n    let len = arg.length;\n    let ptr = malloc(len, 1) >>> 0;\n\n    const mem = getUint8Memory0();\n\n    let offset = 0;\n\n    for (; offset < len; offset++) {\n        const code = arg.charCodeAt(offset);\n        if (code > 0x7F) break;\n        mem[ptr + offset] = code;\n    }\n\n    if (offset !== len) {\n        if (offset !== 0) {\n            arg = arg.slice(offset);\n        }\n        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;\n        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);\n        const ret = encodeString(arg, view);\n\n        offset += ret.written;\n        ptr = realloc(ptr, len, offset, 1) >>> 0;\n    }\n\n    WASM_VECTOR_LEN = offset;\n    return ptr;\n}\n\nlet cachedUint32Memory0 = null;\n\nfunction getUint32Memory0() {\n    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {\n        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);\n    }\n    return cachedUint32Memory0;\n}\n\nfunction getArrayJsValueFromWasm0(ptr, len) {\n    ptr = ptr >>> 0;\n    const mem = getUint32Memory0();\n    const slice = mem.subarray(ptr / 4, ptr / 4 + len);\n    const result = [];\n    for (let i = 0; i < slice.length; i++) {\n        result.push(takeObject(slice[i]));\n    }\n    return result;\n}\n\nconst NARSFinalization = (typeof FinalizationRegistry === 'undefined')\n    ? { register: () => {}, unregister: () => {} }\n    : new FinalizationRegistry(ptr => wasm.__wbg_nars_free(ptr >>> 0));\n/**\n* 封装一个「运行时」对象\n*/\nclass NARS {\n\n    __destroy_into_raw() {\n        const ptr = this.__wbg_ptr;\n        this.__wbg_ptr = 0;\n        NARSFinalization.unregister(this);\n        return ptr;\n    }\n\n    free() {\n        const ptr = this.__destroy_into_raw();\n        wasm.__wbg_nars_free(ptr);\n    }\n    /**\n    */\n    constructor() {\n        try {\n            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);\n            wasm.nars_new(retptr);\n            var r0 = getInt32Memory0()[retptr / 4 + 0];\n            var r1 = getInt32Memory0()[retptr / 4 + 1];\n            var r2 = getInt32Memory0()[retptr / 4 + 2];\n            if (r2) {\n                throw takeObject(r1);\n            }\n            this.__wbg_ptr = r0 >>> 0;\n            return this;\n        } finally {\n            wasm.__wbindgen_add_to_stack_pointer(16);\n        }\n    }\n    /**\n    * @param {string} input\n    */\n    input(input) {\n        try {\n            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);\n            const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);\n            const len0 = WASM_VECTOR_LEN;\n            wasm.nars_input(retptr, this.__wbg_ptr, ptr0, len0);\n            var r0 = getInt32Memory0()[retptr / 4 + 0];\n            var r1 = getInt32Memory0()[retptr / 4 + 1];\n            if (r1) {\n                throw takeObject(r0);\n            }\n        } finally {\n            wasm.__wbindgen_add_to_stack_pointer(16);\n        }\n    }\n    /**\n    * 拉取输出\n    * @returns {(string)[]}\n    */\n    fetch() {\n        try {\n            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);\n            wasm.nars_fetch(retptr, this.__wbg_ptr);\n            var r0 = getInt32Memory0()[retptr / 4 + 0];\n            var r1 = getInt32Memory0()[retptr / 4 + 1];\n            var r2 = getInt32Memory0()[retptr / 4 + 2];\n            var r3 = getInt32Memory0()[retptr / 4 + 3];\n            if (r3) {\n                throw takeObject(r2);\n            }\n            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();\n            wasm.__wbindgen_free(r0, r1 * 4, 4);\n            return v1;\n        } finally {\n            wasm.__wbindgen_add_to_stack_pointer(16);\n        }\n    }\n}\n\nfunction __wbindgen_string_new(arg0, arg1) {\n    const ret = getStringFromWasm0(arg0, arg1);\n    return addHeapObject(ret);\n};\n\nfunction __wbg_new_abda76e883ba8a5f() {\n    const ret = new Error();\n    return addHeapObject(ret);\n};\n\nfunction __wbg_stack_658279fe44541cf6(arg0, arg1) {\n    const ret = getObject(arg1).stack;\n    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);\n    const len1 = WASM_VECTOR_LEN;\n    getInt32Memory0()[arg0 / 4 + 1] = len1;\n    getInt32Memory0()[arg0 / 4 + 0] = ptr1;\n};\n\nfunction __wbg_error_f851667af71bcfc6(arg0, arg1) {\n    let deferred0_0;\n    let deferred0_1;\n    try {\n        deferred0_0 = arg0;\n        deferred0_1 = arg1;\n        console.error(getStringFromWasm0(arg0, arg1));\n    } finally {\n        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);\n    }\n};\n\nfunction __wbindgen_object_drop_ref(arg0) {\n    takeObject(arg0);\n};\n\nfunction __wbindgen_throw(arg0, arg1) {\n    throw new Error(getStringFromWasm0(arg0, arg1));\n};\n\n\n\n//# sourceURL=webpack://create-wasm-app/../pkg/demo_158_bg.js?");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var demo_158__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! demo_158 */ \"../pkg/demo_158.js\");\n/* harmony import */ var _styles__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./styles */ \"./src/styles.ts\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([demo_158__WEBPACK_IMPORTED_MODULE_0__]);\ndemo_158__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n(0,_styles__WEBPACK_IMPORTED_MODULE_1__.applyStyle)();\n// import * as css_reset from \"./css/css-reset.css\";\n// import * as css from \"./css/style.css\";\n// css // ! ❌找不到模块“./css/style.css”或其相应的类型声明。ts(2307)\n// css_reset\n//mutWriteLines gets deleted and reassigned\nlet mutWriteLines = document.getElementById(\"write-lines\");\nlet historyIdx = 0;\nlet tempInput = \"\";\nlet userInput;\nconst USER_INPUT = document.getElementById(\"user-input\");\nconst PROMPT = document.getElementById(\"prompt\");\nconst HISTORY = [];\nconst COMMANDS = ['nse', 'cyc', 'res'];\nconst BANNER = `\r\n==== demo 158 ====\r\nFor testing the NAR core, you can type these commends for example:\r\n<span class='command'>nse</span> [Narsese]\r\n<span class='command'>cyc</span> [cycle steps]\r\n<span class='command'>vol</span> [output volume 0~100]\r\n<span class='command'>res</span> [reason of resetting reasoner]\r\n...\r\n<br>\r\n`;\n// * NARS\nconst NAR = new demo_158__WEBPACK_IMPORTED_MODULE_0__.NARS();\n// console.log(NAR)\nconst scrollToBottom = () => {\n    const MAIN = document.getElementById(\"main\");\n    if (!MAIN)\n        return;\n    MAIN.scrollTop = MAIN.scrollHeight;\n};\nfunction userInputHandler(e) {\n    const key = e.key;\n    switch (key) {\n        case \"Enter\":\n            e.preventDefault();\n            enterKey();\n            scrollToBottom();\n            break;\n        case \"Escape\":\n            USER_INPUT.value = \"\";\n            break;\n        case \"ArrowUp\":\n            arrowKeys(key);\n            e.preventDefault();\n            break;\n        case \"ArrowDown\":\n            arrowKeys(key);\n            break;\n        case \"Tab\":\n            tabKey();\n            e.preventDefault();\n            break;\n    }\n}\nfunction enterKey() {\n    if (!mutWriteLines || !PROMPT)\n        return;\n    const resetInput = \"\";\n    userInput = USER_INPUT.value;\n    let newUserInput = document.createElement(\"span\");\n    newUserInput.setAttribute(\"class\", \"output\");\n    newUserInput.innerText = userInput;\n    HISTORY.push(userInput);\n    historyIdx = HISTORY.length;\n    //if clear then early return\n    if (userInput === 'clear') {\n        commandHandler(userInput.toLowerCase().trim());\n        USER_INPUT.value = resetInput;\n        userInput = resetInput;\n        return;\n    }\n    const div = document.createElement(\"div\");\n    div.innerHTML = `<span id=\"prompt\">${PROMPT.innerHTML}</span> ${newUserInput.innerHTML}`;\n    if (mutWriteLines.parentNode) {\n        mutWriteLines.parentNode.insertBefore(div, mutWriteLines);\n    }\n    /*\n    if input is empty or a collection of spaces,\n    just insert a prompt before #write-lines\n    */\n    if (userInput.trim().length !== 0) {\n        commandHandler(userInput.trim());\n    }\n    USER_INPUT.value = resetInput;\n    userInput = resetInput;\n}\nfunction tabKey() {\n    let currInput = USER_INPUT.value;\n    for (const ele of COMMANDS) {\n        if (ele.startsWith(currInput) && ele != currInput) {\n            USER_INPUT.value = ele;\n            return;\n        }\n    }\n    for (const his of HISTORY) {\n        if (his.startsWith(currInput) && his != currInput) {\n            USER_INPUT.value = his;\n            return;\n        }\n    }\n}\nfunction arrowKeys(e) {\n    switch (e) {\n        case \"ArrowDown\":\n            if (historyIdx !== HISTORY.length) {\n                historyIdx += 1;\n                USER_INPUT.value = HISTORY[historyIdx];\n                if (historyIdx === HISTORY.length)\n                    USER_INPUT.value = tempInput;\n            }\n            break;\n        case \"ArrowUp\":\n            if (historyIdx === HISTORY.length)\n                tempInput = USER_INPUT.value;\n            if (historyIdx !== 0) {\n                historyIdx -= 1;\n                USER_INPUT.value = HISTORY[historyIdx];\n            }\n            break;\n    }\n}\nfunction commandHandler(input) {\n    console.log(input);\n    try {\n        NAR.input(input);\n    }\n    catch (error) {\n        console.error(error);\n        writeLines([`[ERROR] ${error}`], true);\n    }\n    try {\n        const outputs = NAR.fetch();\n        for (const output of outputs) {\n            console.log(output);\n        }\n        writeLines(outputs, true);\n    }\n    catch (error) {\n        console.error(error);\n        writeLines([`[ERROR] ${error}`], true);\n    }\n}\nfunction writeLines(message, rawMode = false) {\n    message.forEach((item, idx) => {\n        displayText(item, idx, rawMode);\n    });\n}\nfunction displayText(item, idx, rawMode = false) {\n    setTimeout(() => {\n        if (!mutWriteLines)\n            return;\n        const p = document.createElement(\"p\");\n        if (rawMode)\n            p.innerText = item;\n        else\n            p.innerHTML = item;\n        mutWriteLines.parentNode.insertBefore(p, mutWriteLines);\n        scrollToBottom();\n    }, 40 * idx);\n}\nconst initEventListeners = () => {\n    // banner\n    window.addEventListener('load', () => {\n        writeLines(BANNER.split('\\n').map(x => x.trim()).filter(x => x.length > 0));\n    });\n    USER_INPUT.addEventListener('keypress', userInputHandler);\n    USER_INPUT.addEventListener('keydown', userInputHandler);\n    window.addEventListener('click', () => {\n        USER_INPUT.focus();\n    });\n};\ninitEventListeners();\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });\n\n//# sourceURL=webpack://create-wasm-app/./src/index.ts?");

/***/ }),

/***/ "./src/styles.ts":
/*!***********************!*\
  !*** ./src/styles.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   applyStyle: () => (/* binding */ applyStyle)\n/* harmony export */ });\n/* harmony import */ var _config_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config.json */ \"./config.json\");\n\nfunction applyStyle() {\n    const style = document.createElement('style');\n    const head = document.head;\n    const background = `body {background: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.background}}`;\n    const foreground = `body {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.foreground}}`;\n    const inputBackground = `input {background: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.background}}`;\n    const inputForeground = `input {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.prompt.input}}`;\n    const outputColor = `.output {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.prompt.input}}`;\n    const preHost = `#pre-host {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.prompt.host}}`;\n    const host = `#host {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.prompt.host}}`;\n    const preUser = `#pre-user {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.prompt.user}}`;\n    const user = `#user {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.prompt.user}}`;\n    const prompt = `#prompt {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.prompt[\"default\"]}}`;\n    const banner = `pre {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.banner}}`;\n    const link = `a {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.link.text}}`;\n    const linkHighlight = `a:hover {background: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.link.highlightColor}}`;\n    const linkTextHighlight = `a:hover {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.link.highlightText}}`;\n    const commandHighlight = `.command {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.commands.textColor}}`;\n    const keys = `.keys {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.banner}}`;\n    head.appendChild(style);\n    if (!style.sheet)\n        return;\n    if (!_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.border.visible) {\n        style.sheet.insertRule(\"#bars {display: none}\");\n        style.sheet.insertRule(\"main {border: none}\");\n    }\n    else {\n        style.sheet.insertRule(`#bars {background: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.background}}`);\n        style.sheet.insertRule(`main {border-color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.border.color}}`);\n        style.sheet.insertRule(`#bar-1 {background: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.border.color}; color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.background}}`);\n        style.sheet.insertRule(`#bar-2 {background: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.border.color}}`);\n        style.sheet.insertRule(`#bar-3 {background: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.border.color}}`);\n        style.sheet.insertRule(`#bar-4 {background: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.border.color}}`);\n        style.sheet.insertRule(`#bar-5 {background: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.border.color}}`);\n    }\n    style.sheet.insertRule(background);\n    style.sheet.insertRule(foreground);\n    style.sheet.insertRule(inputBackground);\n    style.sheet.insertRule(inputForeground);\n    style.sheet.insertRule(outputColor);\n    style.sheet.insertRule(preHost);\n    style.sheet.insertRule(host);\n    style.sheet.insertRule(preUser);\n    style.sheet.insertRule(user);\n    style.sheet.insertRule(prompt);\n    style.sheet.insertRule(banner);\n    style.sheet.insertRule(link);\n    style.sheet.insertRule(linkHighlight);\n    style.sheet.insertRule(linkTextHighlight);\n    style.sheet.insertRule(commandHighlight);\n    style.sheet.insertRule(keys);\n}\n\n\n//# sourceURL=webpack://create-wasm-app/./src/styles.ts?");

/***/ }),

/***/ "./config.json":
/*!*********************!*\
  !*** ./config.json ***!
  \*********************/
/***/ ((module) => {

eval("module.exports = /*#__PURE__*/JSON.parse('{\"title\":\"demo-158\",\"colors\":{\"background\":\"#000000\",\"foreground\":\"#FFFFFF\",\"banner\":\"#FFFFFF\",\"border\":{\"visible\":true,\"color\":\"#FFFFFF\"},\"prompt\":{\"default\":\"#ABCDEF\",\"user\":\"#ABCDEF\",\"host\":\"#FF70FD\",\"input\":\"#FFFFFF\"},\"link\":{\"text\":\"#EEAAB6\",\"highlightColor\":\"#E2ADFF\",\"highlightText\":\"#0C0623\"},\"commands\":{\"textColor\":\"#DB9BFD\"}}}');\n\n//# sourceURL=webpack://create-wasm-app/./config.json?");

/***/ }),

/***/ "../pkg/demo_158_bg.wasm":
/*!*******************************!*\
  !*** ../pkg/demo_158_bg.wasm ***!
  \*******************************/
/***/ ((module, exports, __webpack_require__) => {

eval("/* harmony import */ var WEBPACK_IMPORTED_MODULE_0 = __webpack_require__(/*! ./demo_158_bg.js */ \"../pkg/demo_158_bg.js\");\nmodule.exports = __webpack_require__.v(exports, module.id, \"577b466690d49da90368\", {\n\t\"./demo_158_bg.js\": {\n\t\t\"__wbindgen_string_new\": WEBPACK_IMPORTED_MODULE_0.__wbindgen_string_new,\n\t\t\"__wbg_new_abda76e883ba8a5f\": WEBPACK_IMPORTED_MODULE_0.__wbg_new_abda76e883ba8a5f,\n\t\t\"__wbg_stack_658279fe44541cf6\": WEBPACK_IMPORTED_MODULE_0.__wbg_stack_658279fe44541cf6,\n\t\t\"__wbg_error_f851667af71bcfc6\": WEBPACK_IMPORTED_MODULE_0.__wbg_error_f851667af71bcfc6,\n\t\t\"__wbindgen_object_drop_ref\": WEBPACK_IMPORTED_MODULE_0.__wbindgen_object_drop_ref,\n\t\t\"__wbindgen_throw\": WEBPACK_IMPORTED_MODULE_0.__wbindgen_throw\n\t}\n});\n\n//# sourceURL=webpack://create-wasm-app/../pkg/demo_158_bg.wasm?");

/***/ })

}]);