"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunknarust_wasm_demo"] = self["webpackChunknarust_wasm_demo"] || []).push([["src_index_ts"],{

/***/ "../pkg/demo_158.js":
/*!**************************!*\
  !*** ../pkg/demo_158.js ***!
  \**************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   InferenceEngineMode: () => (/* reexport safe */ _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.InferenceEngineMode),\n/* harmony export */   Nars: () => (/* reexport safe */ _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.Nars),\n/* harmony export */   ParametersMode: () => (/* reexport safe */ _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.ParametersMode),\n/* harmony export */   __wbg_call_89af060b4e1523f2: () => (/* reexport safe */ _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbg_call_89af060b4e1523f2),\n/* harmony export */   __wbg_error_f851667af71bcfc6: () => (/* reexport safe */ _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbg_error_f851667af71bcfc6),\n/* harmony export */   __wbg_new_abda76e883ba8a5f: () => (/* reexport safe */ _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbg_new_abda76e883ba8a5f),\n/* harmony export */   __wbg_set_wasm: () => (/* reexport safe */ _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbg_set_wasm),\n/* harmony export */   __wbg_stack_658279fe44541cf6: () => (/* reexport safe */ _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbg_stack_658279fe44541cf6),\n/* harmony export */   __wbindgen_debug_string: () => (/* reexport safe */ _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_debug_string),\n/* harmony export */   __wbindgen_object_drop_ref: () => (/* reexport safe */ _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_object_drop_ref),\n/* harmony export */   __wbindgen_string_new: () => (/* reexport safe */ _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_string_new),\n/* harmony export */   __wbindgen_throw: () => (/* reexport safe */ _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_throw)\n/* harmony export */ });\n/* harmony import */ var _demo_158_bg_wasm__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./demo_158_bg.wasm */ \"../pkg/demo_158_bg.wasm\");\n/* harmony import */ var _demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./demo_158_bg.js */ \"../pkg/demo_158_bg.js\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_demo_158_bg_wasm__WEBPACK_IMPORTED_MODULE_1__]);\n_demo_158_bg_wasm__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n(0,_demo_158_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbg_set_wasm)(_demo_158_bg_wasm__WEBPACK_IMPORTED_MODULE_1__);\n\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });\n\n//# sourceURL=webpack://narust-wasm-demo/../pkg/demo_158.js?");

/***/ }),

/***/ "../pkg/demo_158_bg.js":
/*!*****************************!*\
  !*** ../pkg/demo_158_bg.js ***!
  \*****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   InferenceEngineMode: () => (/* binding */ InferenceEngineMode),\n/* harmony export */   Nars: () => (/* binding */ Nars),\n/* harmony export */   ParametersMode: () => (/* binding */ ParametersMode),\n/* harmony export */   __wbg_call_89af060b4e1523f2: () => (/* binding */ __wbg_call_89af060b4e1523f2),\n/* harmony export */   __wbg_error_f851667af71bcfc6: () => (/* binding */ __wbg_error_f851667af71bcfc6),\n/* harmony export */   __wbg_new_abda76e883ba8a5f: () => (/* binding */ __wbg_new_abda76e883ba8a5f),\n/* harmony export */   __wbg_set_wasm: () => (/* binding */ __wbg_set_wasm),\n/* harmony export */   __wbg_stack_658279fe44541cf6: () => (/* binding */ __wbg_stack_658279fe44541cf6),\n/* harmony export */   __wbindgen_debug_string: () => (/* binding */ __wbindgen_debug_string),\n/* harmony export */   __wbindgen_object_drop_ref: () => (/* binding */ __wbindgen_object_drop_ref),\n/* harmony export */   __wbindgen_string_new: () => (/* binding */ __wbindgen_string_new),\n/* harmony export */   __wbindgen_throw: () => (/* binding */ __wbindgen_throw)\n/* harmony export */ });\n/* module decorator */ module = __webpack_require__.hmd(module);\nlet wasm;\nfunction __wbg_set_wasm(val) {\n    wasm = val;\n}\n\n\nconst heap = new Array(128).fill(undefined);\n\nheap.push(undefined, null, true, false);\n\nfunction getObject(idx) { return heap[idx]; }\n\nlet heap_next = heap.length;\n\nfunction dropObject(idx) {\n    if (idx < 132) return;\n    heap[idx] = heap_next;\n    heap_next = idx;\n}\n\nfunction takeObject(idx) {\n    const ret = getObject(idx);\n    dropObject(idx);\n    return ret;\n}\n\nconst lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;\n\nlet cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });\n\ncachedTextDecoder.decode();\n\nlet cachedUint8ArrayMemory0 = null;\n\nfunction getUint8ArrayMemory0() {\n    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {\n        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);\n    }\n    return cachedUint8ArrayMemory0;\n}\n\nfunction getStringFromWasm0(ptr, len) {\n    ptr = ptr >>> 0;\n    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));\n}\n\nfunction addHeapObject(obj) {\n    if (heap_next === heap.length) heap.push(heap.length + 1);\n    const idx = heap_next;\n    heap_next = heap[idx];\n\n    heap[idx] = obj;\n    return idx;\n}\n\nfunction debugString(val) {\n    // primitive types\n    const type = typeof val;\n    if (type == 'number' || type == 'boolean' || val == null) {\n        return  `${val}`;\n    }\n    if (type == 'string') {\n        return `\"${val}\"`;\n    }\n    if (type == 'symbol') {\n        const description = val.description;\n        if (description == null) {\n            return 'Symbol';\n        } else {\n            return `Symbol(${description})`;\n        }\n    }\n    if (type == 'function') {\n        const name = val.name;\n        if (typeof name == 'string' && name.length > 0) {\n            return `Function(${name})`;\n        } else {\n            return 'Function';\n        }\n    }\n    // objects\n    if (Array.isArray(val)) {\n        const length = val.length;\n        let debug = '[';\n        if (length > 0) {\n            debug += debugString(val[0]);\n        }\n        for(let i = 1; i < length; i++) {\n            debug += ', ' + debugString(val[i]);\n        }\n        debug += ']';\n        return debug;\n    }\n    // Test for built-in\n    const builtInMatches = /\\[object ([^\\]]+)\\]/.exec(toString.call(val));\n    let className;\n    if (builtInMatches.length > 1) {\n        className = builtInMatches[1];\n    } else {\n        // Failed to match the standard '[object ClassName]'\n        return toString.call(val);\n    }\n    if (className == 'Object') {\n        // we're a user defined class or Object\n        // JSON.stringify avoids problems with cycles, and is generally much\n        // easier than looping through ownProperties of `val`.\n        try {\n            return 'Object(' + JSON.stringify(val) + ')';\n        } catch (_) {\n            return 'Object';\n        }\n    }\n    // errors\n    if (val instanceof Error) {\n        return `${val.name}: ${val.message}\\n${val.stack}`;\n    }\n    // TODO we could test for more things here, like `Set`s and `Map`s.\n    return className;\n}\n\nlet WASM_VECTOR_LEN = 0;\n\nconst lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;\n\nlet cachedTextEncoder = new lTextEncoder('utf-8');\n\nconst encodeString = (typeof cachedTextEncoder.encodeInto === 'function'\n    ? function (arg, view) {\n    return cachedTextEncoder.encodeInto(arg, view);\n}\n    : function (arg, view) {\n    const buf = cachedTextEncoder.encode(arg);\n    view.set(buf);\n    return {\n        read: arg.length,\n        written: buf.length\n    };\n});\n\nfunction passStringToWasm0(arg, malloc, realloc) {\n\n    if (realloc === undefined) {\n        const buf = cachedTextEncoder.encode(arg);\n        const ptr = malloc(buf.length, 1) >>> 0;\n        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);\n        WASM_VECTOR_LEN = buf.length;\n        return ptr;\n    }\n\n    let len = arg.length;\n    let ptr = malloc(len, 1) >>> 0;\n\n    const mem = getUint8ArrayMemory0();\n\n    let offset = 0;\n\n    for (; offset < len; offset++) {\n        const code = arg.charCodeAt(offset);\n        if (code > 0x7F) break;\n        mem[ptr + offset] = code;\n    }\n\n    if (offset !== len) {\n        if (offset !== 0) {\n            arg = arg.slice(offset);\n        }\n        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;\n        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);\n        const ret = encodeString(arg, view);\n\n        offset += ret.written;\n        ptr = realloc(ptr, len, offset, 1) >>> 0;\n    }\n\n    WASM_VECTOR_LEN = offset;\n    return ptr;\n}\n\nlet cachedDataViewMemory0 = null;\n\nfunction getDataViewMemory0() {\n    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {\n        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);\n    }\n    return cachedDataViewMemory0;\n}\n\nfunction getArrayJsValueFromWasm0(ptr, len) {\n    ptr = ptr >>> 0;\n    const mem = getDataViewMemory0();\n    const result = [];\n    for (let i = ptr; i < ptr + 4 * len; i += 4) {\n        result.push(takeObject(mem.getUint32(i, true)));\n    }\n    return result;\n}\n\nfunction handleError(f, args) {\n    try {\n        return f.apply(this, args);\n    } catch (e) {\n        wasm.__wbindgen_exn_store(addHeapObject(e));\n    }\n}\n/**\n* 用枚举模式选择不同的引擎\n*/\nconst InferenceEngineMode = Object.freeze({\n/**\n* 空引擎\n*/\nVoid:0,\"0\":\"Void\",\n/**\n* 仅回显\n*/\nEcho:1,\"1\":\"Echo\",\n/**\n* 最新版\n*/\nDev:2,\"2\":\"Dev\", });\n/**\n* 用枚举模式选择不同的超参数\n*/\nconst ParametersMode = Object.freeze({\n/**\n* 默认超参数\n*/\nDefault:0,\"0\":\"Default\", });\n\nconst NarsFinalization = (typeof FinalizationRegistry === 'undefined')\n    ? { register: () => {}, unregister: () => {} }\n    : new FinalizationRegistry(ptr => wasm.__wbg_nars_free(ptr >>> 0, 1));\n/**\n* 封装一个「运行时」对象\n*/\nclass Nars {\n\n    __destroy_into_raw() {\n        const ptr = this.__wbg_ptr;\n        this.__wbg_ptr = 0;\n        NarsFinalization.unregister(this);\n        return ptr;\n    }\n\n    free() {\n        const ptr = this.__destroy_into_raw();\n        wasm.__wbg_nars_free(ptr, 0);\n    }\n    /**\n    * @param {string} name\n    * @param {InferenceEngineMode} engine\n    * @param {ParametersMode} parameters\n    */\n    constructor(name, engine, parameters) {\n        try {\n            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);\n            const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);\n            const len0 = WASM_VECTOR_LEN;\n            wasm.nars_new(retptr, ptr0, len0, engine, parameters);\n            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);\n            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);\n            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);\n            if (r2) {\n                throw takeObject(r1);\n            }\n            this.__wbg_ptr = r0 >>> 0;\n            NarsFinalization.register(this, this.__wbg_ptr, this);\n            return this;\n        } finally {\n            wasm.__wbindgen_add_to_stack_pointer(16);\n        }\n    }\n    /**\n    * @param {string} input\n    */\n    input(input) {\n        try {\n            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);\n            const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);\n            const len0 = WASM_VECTOR_LEN;\n            wasm.nars_input(retptr, this.__wbg_ptr, ptr0, len0);\n            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);\n            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);\n            if (r1) {\n                throw takeObject(r0);\n            }\n        } finally {\n            wasm.__wbindgen_add_to_stack_pointer(16);\n        }\n    }\n    /**\n    * 拉取输出\n    * @returns {(string)[]}\n    */\n    fetch() {\n        try {\n            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);\n            wasm.nars_fetch(retptr, this.__wbg_ptr);\n            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);\n            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);\n            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);\n            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);\n            if (r3) {\n                throw takeObject(r2);\n            }\n            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();\n            wasm.__wbindgen_free(r0, r1 * 4, 4);\n            return v1;\n        } finally {\n            wasm.__wbindgen_add_to_stack_pointer(16);\n        }\n    }\n    /**\n    * 拉取输出，提取其中的`SAV`回调并调用相应JS闭包\n    * @param {Function} save_fn\n    * @returns {(string)[]}\n    */\n    fetchWithSaving(save_fn) {\n        try {\n            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);\n            wasm.nars_fetchWithSaving(retptr, this.__wbg_ptr, addHeapObject(save_fn));\n            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);\n            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);\n            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);\n            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);\n            if (r3) {\n                throw takeObject(r2);\n            }\n            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();\n            wasm.__wbindgen_free(r0, r1 * 4, 4);\n            return v1;\n        } finally {\n            wasm.__wbindgen_add_to_stack_pointer(16);\n        }\n    }\n    /**\n    * @param {Function} load_fn\n    */\n    setLoadHook(load_fn) {\n        wasm.nars_setLoadHook(this.__wbg_ptr, addHeapObject(load_fn));\n    }\n    /**\n    * * 🚩手动拼装[`LOA`](Cmd::LOA)指令\n    * * 🎯解决「JS端传入文本解析错误」的问题（截断空格）\n    * @param {string} target\n    * @param {string} data\n    */\n    load(target, data) {\n        try {\n            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);\n            const ptr0 = passStringToWasm0(target, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);\n            const len0 = WASM_VECTOR_LEN;\n            const ptr1 = passStringToWasm0(data, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);\n            const len1 = WASM_VECTOR_LEN;\n            wasm.nars_load(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1);\n            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);\n            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);\n            if (r1) {\n                throw takeObject(r0);\n            }\n        } finally {\n            wasm.__wbindgen_add_to_stack_pointer(16);\n        }\n    }\n}\n\nfunction __wbindgen_object_drop_ref(arg0) {\n    takeObject(arg0);\n};\n\nfunction __wbindgen_string_new(arg0, arg1) {\n    const ret = getStringFromWasm0(arg0, arg1);\n    return addHeapObject(ret);\n};\n\nfunction __wbg_new_abda76e883ba8a5f() {\n    const ret = new Error();\n    return addHeapObject(ret);\n};\n\nfunction __wbg_stack_658279fe44541cf6(arg0, arg1) {\n    const ret = getObject(arg1).stack;\n    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);\n    const len1 = WASM_VECTOR_LEN;\n    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);\n    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);\n};\n\nfunction __wbg_error_f851667af71bcfc6(arg0, arg1) {\n    let deferred0_0;\n    let deferred0_1;\n    try {\n        deferred0_0 = arg0;\n        deferred0_1 = arg1;\n        console.error(getStringFromWasm0(arg0, arg1));\n    } finally {\n        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);\n    }\n};\n\nfunction __wbg_call_89af060b4e1523f2() { return handleError(function (arg0, arg1, arg2) {\n    const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));\n    return addHeapObject(ret);\n}, arguments) };\n\nfunction __wbindgen_debug_string(arg0, arg1) {\n    const ret = debugString(getObject(arg1));\n    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);\n    const len1 = WASM_VECTOR_LEN;\n    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);\n    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);\n};\n\nfunction __wbindgen_throw(arg0, arg1) {\n    throw new Error(getStringFromWasm0(arg0, arg1));\n};\n\n\n\n//# sourceURL=webpack://narust-wasm-demo/../pkg/demo_158_bg.js?");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   main: () => (/* binding */ main)\n/* harmony export */ });\n/* harmony import */ var demo_158__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! demo_158 */ \"../pkg/demo_158.js\");\n/* harmony import */ var _shell__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./shell */ \"./src/shell.ts\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([demo_158__WEBPACK_IMPORTED_MODULE_0__]);\ndemo_158__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\nasync function main() {\n    // * NARS\n    const nars = new demo_158__WEBPACK_IMPORTED_MODULE_0__.Nars('nar-158', demo_158__WEBPACK_IMPORTED_MODULE_0__.InferenceEngineMode.Dev, demo_158__WEBPACK_IMPORTED_MODULE_0__.ParametersMode.Default);\n    // console.log(NAR)\n    // shell\n    await new _shell__WEBPACK_IMPORTED_MODULE_1__.Shell(nars).start();\n}\nawait main();\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } }, 1);\n\n//# sourceURL=webpack://narust-wasm-demo/./src/index.ts?");

/***/ }),

/***/ "./src/shell.ts":
/*!**********************!*\
  !*** ./src/shell.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Shell: () => (/* binding */ Shell)\n/* harmony export */ });\n/* harmony import */ var _styles__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./styles */ \"./src/styles.ts\");\n/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util */ \"./src/util.ts\");\n\n\n(0,_styles__WEBPACK_IMPORTED_MODULE_0__.applyStyle)();\n// import * as css_reset from \"./css/css-reset.css\";\n// import * as css from \"./css/style.css\";\n// css // ! ❌找不到模块“./css/style.css”或其相应的类型声明。ts(2307)\n// css_reset\nconst BANNER = `\r\n==== demo 158 ====\r\nFor testing the NAR core, you can type these commends for example:\r\n<span class='command'>nse</span> [Narsese]\r\n<span class='command'>cyc</span> [cycle steps]\r\n<span class='command'>vol</span> [output volume 0~100]\r\n<span class='command'>res</span> [reason of resetting reasoner]\r\n<span class='command'>sav</span> [target of saving reasoner memory/status]\r\n<span class='command'>loa</span> [target of loading reasoner memory/status]\r\n<span class='command'>inf</span> [query for getting information from reasoner]\r\n...\r\n<br>\r\n`;\nconst COMMANDS = ['nse', 'cyc', 'res'];\nclass UserInput {\n    constructor(element) {\n        this.element = element;\n    }\n    get value() {\n        return this.element.value;\n    }\n    set value(value) {\n        this.element.value = value;\n    }\n    setupEventListeners(handler) {\n        this.element.addEventListener('keypress', handler);\n        this.element.addEventListener('keydown', handler);\n    }\n    setFocus() {\n        window.addEventListener('click', (e) => {\n            // Shift/Ctrl/Alt 可以选中文本\n            if (!e.altKey && !e.ctrlKey && !e.shiftKey)\n                this.element.focus();\n        });\n    }\n}\nclass Shell {\n    constructor(nars, userInputObj = new UserInput(document.getElementById(\"user-input\")), \n    //mutWriteLines gets deleted and reassigned\n    mutWriteLines = document.getElementById(\"write-lines\"), prompt = document.getElementById(\"prompt\")) {\n        this.nars = nars;\n        this.userInputObj = userInputObj;\n        this.mutWriteLines = mutWriteLines;\n        this.prompt = prompt;\n        this.historyIdx = 0;\n        this.tempInput = \"\";\n        this.userInput = \"\";\n        this.history = [];\n        this.lastSaveTarget = 'saves';\n    }\n    scrollToBottom() {\n        const MAIN = document.getElementById(\"main\");\n        if (!MAIN)\n            return;\n        MAIN.scrollTop = MAIN.scrollHeight;\n    }\n    userInputHandler(e) {\n        const key = e.key;\n        switch (key) {\n            case \"Enter\":\n                e.preventDefault();\n                this.enterKey();\n                this.scrollToBottom();\n                break;\n            case \"Escape\":\n                this.userInputObj.value = \"\";\n                break;\n            case \"ArrowUp\":\n                this.arrowKeys(key);\n                e.preventDefault();\n                break;\n            case \"ArrowDown\":\n                this.arrowKeys(key);\n                break;\n            case \"Tab\":\n                this.tabKey();\n                e.preventDefault();\n                break;\n        }\n    }\n    async enterKey() {\n        if (!this.mutWriteLines || !this.prompt)\n            return;\n        const resetInput = \"\";\n        this.userInput = this.userInputObj.value;\n        let newUserInput = document.createElement(\"span\");\n        newUserInput.setAttribute(\"class\", \"output\");\n        newUserInput.innerText = this.userInput;\n        this.history.push(this.userInput);\n        this.historyIdx = this.history.length;\n        //if clear then early return\n        if (this.userInput === 'clear') {\n            this.commandHandler(this.userInput.toLowerCase().trim());\n            this.userInputObj.value = resetInput;\n            this.userInput = resetInput;\n            return;\n        }\n        const div = document.createElement(\"div\");\n        div.innerHTML = `<span id=\"prompt\">${this.prompt.innerHTML}</span> ${newUserInput.innerHTML}`;\n        if (this.mutWriteLines.parentNode) {\n            this.mutWriteLines.parentNode.insertBefore(div, this.mutWriteLines);\n        }\n        /*\n        if input is empty or a collection of spaces,\n        just insert a prompt before #write-lines\n        */\n        if (this.userInput.trim().length !== 0) {\n            this.commandHandler(this.userInput.trim());\n        }\n        this.userInputObj.value = resetInput;\n        this.userInput = resetInput;\n    }\n    tabKey() {\n        let currInput = this.userInputObj.value;\n        for (const ele of COMMANDS) {\n            if (ele.startsWith(currInput) && ele != currInput) {\n                this.userInputObj.value = ele;\n                return;\n            }\n        }\n        for (const his of this.history) {\n            if (his.startsWith(currInput) && his != currInput) {\n                this.userInputObj.value = his;\n                return;\n            }\n        }\n    }\n    arrowKeys(e) {\n        switch (e) {\n            case \"ArrowDown\":\n                if (this.historyIdx !== this.history.length) {\n                    this.historyIdx += 1;\n                    this.userInputObj.value = this.history[this.historyIdx];\n                    if (this.historyIdx === this.history.length)\n                        this.userInputObj.value = this.tempInput;\n                }\n                break;\n            case \"ArrowUp\":\n                if (this.historyIdx === this.history.length)\n                    this.tempInput = this.userInputObj.value;\n                if (this.historyIdx !== 0) {\n                    this.historyIdx -= 1;\n                    this.userInputObj.value = this.history[this.historyIdx];\n                }\n                break;\n        }\n    }\n    async commandHandler(input) {\n        this.inputCmd(input);\n    }\n    async inputCmd(cmd) {\n        // 记录上一次`SAV`的目标，用于正确获取文件名称\n        // * 📌格式：`SAV 【目标】 【路径】`\n        if (cmd.toLowerCase().startsWith('sav'))\n            this.lastSaveTarget = cmd.split(' ')[1];\n        // 正式输入指令\n        try {\n            this.nars.input(cmd);\n        }\n        catch (error) {\n            console.error(error);\n            this.writeLines([`[ERROR] ${error}`], true);\n        }\n        this.showOutputs();\n    }\n    showOutputs() {\n        try {\n            const outputs = this.nars.fetchWithSaving((data) => {\n                const date = new Date(); // from: https://www.squash.io/how-to-format-javascript-date-as-yyyy-mm-dd/\n                const year = date.getFullYear();\n                const month = String(date.getMonth() + 1).padStart(2, '0');\n                const day = String(date.getDate()).padStart(2, '0');\n                const hours = String(date.getHours()).padStart(2, '0');\n                const minutes = String(date.getMinutes()).padStart(2, '0');\n                const seconds = String(date.getSeconds()).padStart(2, '0');\n                const formattedDate = `${year}${month}${day}_${hours}${minutes}${seconds}`; // yyyymmddhhmmss\n                const fileName = `${this.lastSaveTarget}-${formattedDate}.json`;\n                (0,_util__WEBPACK_IMPORTED_MODULE_1__.saveTextByDownloading)(fileName, data);\n            });\n            for (const output of outputs) {\n                console.log(output);\n            }\n            this.writeLines(outputs, true);\n        }\n        catch (error) {\n            console.error(error);\n            this.writeLines([`[ERROR] ${error}`], true);\n        }\n    }\n    writeLines(message, rawMode = false) {\n        message.forEach((item, idx) => {\n            this.displayText(item, idx, rawMode);\n        });\n    }\n    displayText(item, idx, rawMode = false) {\n        setTimeout(() => {\n            if (!this.mutWriteLines)\n                return;\n            const p = document.createElement(\"p\");\n            if (rawMode)\n                p.innerText = item;\n            else\n                p.innerHTML = item;\n            this.mutWriteLines.parentNode.insertBefore(p, this.mutWriteLines);\n            this.scrollToBottom();\n        }, 40 * idx);\n    }\n    banner() {\n        // banner\n        window.addEventListener('load', () => {\n            this.writeLines(BANNER.split('\\n').map(x => x.trim()).filter(x => x.length > 0));\n        });\n    }\n    initEventListeners() {\n        this.userInputObj.setupEventListeners(x => this.userInputHandler(x));\n        this.userInputObj.setFocus();\n    }\n    async start() {\n        this.nars.setLoadHook(async (target) => {\n            // 获取数据\n            const data = await (0,_util__WEBPACK_IMPORTED_MODULE_1__.getTextBySelectingFile)();\n            // 调用推理器API，加载\n            this.nars.load(target, data);\n            // 呈现输出\n            this.showOutputs();\n        });\n        this.banner();\n        this.initEventListeners();\n    }\n}\n\n\n//# sourceURL=webpack://narust-wasm-demo/./src/shell.ts?");

/***/ }),

/***/ "./src/styles.ts":
/*!***********************!*\
  !*** ./src/styles.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   applyStyle: () => (/* binding */ applyStyle)\n/* harmony export */ });\n/* harmony import */ var _config_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config.json */ \"./config.json\");\n\nfunction applyStyle() {\n    const style = document.createElement('style');\n    const head = document.head;\n    const background = `body {background: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.background}}`;\n    const foreground = `body {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.foreground}}`;\n    const inputBackground = `input {background: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.background}}`;\n    const inputForeground = `input {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.prompt.input}}`;\n    const outputColor = `.output {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.prompt.input}}`;\n    const preHost = `#pre-host {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.prompt.host}}`;\n    const host = `#host {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.prompt.host}}`;\n    const preUser = `#pre-user {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.prompt.user}}`;\n    const user = `#user {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.prompt.user}}`;\n    const prompt = `#prompt {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.prompt[\"default\"]}}`;\n    const banner = `pre {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.banner}}`;\n    const link = `a {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.link.text}}`;\n    const linkHighlight = `a:hover {background: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.link.highlightColor}}`;\n    const linkTextHighlight = `a:hover {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.link.highlightText}}`;\n    const commandHighlight = `.command {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.commands.textColor}}`;\n    const keys = `.keys {color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.banner}}`;\n    head.appendChild(style);\n    if (!style.sheet)\n        return;\n    if (!_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.border.visible) {\n        style.sheet.insertRule(\"#bars {display: none}\");\n        style.sheet.insertRule(\"main {border: none}\");\n    }\n    else {\n        style.sheet.insertRule(`#bars {background: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.background}}`);\n        style.sheet.insertRule(`main {border-color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.border.color}}`);\n        style.sheet.insertRule(`#bar-1 {background: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.border.color}; color: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.background}}`);\n        style.sheet.insertRule(`#bar-2 {background: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.border.color}}`);\n        style.sheet.insertRule(`#bar-3 {background: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.border.color}}`);\n        style.sheet.insertRule(`#bar-4 {background: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.border.color}}`);\n        style.sheet.insertRule(`#bar-5 {background: ${_config_json__WEBPACK_IMPORTED_MODULE_0__.colors.border.color}}`);\n    }\n    style.sheet.insertRule(background);\n    style.sheet.insertRule(foreground);\n    style.sheet.insertRule(inputBackground);\n    style.sheet.insertRule(inputForeground);\n    style.sheet.insertRule(outputColor);\n    style.sheet.insertRule(preHost);\n    style.sheet.insertRule(host);\n    style.sheet.insertRule(preUser);\n    style.sheet.insertRule(user);\n    style.sheet.insertRule(prompt);\n    style.sheet.insertRule(banner);\n    style.sheet.insertRule(link);\n    style.sheet.insertRule(linkHighlight);\n    style.sheet.insertRule(linkTextHighlight);\n    style.sheet.insertRule(commandHighlight);\n    style.sheet.insertRule(keys);\n}\n\n\n//# sourceURL=webpack://narust-wasm-demo/./src/styles.ts?");

/***/ }),

/***/ "./src/util.ts":
/*!*********************!*\
  !*** ./src/util.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   FILE_TYPE_TEXT_ALL: () => (/* binding */ FILE_TYPE_TEXT_ALL),\n/* harmony export */   FILE_TYPE_TEXT_PLAIN: () => (/* binding */ FILE_TYPE_TEXT_PLAIN),\n/* harmony export */   UTF_8: () => (/* binding */ UTF_8),\n/* harmony export */   getTextBySelectingFile: () => (/* binding */ getTextBySelectingFile),\n/* harmony export */   saveTextByDownloading: () => (/* binding */ saveTextByDownloading)\n/* harmony export */ });\nconst FILE_TYPE_TEXT_PLAIN = \"text/plain\";\nconst FILE_TYPE_TEXT_ALL = \"text/*\";\nconst UTF_8 = 'UTF-8';\n/**\n * 浏览器请求下载文件\n * @param fileName 文件名\n * @param text 文件数据（纯文本UTF-8）\n * @link https://stackoverflow.com/questions/61351004/javascript-store-outputs-and-download-file\n */\nfunction saveTextByDownloading(fileName, text) {\n    const data = new Blob([text], { type: FILE_TYPE_TEXT_PLAIN });\n    const url = window.URL.createObjectURL(data);\n    // 创建一个元素并立即点击，以模拟下载\n    const e = document.createElement('a');\n    e.href = url;\n    e.download = fileName; // 若无此字段，将打开新页面而非直接下载文件\n    e.click();\n}\n/**\n * 通过选取文件以获取信息\n * * 格式：`text/plain`纯文本，编码UTF-8\n * @returns 一个\n * @link https://stackoverflow.com/questions/16215771/how-to-open-select-file-dialog-via-js\n */\nasync function getTextBySelectingFile(contentType = FILE_TYPE_TEXT_PLAIN, encoding = UTF_8) {\n    // 异步获取文件\n    const file = await new Promise(resolve => {\n        const input = document.createElement('input');\n        input.type = 'file';\n        input.multiple = false;\n        input.accept = contentType;\n        input.onchange = _ => {\n            let inputFiles = input.files;\n            if (!inputFiles)\n                return;\n            let files = Array.from(inputFiles);\n            if (files.length > 0)\n                resolve(files[0]);\n        };\n        input.click();\n    });\n    // 读取文件\n    const reader = new FileReader();\n    reader.readAsText(file, encoding);\n    const content = await new Promise(resolve => {\n        reader.onload = readerEvent => {\n            var content = readerEvent.target?.result; // this is the content!\n            if (content) {\n                resolve(content.toString());\n            }\n        };\n    });\n    return content;\n}\n\n\n//# sourceURL=webpack://narust-wasm-demo/./src/util.ts?");

/***/ }),

/***/ "./config.json":
/*!*********************!*\
  !*** ./config.json ***!
  \*********************/
/***/ ((module) => {

eval("module.exports = /*#__PURE__*/JSON.parse('{\"title\":\"demo-158\",\"colors\":{\"background\":\"#000000\",\"foreground\":\"#FFFFFF\",\"banner\":\"#FFFFFF\",\"border\":{\"visible\":true,\"color\":\"#FFFFFF\"},\"prompt\":{\"default\":\"#ABCDEF\",\"user\":\"#ABCDEF\",\"host\":\"#FF70FD\",\"input\":\"#FFFFFF\"},\"link\":{\"text\":\"#EEAAB6\",\"highlightColor\":\"#E2ADFF\",\"highlightText\":\"#0C0623\"},\"commands\":{\"textColor\":\"#DB9BFD\"}}}');\n\n//# sourceURL=webpack://narust-wasm-demo/./config.json?");

/***/ }),

/***/ "../pkg/demo_158_bg.wasm":
/*!*******************************!*\
  !*** ../pkg/demo_158_bg.wasm ***!
  \*******************************/
/***/ ((module, exports, __webpack_require__) => {

eval("/* harmony import */ var WEBPACK_IMPORTED_MODULE_0 = __webpack_require__(/*! ./demo_158_bg.js */ \"../pkg/demo_158_bg.js\");\nmodule.exports = __webpack_require__.v(exports, module.id, \"2c6e38871cc0dd47f5a6\", {\n\t\"./demo_158_bg.js\": {\n\t\t\"__wbindgen_object_drop_ref\": WEBPACK_IMPORTED_MODULE_0.__wbindgen_object_drop_ref,\n\t\t\"__wbindgen_string_new\": WEBPACK_IMPORTED_MODULE_0.__wbindgen_string_new,\n\t\t\"__wbg_new_abda76e883ba8a5f\": WEBPACK_IMPORTED_MODULE_0.__wbg_new_abda76e883ba8a5f,\n\t\t\"__wbg_stack_658279fe44541cf6\": WEBPACK_IMPORTED_MODULE_0.__wbg_stack_658279fe44541cf6,\n\t\t\"__wbg_error_f851667af71bcfc6\": WEBPACK_IMPORTED_MODULE_0.__wbg_error_f851667af71bcfc6,\n\t\t\"__wbg_call_89af060b4e1523f2\": WEBPACK_IMPORTED_MODULE_0.__wbg_call_89af060b4e1523f2,\n\t\t\"__wbindgen_debug_string\": WEBPACK_IMPORTED_MODULE_0.__wbindgen_debug_string,\n\t\t\"__wbindgen_throw\": WEBPACK_IMPORTED_MODULE_0.__wbindgen_throw\n\t}\n});\n\n//# sourceURL=webpack://narust-wasm-demo/../pkg/demo_158_bg.wasm?");

/***/ })

}]);