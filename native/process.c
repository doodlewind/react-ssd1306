#include <quickjs/quickjs.h>
#include <errno.h>
#include <string.h>

#define countof(x) (sizeof(x) / sizeof((x)[0]))

JSValue createError(JSContext *ctx, int err) {
  JSValue obj;

  obj = JS_NewError(ctx);
  JS_DefinePropertyValueStr(ctx, obj, "message",
                            JS_NewString(ctx, strerror(err)),
                            JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
  JS_DefinePropertyValueStr(ctx, obj, "errno",
                            JS_NewInt32(ctx, err),
                            JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);

  return obj;
}

JSValue js_process_open(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  const char *command, *mode = NULL;
  int errcode = EINVAL;
  FILE *p;

  command = JS_ToCString(ctx, argv[0]);
  if (!command)
      goto fail;
  mode = JS_ToCString(ctx, argv[1]);
  if (!mode) {
      goto fail;
  }
  if (mode[strspn(mode, "rw")] != '\0') {
      goto fail;
  }

  p = popen(command, mode);
  JS_FreeCString(ctx, command);
  JS_FreeCString(ctx, mode);
  if (!p) {
    errcode = errno;
    goto fail;
  }

  return JS_NewInt32(ctx, fileno(p));

  fail:
    JS_FreeCString(ctx, command);
    JS_FreeCString(ctx, mode);

    JSValue errObj;
    errObj = createError(ctx, errcode);

    if (JS_IsException(errObj))
      errObj = JS_NULL;
    return JS_Throw(ctx, errObj);
}

JSValue js_process_close(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  int32_t fd;
  if (JS_ToInt32(ctx, &fd, argv[0])) {
    return JS_EXCEPTION;
  }
  FILE *p = fdopen(fd, "r");
  if (!p) {
    return JS_EXCEPTION;
  }
  return JS_NewInt64(ctx, pclose(p));
}

const JSCFunctionListEntry js_process_funcs[] = {
  JS_CFUNC_DEF("open", 2, js_process_open ),
  JS_CFUNC_DEF("close", 1, js_process_close )
};

int js_process_init(JSContext *ctx, JSModuleDef *m)
{
  return JS_SetModuleExportList(ctx, m, js_process_funcs, countof(js_process_funcs));
}

JSModuleDef *js_init_module_process(JSContext *ctx, const char *module_name)
{
  JSModuleDef *m;
  m = JS_NewCModule(ctx, module_name, js_process_init);
  if (!m)
      return NULL;
  JS_AddModuleExportList(ctx, m, js_process_funcs, countof(js_process_funcs));
  return m;
}
