"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkcreate_wasm_app"] = self["webpackChunkcreate_wasm_app"] || []).push([["index_ts"],{

/***/ "../pkg/narsese_structure_illustrator.js":
/*!***********************************************!*\
  !*** ../pkg/narsese_structure_illustrator.js ***!
  \***********************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   __wbg_error_f851667af71bcfc6: () => (/* reexport safe */ _narsese_structure_illustrator_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbg_error_f851667af71bcfc6),\n/* harmony export */   __wbg_new_abda76e883ba8a5f: () => (/* reexport safe */ _narsese_structure_illustrator_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbg_new_abda76e883ba8a5f),\n/* harmony export */   __wbg_set_wasm: () => (/* reexport safe */ _narsese_structure_illustrator_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbg_set_wasm),\n/* harmony export */   __wbg_stack_658279fe44541cf6: () => (/* reexport safe */ _narsese_structure_illustrator_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbg_stack_658279fe44541cf6),\n/* harmony export */   __wbindgen_object_drop_ref: () => (/* reexport safe */ _narsese_structure_illustrator_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_object_drop_ref),\n/* harmony export */   __wbindgen_string_new: () => (/* reexport safe */ _narsese_structure_illustrator_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbindgen_string_new),\n/* harmony export */   demonstrate_narsese: () => (/* reexport safe */ _narsese_structure_illustrator_bg_js__WEBPACK_IMPORTED_MODULE_0__.demonstrate_narsese),\n/* harmony export */   translate_between: () => (/* reexport safe */ _narsese_structure_illustrator_bg_js__WEBPACK_IMPORTED_MODULE_0__.translate_between)\n/* harmony export */ });\n/* harmony import */ var _narsese_structure_illustrator_bg_wasm__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./narsese_structure_illustrator_bg.wasm */ \"../pkg/narsese_structure_illustrator_bg.wasm\");\n/* harmony import */ var _narsese_structure_illustrator_bg_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./narsese_structure_illustrator_bg.js */ \"../pkg/narsese_structure_illustrator_bg.js\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_narsese_structure_illustrator_bg_wasm__WEBPACK_IMPORTED_MODULE_1__]);\n_narsese_structure_illustrator_bg_wasm__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n(0,_narsese_structure_illustrator_bg_js__WEBPACK_IMPORTED_MODULE_0__.__wbg_set_wasm)(_narsese_structure_illustrator_bg_wasm__WEBPACK_IMPORTED_MODULE_1__);\n\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });\n\n//# sourceURL=webpack://create-wasm-app/../pkg/narsese_structure_illustrator.js?");

/***/ }),

/***/ "../pkg/narsese_structure_illustrator_bg.js":
/*!**************************************************!*\
  !*** ../pkg/narsese_structure_illustrator_bg.js ***!
  \**************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   __wbg_error_f851667af71bcfc6: () => (/* binding */ __wbg_error_f851667af71bcfc6),\n/* harmony export */   __wbg_new_abda76e883ba8a5f: () => (/* binding */ __wbg_new_abda76e883ba8a5f),\n/* harmony export */   __wbg_set_wasm: () => (/* binding */ __wbg_set_wasm),\n/* harmony export */   __wbg_stack_658279fe44541cf6: () => (/* binding */ __wbg_stack_658279fe44541cf6),\n/* harmony export */   __wbindgen_object_drop_ref: () => (/* binding */ __wbindgen_object_drop_ref),\n/* harmony export */   __wbindgen_string_new: () => (/* binding */ __wbindgen_string_new),\n/* harmony export */   demonstrate_narsese: () => (/* binding */ demonstrate_narsese),\n/* harmony export */   translate_between: () => (/* binding */ translate_between)\n/* harmony export */ });\n/* module decorator */ module = __webpack_require__.hmd(module);\nlet wasm;\nfunction __wbg_set_wasm(val) {\n    wasm = val;\n}\n\n\nconst lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;\n\nlet cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });\n\ncachedTextDecoder.decode();\n\nlet cachedUint8Memory0 = null;\n\nfunction getUint8Memory0() {\n    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {\n        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);\n    }\n    return cachedUint8Memory0;\n}\n\nfunction getStringFromWasm0(ptr, len) {\n    ptr = ptr >>> 0;\n    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));\n}\n\nconst heap = new Array(128).fill(undefined);\n\nheap.push(undefined, null, true, false);\n\nlet heap_next = heap.length;\n\nfunction addHeapObject(obj) {\n    if (heap_next === heap.length) heap.push(heap.length + 1);\n    const idx = heap_next;\n    heap_next = heap[idx];\n\n    heap[idx] = obj;\n    return idx;\n}\n\nfunction getObject(idx) { return heap[idx]; }\n\nfunction dropObject(idx) {\n    if (idx < 132) return;\n    heap[idx] = heap_next;\n    heap_next = idx;\n}\n\nfunction takeObject(idx) {\n    const ret = getObject(idx);\n    dropObject(idx);\n    return ret;\n}\n\nlet WASM_VECTOR_LEN = 0;\n\nconst lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;\n\nlet cachedTextEncoder = new lTextEncoder('utf-8');\n\nconst encodeString = (typeof cachedTextEncoder.encodeInto === 'function'\n    ? function (arg, view) {\n    return cachedTextEncoder.encodeInto(arg, view);\n}\n    : function (arg, view) {\n    const buf = cachedTextEncoder.encode(arg);\n    view.set(buf);\n    return {\n        read: arg.length,\n        written: buf.length\n    };\n});\n\nfunction passStringToWasm0(arg, malloc, realloc) {\n\n    if (realloc === undefined) {\n        const buf = cachedTextEncoder.encode(arg);\n        const ptr = malloc(buf.length, 1) >>> 0;\n        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);\n        WASM_VECTOR_LEN = buf.length;\n        return ptr;\n    }\n\n    let len = arg.length;\n    let ptr = malloc(len, 1) >>> 0;\n\n    const mem = getUint8Memory0();\n\n    let offset = 0;\n\n    for (; offset < len; offset++) {\n        const code = arg.charCodeAt(offset);\n        if (code > 0x7F) break;\n        mem[ptr + offset] = code;\n    }\n\n    if (offset !== len) {\n        if (offset !== 0) {\n            arg = arg.slice(offset);\n        }\n        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;\n        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);\n        const ret = encodeString(arg, view);\n\n        offset += ret.written;\n        ptr = realloc(ptr, len, offset, 1) >>> 0;\n    }\n\n    WASM_VECTOR_LEN = offset;\n    return ptr;\n}\n\nlet cachedInt32Memory0 = null;\n\nfunction getInt32Memory0() {\n    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {\n        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);\n    }\n    return cachedInt32Memory0;\n}\n/**\n* 入口：展示Narsese结构\n* * 📝Rust的`Result<T,E>`在WASM链接后将转换为\n*   * Ok(t) ⇒ 调用方拿到值\n*   * Err(e) ⇒ `throw e`\n* @param {number} format_id\n* @param {string} input\n* @returns {string}\n*/\nfunction demonstrate_narsese(format_id, input) {\n    let deferred3_0;\n    let deferred3_1;\n    try {\n        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);\n        const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);\n        const len0 = WASM_VECTOR_LEN;\n        wasm.demonstrate_narsese(retptr, format_id, ptr0, len0);\n        var r0 = getInt32Memory0()[retptr / 4 + 0];\n        var r1 = getInt32Memory0()[retptr / 4 + 1];\n        var r2 = getInt32Memory0()[retptr / 4 + 2];\n        var r3 = getInt32Memory0()[retptr / 4 + 3];\n        var ptr2 = r0;\n        var len2 = r1;\n        if (r3) {\n            ptr2 = 0; len2 = 0;\n            throw takeObject(r2);\n        }\n        deferred3_0 = ptr2;\n        deferred3_1 = len2;\n        return getStringFromWasm0(ptr2, len2);\n    } finally {\n        wasm.__wbindgen_add_to_stack_pointer(16);\n        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);\n    }\n}\n\n/**\n* 在不同格式之间转译Narsese（从整数ID开始）\n* @param {string} input\n* @param {number} from_id\n* @param {number} to_id\n* @returns {string}\n*/\nfunction translate_between(input, from_id, to_id) {\n    let deferred3_0;\n    let deferred3_1;\n    try {\n        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);\n        const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);\n        const len0 = WASM_VECTOR_LEN;\n        wasm.translate_between(retptr, ptr0, len0, from_id, to_id);\n        var r0 = getInt32Memory0()[retptr / 4 + 0];\n        var r1 = getInt32Memory0()[retptr / 4 + 1];\n        var r2 = getInt32Memory0()[retptr / 4 + 2];\n        var r3 = getInt32Memory0()[retptr / 4 + 3];\n        var ptr2 = r0;\n        var len2 = r1;\n        if (r3) {\n            ptr2 = 0; len2 = 0;\n            throw takeObject(r2);\n        }\n        deferred3_0 = ptr2;\n        deferred3_1 = len2;\n        return getStringFromWasm0(ptr2, len2);\n    } finally {\n        wasm.__wbindgen_add_to_stack_pointer(16);\n        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);\n    }\n}\n\nfunction __wbindgen_string_new(arg0, arg1) {\n    const ret = getStringFromWasm0(arg0, arg1);\n    return addHeapObject(ret);\n};\n\nfunction __wbg_new_abda76e883ba8a5f() {\n    const ret = new Error();\n    return addHeapObject(ret);\n};\n\nfunction __wbg_stack_658279fe44541cf6(arg0, arg1) {\n    const ret = getObject(arg1).stack;\n    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);\n    const len1 = WASM_VECTOR_LEN;\n    getInt32Memory0()[arg0 / 4 + 1] = len1;\n    getInt32Memory0()[arg0 / 4 + 0] = ptr1;\n};\n\nfunction __wbg_error_f851667af71bcfc6(arg0, arg1) {\n    let deferred0_0;\n    let deferred0_1;\n    try {\n        deferred0_0 = arg0;\n        deferred0_1 = arg1;\n        console.error(getStringFromWasm0(arg0, arg1));\n    } finally {\n        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);\n    }\n};\n\nfunction __wbindgen_object_drop_ref(arg0) {\n    takeObject(arg0);\n};\n\n\n\n//# sourceURL=webpack://create-wasm-app/../pkg/narsese_structure_illustrator_bg.js?");

/***/ }),

/***/ "./index.ts":
/*!******************!*\
  !*** ./index.ts ***!
  \******************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _pkg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../pkg */ \"../pkg/narsese_structure_illustrator.js\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_pkg__WEBPACK_IMPORTED_MODULE_0__]);\n_pkg__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n//! 基本采用Rust风格写就的主文件\n//! * 📝webpack测试dist：通过`http-server`/`webserver`包\n//!   * 在非`www`的其它目录下，可能需要使用`npx webserver run`启动\n//! * 📝如果只是网页的功能没更新，有可能是网页缓存（WASM文件）的问题\n//! * ⚠️要把整个`dist`的所有文件迁移到别的地方使用，建议预先删除以保证最新（可能不会覆盖）\n//! * 📄参考：https://blog.csdn.net/qq_25131799/article/details/102835481\n// !【2024-02-25 21:35:33】升级TypeScript之后找不到：找不到模块“narsese_structure_illustrator”或其相应的类型声明。ts(2307)\n// import { demonstrate_narsese, translate_between } from \"narsese_structure_illustrator\"\n\n/**\n * 尝试初始化MathJax\n */\nfunction try_init_mathjax() {\n    MathJax.tex = {\n        inlineMath: [['$', '$']],\n        processEscapes: true\n    };\n}\n/**\n * 在DOM元素中加载LaTeX文本\n */\nfunction load_latex(element, latex) {\n    element.innerHTML = latex;\n    // 空⇒返回\n    if (latex === \"\")\n        return;\n    // 交由MathJax处理\n    MathJax.texReset();\n    MathJax.typesetClear();\n    MathJax.typesetPromise([element]).catch((err) => {\n        element.innerHTML = '';\n        element.appendChild(document.createTextNode(err.message));\n        console.error(err);\n    });\n}\n/**\n * 用于表示文本格式ID\n */\nvar FormatID;\n(function (FormatID) {\n    /**\n     * ASCII\n     */\n    FormatID[FormatID[\"ASCII\"] = 0] = \"ASCII\";\n    /**\n     * LaTeX\n     */\n    FormatID[FormatID[\"LATEX\"] = 1] = \"LATEX\";\n    /**\n     * 漢文\n     */\n    FormatID[FormatID[\"HAN\"] = 2] = \"HAN\";\n})(FormatID || (FormatID = {}));\n/**\n * 在 [index.html] 中的后缀\n * * 与上头枚举相对应\n */\nconst FORMAT_ELEMENT_NAMES = [\n    \"ascii\",\n    \"latex\",\n    \"han\",\n];\n/**\n * 构造一个通用的「元素代理」类\n * * 🎯用于封装DOM元素\n * * 📌最初用于复用style设置\n */\nclass ElementProxy {\n    constructor(\n    /** 封装的DOM元素 */\n    dom) {\n        this.dom = dom;\n    }\n    /**\n     * 解析成功时设置样式\n     */\n    ok_style() {\n        this.dom.style.color = \"black\";\n        this.dom.style.fontWeight = \"normal\";\n    }\n    /**\n     * 解析失败时设置样式\n     */\n    err_style() {\n        this.dom.style.color = \"red\";\n        this.dom.style.fontWeight = \"bold\";\n    }\n    /**\n     * @implements IOutput\n     */\n    update(output, is_error, ..._other) {\n        // 更新样式\n        if (is_error) {\n            this.err_style();\n        }\n        else {\n            this.ok_style();\n        }\n        // 更新内容\n        this.set_content(output);\n    }\n}\n/**\n * 构造一个「文本框代理」类\n * * 可接收输入以进行更新\n */\nclass InputProxy extends ElementProxy {\n    /**\n     * 构造函数\n     * @param dom DOM元素\n     */\n    constructor(\n    /** 封装的DOM元素（向超类传递） */\n    dom, \n    /** 对应的格式ID */\n    id, \n    /** 统一输出到「展示器」的目标元素 */\n    output) {\n        super(dom);\n        this.id = id;\n        this.output = output;\n        /** 【内部/自适应文本框】输入一个字符后`scrollWidth`与`最初宽度的差（用于平衡「未到达边界时可能产生的偏移的差值」） */\n        this.input_width_delta = null;\n        /** 用于广播的「外部环境」 */\n        this.env = [];\n        this.initial_input_width = this.dom.scrollWidth;\n    }\n    // 实现接口 //\n    format_id() {\n        return this.id;\n    }\n    update_broadcast_env(env) {\n        // 清空\n        this.env.forEach(() => void this.env.pop());\n        // 添加\n        env.forEach((input) => void this.env.push(input));\n    }\n    receive_broadcast(from, input) {\n        // console.log(\"接收到广播\", input)\n        // 若为自己⇒返回\n        if (from === this)\n            return;\n        // 内容为空⇒置空\n        if (input === \"\")\n            return this.clear_content();\n        // 开始转写格式\n        let content;\n        let is_error = false;\n        try {\n            // 结合双方ID开始转写格式：从源头转换为自身\n            content = (0,_pkg__WEBPACK_IMPORTED_MODULE_0__.translate_between)(input, \n            // 从源头\n            from.format_id(), \n            // 到自身\n            this.id);\n        }\n        // 此中`Option<String, String>`抛出一个字符串\n        catch (error) {\n            content = String(error);\n            is_error = true;\n        }\n        // 更新 | 被动输入\n        this.update(content, is_error, false);\n    }\n    /**\n     * 启动\n     * * 添加侦听器等后置操作\n     */\n    launch() {\n        this.attachEventListener();\n    }\n    // 实现抽象类 //\n    set_content(content) {\n        this.dom.value = content;\n    }\n    update(output, is_error, is_user_input) {\n        super.update(output, is_error);\n        // !【2024-02-25 22:26:11】弃用：暂时无法彻底解决「一下设置太多文本」的问题，亦不能直接解决「从动输入」的问题\n        /* if (is_user_input) {\n            // 用户输入⇒动态更新宽度\n             */ this.update_width(); /*\n   }\n   else {\n       // 广播更新⇒尝试直接设置宽度\n       if (this.input_width_delta === null)\n           this.initial_input_width = this.dom.scrollWidth\n       this.dom.style.width = this.dom.scrollWidth + \"px\"\n   } */\n    }\n    // 独有方法 //\n    /**\n     * 统一添加侦听\n     */\n    attachEventListener() {\n        this.dom.addEventListener(\"input\", \n        // !【2024-02-25 21:03:52】此处必须进行转换\n        (ev) => this.on_input(ev));\n    }\n    /**\n     * 侦听输入\n     */\n    on_input(event) {\n        if (event.target === null)\n            return;\n        // console.log(event)\n        // 回复样式\n        this.ok_style();\n        // 获取输入\n        const input = this.dom.value; // * 📝文本框使用`value`属性获取内容\n        // console.log(\"更新！\", this, event, input)\n        // 更新输出\n        this.demonstrate_narsese(input);\n        // 更新输入宽度\n        this.update_width();\n        // 广播：翻译到其它输入框\n        for (const other of this.env) {\n            // 除了自己\n            if (other !== this)\n                other.receive_broadcast(this, input);\n        }\n    }\n    /**\n     * 自适应宽度\n     */\n    update_width() {\n        /** 待计算的宽度 */\n        let W;\n        if (this.dom.value) {\n            // 空值合并\n            if (!this.input_width_delta)\n                this.input_width_delta = this.dom.scrollWidth - this.initial_input_width;\n            // 计算宽度\n            W =\n                // ! 此中的「-DELTA」用于避免宽度无谓增大\n                this.dom.scrollWidth - this.input_width_delta;\n        }\n        else {\n            // 无内容⇒重置宽度\n            W = this.initial_input_width;\n            // 后续重新计算\n            this.input_width_delta = null;\n        }\n        /** 转换为字符串 */\n        const W_STR = W.toString() + \"px\";\n        this.dom.style.width = W_STR;\n        this.dom.width = W;\n        // element.style.width = textWidth + \"px\"\n    }\n    /**\n     * 展示Narsese\n     */\n    demonstrate_narsese(input) {\n        // 内容为空⇒置空\n        if (input === \"\")\n            return this.clear_content_and_output();\n        let is_error = false;\n        let out;\n        try {\n            // ! ↓下边隐含有「`Err(e)` ⇒ `throw e`」\n            out = (0,_pkg__WEBPACK_IMPORTED_MODULE_0__.demonstrate_narsese)(this.id, input);\n        }\n        catch (e /* 字符串 */) {\n            is_error = true;\n            out = String(e); // 使用构造函数进行转换\n        }\n        // 通知输出更新\n        this.output.update(out, is_error);\n    }\n    /**\n     * 置空文本内容\n     */\n    clear_content() {\n        this.update(\"\", false, false);\n    }\n    /**\n     * 置空文本内容与输出\n     */\n    clear_content_and_output() {\n        this.clear_content();\n        this.output.update(\"\", false);\n    }\n}\n/**\n * 特殊包装@LaTeX：支持MathJax预览\n */\nclass InputProxyLatex extends InputProxy {\n    constructor(\n    /** 封装的DOM元素（向超类传递） */\n    dom, id, output, \n    /** 封装的预览DOM元素 */\n    dom_latex_preview) {\n        super(dom, id, output);\n        this.dom_latex_preview = dom_latex_preview;\n        // 初始化MathJax\n        // @ts-ignore\n        try_init_mathjax();\n    }\n    /**\n     * 覆盖：额外更新LaTeX\n     */\n    on_input(event) {\n        // 向上传递\n        super.on_input(event);\n        // 更新LaTeX\n        this.update_latex(this.dom.value === null || this.dom.value === \"\" ? \"\" : this.dom.value);\n    }\n    /**\n     * 覆盖：额外更新LaTeX\n     */\n    update(output, is_error, is_user_input) {\n        // 向上传递\n        super.update(output, is_error, is_user_input);\n        // 更新LaTeX | 出错时清空\n        this.update_latex(is_error ? \"\" : output);\n    }\n    /**\n     * 展示时增加更新\n     */\n    demonstrate_narsese(input) {\n        super.demonstrate_narsese(input);\n        this.update_latex(input === null || input === \"\" ? \"\" : input);\n    }\n    /**\n     * 更新LaTeX预览\n     * * 🚩直接在自身引用的输出中计算并加载LaTeX文本\n     */\n    update_latex(text) {\n        // 📄示例(text)：\\\\$0.01\\\\$ \\\\left<A \\\\rightarrow  B\\\\right>¿\n        load_latex(this.dom_latex_preview, InputProxyLatex.format_latex(text));\n    }\n    /**\n     * 整理LaTeX文本\n     * * ℹ️最初是因为「MathJax无法良好处理`\\left<A \\rightarrow  B\\right>.`」而设置\n     *   * 📌原因：`\\left<A`无法被作为`\\left< A \\right>`识别\n     */\n    static format_latex(text) {\n        // 空⇒置空\n        if (text === \"\")\n            return \"\";\n        // 其它\n        return ('$' +\n            text\n                // `\\left<A` => `\\\\left< A`\n                .replace(/\\\\left\\\\?./g, (matched) => matched + ' ')\n                // `\\left(\\times   A  B  C\\right)` => `\\left(\\times \\;\\; A  B  C\\right)`\n                .replace(/ {2,}/g, '\\\\;')\n                // `A. \\backslash\\!\\!\\!\\!\\Rightarrow` => `A. \\backslash \\!\\!\\!\\!\\Rightarrow`\n                .replace(/\\\\\\w+\\\\/g, (matched) => matched.slice(0, matched.length - 1) + ' ' + matched[matched.length - 1])\n            + '$');\n    }\n}\n/**\n * 实现并包装「输出」DOM元素\n */\nclass OutputProxy extends ElementProxy {\n    /**\n     * 构造函数\n     * @param dom DOM元素\n     */\n    constructor(\n    /** 封装的DOM元素（向超类传递） */\n    dom) { super(dom); }\n    // 实现接口 //\n    update(output, is_error) {\n        // 更新样式\n        if (is_error) {\n            this.err_style();\n        }\n        else {\n            this.ok_style();\n        }\n        // 更新内容\n        this.set_content(output);\n    }\n    // 实现抽象类 //\n    set_content(text) {\n        this.dom.textContent = text;\n    }\n}\n/**\n * 输出（展示框）\n */\nconst DOM_OUTPUT = document.getElementById(\"output\");\n/** 封装为代理 */\nconst OUTPUT = new OutputProxy(DOM_OUTPUT);\n/**\n * 输出（LaTeX）\n */\nconst DOM_LATEX_OUTPUT = document.getElementById(\"latex_preview\");\n/**\n * 批量获取输入DOM元素\n * * 后续直接通过`FormatID`访问\n */\nconst DOM_INPUTS = FORMAT_ELEMENT_NAMES.map(id => document.getElementById(`input_${id}`));\n/** 封装为代理 */\nconst INPUT_PROXIES = [];\nfor (const [id, dom] of DOM_INPUTS.entries()) {\n    switch (id) {\n        // LaTeX特制\n        case FormatID.LATEX:\n            INPUT_PROXIES[id] = new InputProxyLatex(dom, id, OUTPUT, DOM_LATEX_OUTPUT);\n            break;\n        // 一般\n        default:\n            INPUT_PROXIES[id] = new InputProxy(dom, id, OUTPUT);\n    }\n}\n// 更新代理外部环境\nINPUT_PROXIES.forEach(proxy => {\n    proxy.update_broadcast_env(INPUT_PROXIES);\n});\n// 🔥启动！\nINPUT_PROXIES.forEach(proxy => proxy.launch());\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });\n\n//# sourceURL=webpack://create-wasm-app/./index.ts?");

/***/ }),

/***/ "../pkg/narsese_structure_illustrator_bg.wasm":
/*!****************************************************!*\
  !*** ../pkg/narsese_structure_illustrator_bg.wasm ***!
  \****************************************************/
/***/ ((module, exports, __webpack_require__) => {

eval("/* harmony import */ var WEBPACK_IMPORTED_MODULE_0 = __webpack_require__(/*! ./narsese_structure_illustrator_bg.js */ \"../pkg/narsese_structure_illustrator_bg.js\");\nmodule.exports = __webpack_require__.v(exports, module.id, \"29d595c335653e513e29\", {\n\t\"./narsese_structure_illustrator_bg.js\": {\n\t\t\"__wbindgen_string_new\": WEBPACK_IMPORTED_MODULE_0.__wbindgen_string_new,\n\t\t\"__wbg_new_abda76e883ba8a5f\": WEBPACK_IMPORTED_MODULE_0.__wbg_new_abda76e883ba8a5f,\n\t\t\"__wbg_stack_658279fe44541cf6\": WEBPACK_IMPORTED_MODULE_0.__wbg_stack_658279fe44541cf6,\n\t\t\"__wbg_error_f851667af71bcfc6\": WEBPACK_IMPORTED_MODULE_0.__wbg_error_f851667af71bcfc6,\n\t\t\"__wbindgen_object_drop_ref\": WEBPACK_IMPORTED_MODULE_0.__wbindgen_object_drop_ref\n\t}\n});\n\n//# sourceURL=webpack://create-wasm-app/../pkg/narsese_structure_illustrator_bg.wasm?");

/***/ })

}]);