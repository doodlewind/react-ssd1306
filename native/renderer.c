#include <quickjs/quickjs.h>
#include <errno.h>
#include <string.h>
#include "oled96.h"

#define countof(x) (sizeof(x) / sizeof((x)[0]))

JSValue nativeInit(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    const int bInvert = JS_ToBool(ctx, argv[0]);
    const int bFlip = JS_ToBool(ctx, argv[1]);
    int iChannel = 1;
    int iOLEDAddr = 0x3c;        // typical address; it can also be 0x3d
    int iOLEDType = OLED_128x64; // Change this for your specific display
    oledInit(iChannel, iOLEDAddr, iOLEDType, bFlip, bInvert);
    oledFill(0);
    return JS_NULL;
}

JSValue nativeClear(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    oledFill(0);
    return JS_NULL;
}

JSValue nativeDrawText(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    const char *text = JS_ToCString(ctx, argv[0]);
    printf("draw text: %s\n", text);
    oledWriteString(0, 0, (char *)text, FONT_NORMAL);
    JS_FreeCString(ctx, text);
    return JS_NULL;
}

JSValue nativeDrawPixel(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
    int x, y;
    JS_ToInt32(ctx, &x, argv[0]);
    JS_ToInt32(ctx, &y, argv[1]);
    printf("%d, %d", x, y);
    oledSetPixel(x, y, 1);
    return JS_NULL;
}

const JSCFunctionListEntry nativeFuncs[] = {
    JS_CFUNC_DEF("init", 2, nativeInit),
    JS_CFUNC_DEF("clear", 0, nativeClear),
    JS_CFUNC_DEF("drawPixel", 2, nativeDrawPixel),
    JS_CFUNC_DEF("drawText", 1, nativeDrawText)};

int moduleInitFunc(JSContext *ctx, JSModuleDef *m)
{
    return JS_SetModuleExportList(ctx, m, nativeFuncs, countof(nativeFuncs));
}

JSModuleDef *js_init_module_renderer(JSContext *ctx, const char *module_name)
{
    JSModuleDef *m;
    m = JS_NewCModule(ctx, module_name, moduleInitFunc);
    if (!m)
        return NULL;
    JS_AddModuleExportList(ctx, m, nativeFuncs, countof(nativeFuncs));
    return m;
}
