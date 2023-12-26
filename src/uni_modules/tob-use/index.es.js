var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) =>
  key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : (obj[key] = value);
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {})) if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source) if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0) target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop)) target[prop] = source[prop];
    }
  return target;
};
import {
  getCurrentScope,
  onScopeDispose as onScopeDispose$1,
  ref,
  isRef,
  watch as watch$1,
  unref,
  computed,
  inject,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted as onMounted$1,
  nextTick,
  onUnmounted,
  onBeforeUpdate,
  customRef,
  shallowRef,
  watchSyncEffect,
  readonly,
  reactive,
  toRef,
  toRefs as toRefs$1
} from 'vue';
const tryOnScopeDispose = (fn) => {
  if (getCurrentScope()) {
    onScopeDispose$1(fn);
    return true;
  }
  return false;
};
const useIntervalFn = (cb, interval = 1e3, options = {}) => {
  const { immediate = true, immediateCallback = false } = options;
  let timer = null;
  const isActive = ref(false);
  const clean = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };
  const pause = () => {
    isActive.value = false;
    clean();
  };
  const resume = () => {
    if (interval <= 0) return;
    isActive.value = true;
    if (immediateCallback) cb();
    clean();
    timer = setInterval(cb, unref(interval));
  };
  if (immediate) resume();
  if (isRef(interval)) {
    const stopWatch = watch$1(interval, () => {
      if (immediate) resume();
    });
    tryOnScopeDispose(stopWatch);
  }
  tryOnScopeDispose(pause);
  return {
    isActive,
    pause,
    resume
  };
};
const useInterval = (interval = 1e3, options = {}) => {
  const { controls: exposeControls = false, immediate = true } = options;
  const counter = ref(0);
  const controls = useIntervalFn(() => (counter.value += 1), interval, { immediate });
  if (exposeControls) {
    return __spreadValues(
      {
        counter
      },
      controls
    );
  } else {
    return counter;
  }
};
const noop = () => { };
const events = /* @__PURE__ */ new Map();
const timestamp = () => +Date.now();
function promiseTimeout (ms, throwOnTimeout = false, reason = 'Timeout') {
  return new Promise((resolve, reject) => {
    if (throwOnTimeout) {
      setTimeout(() => reject(reason), ms);
    } else {
      setTimeout(resolve, ms);
    }
  });
}
const useTimeoutFn = (cb, interval, options = {}) => {
  const { immediate = true } = options;
  const isPending = ref(false);
  let timer = null;
  const clear = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
  const stop = () => {
    isPending.value = false;
    clear();
  };
  const start = (...args) => {
    clear();
    isPending.value = true;
    timer = setTimeout(() => {
      isPending.value = false;
      timer = null;
      cb(...args);
    }, unref(interval));
  };
  if (immediate) {
    isPending.value = true;
    start();
  }
  tryOnScopeDispose(stop);
  return {
    isPending,
    start,
    stop
  };
};
const useTimeout = (interval = 1e3, options = {}) => {
  const { controls: exposeControls = false } = options;
  const controls = useTimeoutFn(noop, interval, options);
  const ready = computed(() => !controls.isPending.value);
  if (exposeControls) {
    return __spreadValues(
      {
        ready
      },
      controls
    );
  } else {
    return ready;
  }
};
const clamp = (n, min, max) => {
  return Math.min(max, Math.max(min, n));
};
const isBoolean = (v) => typeof v === 'boolean';
const isFunction = (v) => typeof v === 'function';
const isString = (v) => typeof v === 'string';
const isNumber = (v) => typeof v === 'number';
const isUndefined = (v) => typeof v === 'undefined';
const computedInject = (key, options, defaultSource, treatDefaultAsFactory) => {
  let source = inject(key);
  if (defaultSource) {
    source = inject(key, defaultSource);
  }
  if (treatDefaultAsFactory) {
    source = inject(key, defaultSource, treatDefaultAsFactory);
  }
  if (isFunction(options)) {
    return computed((ctx) => options(source, ctx));
  } else {
    return computed({
      get: (ctx) => options.get(source, ctx),
      set: options.set
    });
  }
};
const tryOnBeforeUnmount = (fn) => {
  if (getCurrentInstance()) {
    onBeforeUnmount(fn);
  }
};
const tryOnMounted = (fn, sync = true) => {
  if (getCurrentInstance()) {
    onMounted$1(fn);
  } else if (sync) {
    fn();
  } else {
    nextTick(fn);
  }
};
const tryOnUnmounted = (fn) => {
  if (getCurrentInstance()) {
    onUnmounted(fn);
  }
};
const useMounted = () => {
  const isMounted = ref(false);
  onMounted(() => {
    isMounted.value = true;
  });
  return isMounted;
};
const useTemplateRefsList = () => {
  const refs = ref([]);
  refs.value.set = (el) => {
    if (el) {
      refs.value.push(el);
    }
  };
  const reset = () => (refs.value.length = 0);
  onBeforeUpdate(reset);
  return refs;
};
const useVModel = (props, key = 'modelValue', emit, options = {}) => {
  var _a;
  const { eventName, deep = false, passive = false } = options;
  const vm = getCurrentInstance();
  const _emit = emit || (vm == null ? void 0 : vm.emit) || ((_a = vm == null ? void 0 : vm.$emit) == null ? void 0 : _a.bind(vm));
  let event = eventName || `update:${key}`;
  if (passive) {
    const proxy = ref(props[key]);
    watch$1(
      () => props[key],
      (v) => (proxy.value = v)
    );
    watch$1(
      proxy,
      (v) => {
        if (v !== props[key] || deep) _emit(event, v);
      },
      {
        deep
      }
    );
    return proxy;
  } else {
    return computed({
      get () {
        return props[key];
      },
      set (value) {
        _emit(event, value);
      }
    });
  }
};
const useVModels = (props, emit, options = {}) => {
  const ret = {};
  for (const key in props) {
    ret[key] = useVModel(props, key, emit, options);
  }
  return ret;
};
const and = (...args) => {
  return computed(() => args.every((v) => unref(v)));
};
const asyncComputed = (evaluationCallback, initialState, optionsOrRef) => {
  const options = formatOptions(optionsOrRef);
  const { lazy = false, onError = noop, evaluating = void 0 } = options;
  const started = ref(!lazy);
  const current = ref(initialState);
  let counter = 0;
  watchEffect(async (onInvalidate) => {
    if (!started.value) {
      return;
    }
    counter++;
    const counterAtBeginning = counter;
    let hasFinished = false;
    if (evaluating) {
      runNextMicroTask(() => {
        evaluating.value = true;
      });
    }
    try {
      const result = await evaluationCallback((cancelCallback) => {
        onInvalidate(() => {
          if (evaluating) {
            evaluating.value = false;
          }
          if (!hasFinished) {
            cancelCallback();
          }
        });
      });
      const shouldUpdate = counterAtBeginning === counter;
      if (shouldUpdate) {
        current.value = result;
      }
    } catch (e) {
      onError(e);
    } finally {
      if (evaluating) {
        evaluating.value = false;
      }
      hasFinished = true;
    }
  });
  if (lazy) {
    return computed(() => {
      started.value = true;
      return current.value;
    });
  }
  return current;
};
const formatOptions = (optionsOrRef) => {
  let options;
  if (isRef(optionsOrRef)) {
    options = { evaluating: optionsOrRef };
  } else {
    options = optionsOrRef || {};
  }
  return options;
};
const runNextMicroTask = (cb) => Promise.resolve().then(cb);
const autoResetRef = (defaultValue, afterMs = 1e4) => {
  return customRef((track, trigger) => {
    let value;
    let timer;
    const resetAfter = () => {
      setTimeout(() => {
        value = defaultValue;
        trigger();
      }, unref(afterMs));
    };
    return {
      get () {
        track();
        return value;
      },
      set (newValue) {
        value = newValue;
        trigger();
        clearTimeout(timer);
        timer = resetAfter();
      }
    };
  });
};
const biSyncRef = (l, r) => {
  const watchOptions = {
    flush: 'sync',
    immediate: true
  };
  const sync1 = (newValue) => (r.value = newValue);
  const stop1 = watch$1(l, sync1, watchOptions);
  const sync2 = (newValue) => (l.value = newValue);
  const stop2 = watch$1(r, sync2, watchOptions);
  return () => {
    stop1();
    stop2();
  };
};
const controlledComputed = (source, fn) => {
  let v;
  let track;
  let trigger;
  const dirty = ref(true);
  watch(
    source,
    () => {
      dirty.value = true;
      trigger();
    },
    { flush: 'sync' }
  );
  return customRef((_track, _trigger) => {
    track = _track;
    trigger = _trigger;
    return {
      get () {
        if (dirty.value) {
          v = fn();
          dirty.value = false;
        }
        track();
        return v;
      },
      set () { }
    };
  });
};
const extendRef = (ref2, extend, options = {}) => {
  const { enumerable = false, unwrap = true } = options;
  for (const [key, value] of Object.entries(extend)) {
    if (key === 'value') continue;
    if (isRef(value) && unwrap) {
      Object.defineProperty(ref2, key, {
        get () {
          return value.value;
        },
        set (v) {
          value.value = v;
        },
        enumerable
      });
    } else {
      Object.defineProperty(ref2, key, { value, enumerable });
    }
  }
  return ref2;
};
const controlledRef = (initial, options = {}) => {
  let source = initial;
  let track;
  let trigger;
  const ref2 = customRef((_track, _trigger) => {
    track = _track;
    trigger = _trigger;
    return {
      get () {
        return get2();
      },
      set (v) {
        set2(v);
      }
    };
  });
  const get2 = (tracking = true) => {
    if (tracking) {
      track();
    }
    return source;
  };
  const set2 = (value, triggering = true) => {
    var _a, _b;
    const shouldUpdate = value !== source;
    if (!shouldUpdate) return;
    const old = source;
    if (((_a = options.onBeforeChange) == null ? void 0 : _a.call(options, value, old)) === false) {
      return;
    }
    source = value;
    (_b = options.onChanged) == null ? void 0 : _b.call(options, value, old);
    if (triggering) {
      trigger();
    }
  };
  const untrackedGet = () => get2(false);
  const silentSet = (v) => set2(v, false);
  const peek = () => get2(false);
  const lay = (v) => set2(v, false);
  return extendRef(
    ref2,
    {
      get: get2,
      set: set2,
      untrackedGet,
      silentSet,
      peek,
      lay
    },
    { enumerable: true }
  );
};
const createEventHook = () => {
  const fns = [];
  const off = (fn) => {
    const index = fns.indexOf(fn);
    if (index !== -1) fns.splice(index, 1);
  };
  const on = (fn) => {
    fns.push(fn);
    return {
      off: () => off(fn)
    };
  };
  const trigger = (param) => {
    fns.forEach((fn) => fn(param));
  };
  return {
    on,
    off,
    trigger
  };
};
const reactify = (fn) => {
  return function (...args) {
    return computed(() =>
      fn.apply(
        this,
        args.map((v) => unref(v))
      )
    );
  };
};
const createUnrefFn = (fn) => {
  return function (...args) {
    return fn.apply(
      this,
      args.map((v) => unref(v))
    );
  };
};
const debounceFilter = (ms, options = {}) => {
  let timer;
  let maxTimer;
  const filter = (invoke) => {
    const duration = unref(ms);
    const maxDuration = unref(options.maxWait);
    if (timer) {
      clearTimeout(timer);
    }
    const immediately = duration <= 0;
    const notWait = maxDuration !== void 0 && maxDuration <= 0;
    if (immediately || notWait) {
      if (maxTimer) {
        clearTimeout(maxTimer);
        maxTimer = null;
      }
      return invoke();
    }
    if (maxDuration && !maxTimer) {
      maxTimer = setTimeout(() => {
        if (timer) {
          clearTimeout(timer);
        }
        maxTimer = null;
        invoke();
      }, maxDuration);
    }
    timer = setTimeout(() => {
      if (maxTimer) {
        clearTimeout(maxTimer);
      }
      maxTimer = null;
      invoke();
    }, duration);
  };
  return filter;
};
const throttleFilter = (ms, trailing = true, leading = true) => {
  let timer;
  let lastExec = 0;
  let preventLeading = !leading;
  const clear = () => {
    if (timer) {
      clearTimeout(timer);
      timer = void 0;
    }
  };
  const filter = (invoke) => {
    const duration = unref(ms);
    const elapsed = Date.now() - lastExec;
    clear();
    if (duration <= 0) {
      lastExec = Date.now();
      return invoke();
    }
    if (elapsed > duration) {
      lastExec = Date.now();
      if (preventLeading) {
        preventLeading = false;
      } else {
        invoke();
      }
    }
    if (trailing) {
      timer = setTimeout(() => {
        lastExec = Date.now();
        if (!leading) {
          preventLeading = true;
        }
        clear();
        invoke();
      }, duration);
    }
    if (!leading && !timer) {
      timer = setTimeout(() => {
        preventLeading = true;
      }, duration);
    }
  };
  return filter;
};
const createFilterWrapper = (filter, fn) => {
  function wrapper (...args) {
    const cb = () => fn.apply(this, args);
    const options = {
      fn,
      args,
      thisArg: this
    };
    filter(cb, options);
  }
  return wrapper;
};
const bypassFilter = (invoke) => invoke();
const watchWithFilter = (source, cb, options = {}) => {
  const _a = options,
    { eventFilter = bypassFilter } = _a,
    watchOptions = __objRest(_a, ['eventFilter']);
  return watch$1(source, createFilterWrapper(eventFilter, cb), watchOptions);
};
const pausableFilter = (extendFilter = bypassFilter) => {
  const isActive = ref(true);
  const pause = () => (isActive.value = false);
  const resume = () => (isActive.value = true);
  const eventFilter = (...args) => {
    if (unref(isActive)) {
      extendFilter(...args);
    }
  };
  return { isActive, pause, resume, eventFilter };
};
const useDebounceFn = (fn, ms = 200, options = {}) => {
  return createFilterWrapper(debounceFilter(ms, options), fn);
};
const useDebounce = (value, ms = 200, options = {}) => {
  if (ms <= 0) {
    return value;
  }
  const debounced = ref(value.value);
  const updater = useDebounceFn(
    () => {
      debounced.value = value.value;
    },
    ms,
    options
  );
  watch$1(value, () => updater());
  return debounced;
};
const eagerComputed = (fn) => {
  const result = shallowRef();
  watchSyncEffect(() => {
    result.value = fn();
  });
  return readonly(result);
};
const get = (obj, key) => {
  if (key == null) {
    return unref(obj);
  }
  return unref(obj)[key];
};
const isDefined = (v) => unref(v) != null;
const makeDestructurable = (obj, arr) => {
  if (!isUndefined(Symbol)) {
    const clone = __spreadValues({}, obj);
    Object.defineProperty(clone, Symbol.iterator, {
      enumerable: false,
      value () {
        let index = 0;
        return {
          next: () => ({
            value: arr[index++],
            done: index > arr.length
          })
        };
      }
    });
    return clone;
  } else {
    return Object.assign([...arr], obj);
  }
};
const not = (v) => computed(() => !unref(v));
const or = (...args) => {
  return computed(() => args.some((v) => unref(v)));
};
const reactifyObject = (obj, optionsOrKeys = {}) => {
  let keys = [];
  if (Array.isArray(optionsOrKeys)) {
    keys = optionsOrKeys;
  } else {
    const { includeOwnProperties = true } = optionsOrKeys;
    keys.push(...Object.keys(obj));
    if (includeOwnProperties) {
      keys.push(...Object.getOwnPropertyNames(obj));
    }
  }
  return Object.fromEntries(
    keys.map((key) => {
      const value = obj[key];
      return [key, isFunction(value) ? reactify(value.bind(obj)) : value];
    })
  );
};
const reactivePick = (obj, ...keys) => {
  return reactive(Object.fromEntries(keys.map((k) => [k, toRef(obj, k)])));
};
const refDefault = (source, defaultValue) => {
  return computed({
    get () {
      var _a;
      return (_a = source.value) != null ? _a : defaultValue;
    },
    set (value) {
      source.value = value;
    }
  });
};
const set = (...args) => {
  if (args.length === 2) {
    const [ref2, value] = args;
    ref2.value = value;
  }
  if (args.length === 3) {
    const [target, key, value] = args;
    target[key] = value;
  }
};
const syncRef = (source, targets, options = {}) => {
  const { deep = false, flush = 'sync', immediate = true } = options;
  if (!Array.isArray(targets)) {
    targets = [targets];
  }
  return watch$1(source, (newValue) => targets.forEach((target) => (target.value = newValue)), { flush, deep, immediate });
};
const useThrottleFn = (fn, ms = 200, trailing = true, leading = true) => {
  return createFilterWrapper(throttleFilter(ms, trailing, leading), fn);
};
const useThrottle = (value, delay = 200, trailing = true, leading = true) => {
  if (delay <= 0) {
    return value;
  }
  const throttled = ref(value.value);
  const updater = useThrottleFn(
    () => {
      throttled.value = value.value;
    },
    delay,
    trailing,
    leading
  );
  watch$1(value, () => updater());
  return throttled;
};
const toReactive = (objectRef) => {
  if (!isRef(objectRef)) {
    return reactive(objectRef);
  }
  const proxy = new Proxy(
    {},
    {
      get (_, p, receiver) {
        return Reflect.get(objectRef.value, p, receiver);
      },
      set (_, p, value) {
        objectRef.value[p] = value;
        return true;
      },
      deleteProperty (_, p) {
        return Reflect.deleteProperty(objectRef.value, p);
      },
      has (_, p) {
        return Reflect.has(objectRef.value, p);
      },
      ownKeys () {
        return Object.keys(objectRef.value);
      },
      getOwnPropertyDescriptor () {
        return {
          enumerable: true,
          configurable: true
        };
      }
    }
  );
  return reactive(proxy);
};
const toRefs = (objectRef) => {
  if (!isRef(objectRef)) return toRefs$1(objectRef);
  const result = Array.isArray(objectRef.value) ? new Array(objectRef.value.length) : {};
  for (const key in objectRef.value) {
    result[key] = customRef(() => ({
      get () {
        return objectRef.value[key];
      },
      set (v) {
        if (Array.isArray(objectRef.value)) {
          const copy = [...objectRef.value];
          copy[key] = v;
          objectRef.value = copy;
        } else {
          objectRef.value = __spreadProps(__spreadValues({}, objectRef.value), {
            [key]: v
          });
        }
      }
    }));
  }
  return result;
};
const useAsyncQueue = (tasks, options = {}) => {
  const { interrupt = true, onError = noop, onFinished = noop } = options;
  const promiseState = {
    pending: 'pending',
    rejected: 'rejected',
    fulfilled: 'fulfilled'
  };
  const initialResult = Array.from(new Array(tasks.length), () => ({ state: promiseState.pending, data: null }));
  const result = reactive(initialResult);
  const activeIndex = ref(-1);
  const isEmptyTasks = !tasks || tasks.length === 0;
  if (isEmptyTasks) {
    onFinished();
    return {
      activeIndex,
      result
    };
  }
  const updateResult = (state, res) => {
    activeIndex.value++;
    result[activeIndex.value].data = res;
    result[activeIndex.value].state = state;
  };
  tasks.reduce((prev, curr) => {
    return prev
      .then((prevRes) => {
        var _a;
        const isRejected = ((_a = result[activeIndex.value]) == null ? void 0 : _a.state) === promiseState.rejected;
        if (isRejected && interrupt) {
          onFinished();
          return;
        }
        return curr(prevRes).then((currentRes) => {
          updateResult(promiseState.fulfilled, currentRes);
          const isFinished = activeIndex.value === tasks.length - 1;
          if (isFinished) {
            onFinished();
          }
          return currentRes;
        });
      })
      .catch((e) => {
        updateResult(promiseState.rejected, e);
        onError();
        return e;
      });
  }, Promise.resolve());
  return {
    activeIndex,
    result
  };
};
const useClamp = (value, min, max) => {
  const _value = ref(value);
  return computed({
    get () {
      return clamp(_value.value, unref(min), unref(max));
    },
    set (value2) {
      _value.value = clamp(value2, unref(min), unref(max));
    }
  });
};
const useConfirmDialog = (revealed = ref(false)) => {
  const confirmHook = createEventHook();
  const cancelHook = createEventHook();
  const revealHook = createEventHook();
  let _resolve = noop;
  const reveal = (data) => {
    revealed.value = true;
    revealHook.trigger(data);
    return new Promise((resolve) => {
      _resolve = resolve;
    });
  };
  const confirm = (data) => {
    revealed.value = false;
    confirmHook.trigger(data);
    _resolve({ data, isCanceled: false });
  };
  const cancel = (data) => {
    revealed.value = false;
    cancelHook.trigger(data);
    _resolve({ data, isCanceled: true });
  };
  return {
    reveal,
    cancel,
    confirm,
    onReveal: revealHook.on,
    onCancel: cancelHook.on,
    onConfirm: confirmHook.on,
    isRevealed: computed(() => revealed.value)
  };
};
const useCounter = (initialValue = 0) => {
  const count = ref(initialValue);
  const inc = (delta = 1) => (count.value += delta);
  const dec = (delta = 1) => (count.value -= delta);
  const get2 = () => count.value;
  const set2 = (val) => (count.value = val);
  const reset = (val = initialValue) => {
    initialValue = val;
    return set2(val);
  };
  return { count, inc, dec, get: get2, set: set2, reset };
};
const useCycleList = (list, options) => {
  var _a;
  const state = shallowRef((_a = options == null ? void 0 : options.initialValue) != null ? _a : list[0]);
  const index = computed({
    get () {
      var _a2;
      let index2 = (options == null ? void 0 : options.getIndexOf)
        ? options.getIndexOf(state.value, list)
        : list.indexOf(state.value);
      if (index2 < 0) index2 = (_a2 = options == null ? void 0 : options.fallbackIndex) != null ? _a2 : 0;
      return index2;
    },
    set (v) {
      set2(v);
    }
  });
  function set2 (i) {
    const { length } = list;
    const index2 = ((i % length) + length) % length;
    const value = list[index2];
    state.value = value;
    return value;
  }
  function shift (delta = 1) {
    return set2(index.value + delta);
  }
  function next (n = 1) {
    return shift(n);
  }
  function prev (n = 1) {
    return shift(-n);
  }
  return {
    state,
    index,
    next,
    prev
  };
};
const useEventBus = (key) => {
  const scope = getCurrentScope();
  const on = (listener) => {
    const listeners = events.get(key) || [];
    listeners.push(listener);
    events.set(key, listeners);
    const _off = () => off(listener);
    scope == null ? void 0 : scope.cleanups.push(_off);
    return _off;
  };
  const once = (listener) => {
    function _listener (...args) {
      off(_listener);
      listener(...args);
    }
    return on(_listener);
  };
  const off = (listener) => {
    const listeners = events.get(key);
    if (!listeners) return;
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
    if (!listeners.length) events.delete(key);
  };
  const reset = () => events.delete(key);
  const emit = (event) => {
    var _a;
    return (_a = events.get(key)) == null ? void 0 : _a.forEach((v) => v(event));
  };
  return { on, once, off, emit, reset };
};
const useLastChanged = (source, options = {}) => {
  var _a;
  const ms = ref((_a = options.initialValue) != null ? _a : null);
  watch$1(source, () => (ms.value = timestamp()), options);
  return ms;
};
const useMemoize = (resolver, options) => {
  const initCache = () => {
    if (options == null ? void 0 : options.cache) {
      return reactive(options.cache);
    }
    return reactive(/* @__PURE__ */ new Map());
  };
  const cache = initCache();
  const generateKey = (...args) => ((options == null ? void 0 : options.getKey) ? options.getKey(...args) : JSON.stringify(args));
  const _loadData = (key, ...args) => {
    cache.set(key, resolver(...args));
    return cache.get(key);
  };
  const loadData = (...args) => _loadData(generateKey(...args), ...args);
  const deleteData = (...args) => {
    cache.delete(generateKey(...args));
  };
  const clearData = () => cache.clear();
  const memoized = (...args) => {
    const key = generateKey(...args);
    if (cache.has(key)) return cache.get(key);
    return _loadData(key, ...args);
  };
  memoized.load = loadData;
  memoized.delete = deleteData;
  memoized.clear = clearData;
  memoized.generateKey = generateKey;
  memoized.cache = cache;
  return memoized;
};
const useOffsetPagination = (options = {}) => {
  const {
    page = 1,
    pageSize = 10,
    total = Infinity,
    onPageChange = noop,
    onPageSizeChange = noop,
    onPageCountChange = noop
  } = options;
  const currentPageSize = useClamp(pageSize, 1, Infinity);
  const pageCount = computed(() => Math.ceil(unref(total) / unref(currentPageSize)));
  const currentPage = useClamp(page, 1, pageCount);
  const isFirstPage = computed(() => currentPage.value === 1);
  const isLastPage = computed(() => currentPage.value === pageCount.value);
  if (isRef(page)) {
    biSyncRef(page, currentPage);
  }
  if (isRef(pageSize)) {
    biSyncRef(pageSize, currentPageSize);
  }
  const prev = () => currentPage.value--;
  const next = () => currentPage.value++;
  const returnValue = {
    currentPage,
    currentPageSize,
    pageCount,
    isFirstPage,
    isLastPage,
    prev,
    next
  };
  watch$1(currentPage, () => {
    onPageChange(reactive(returnValue));
  });
  watch$1(currentPageSize, () => {
    onPageSizeChange(reactive(returnValue));
  });
  watch$1(pageCount, () => {
    onPageCountChange(reactive(returnValue));
  });
  return returnValue;
};
const useToggle = (initialValue = false) => {
  if (isRef(initialValue)) {
    return (value) => {
      initialValue.value = isBoolean(value) ? value : !initialValue.value;
      return initialValue.value;
    };
  } else {
    const boolean = ref(initialValue);
    const toggle = (value) => {
      boolean.value = isBoolean(value) ? value : !boolean.value;
      return boolean.value;
    };
    return [boolean, toggle];
  }
};
const debouncedWatch = (source, cb, options = {}) => {
  const _a = options,
    { debounce = 0 } = _a,
    watchOptions = __objRest(_a, ['debounce']);
  return watchWithFilter(
    source,
    cb,
    __spreadProps(__spreadValues({}, watchOptions), {
      eventFilter: debounceFilter(debounce)
    })
  );
};
const ignorableWatch = (source, cb, options = {}) => {
  const _a = options,
    { eventFilter = bypassFilter } = _a,
    watchOptions = __objRest(_a, ['eventFilter']);
  const filteredCb = createFilterWrapper(eventFilter, cb);
  let stop;
  let ignoreUpdates;
  let ignorePrevAsyncUpdates;
  const syncFlush = watchOptions.flush === 'sync';
  if (syncFlush) {
    const ignore = ref(false);
    ignorePrevAsyncUpdates = noop;
    ignoreUpdates = (updater) => {
      ignore.value = true;
      updater();
      ignore.value = false;
    };
    stop = watch$1(
      source,
      (...args) => {
        if (!ignore.value) filteredCb(...args);
      },
      watchOptions
    );
  } else {
    const disposables = [];
    const syncCounter = ref(0);
    const ignoreCounter = ref(0);
    ignorePrevAsyncUpdates = () => {
      ignoreCounter.value = syncCounter.value;
    };
    disposables.push(
      watch$1(
        source,
        () => {
          syncCounter.value++;
        },
        __spreadProps(__spreadValues({}, watchOptions), { flush: 'sync' })
      )
    );
    ignoreUpdates = (updater) => {
      const syncCounterPrev = syncCounter.value;
      updater();
      ignoreCounter.value += syncCounter.value - syncCounterPrev;
    };
    const resetAllCounter = () => {
      syncCounter.value = 0;
      ignoreCounter.value = 0;
    };
    disposables.push(
      watch$1(
        source,
        (...args) => {
          const ignore = ignoreCounter.value > 0 && ignoreCounter.value === syncCounter.value;
          resetAllCounter();
          if (ignore) return;
          filteredCb(...args);
        },
        watchOptions
      )
    );
    stop = () => {
      disposables.forEach((fn) => fn());
    };
  }
  return { stop, ignoreUpdates, ignorePrevAsyncUpdates };
};
const pausableWatch = (source, cb, options = {}) => {
  const _a = options,
    { eventFilter: filter } = _a,
    watchOptions = __objRest(_a, ['eventFilter']);
  const { eventFilter, pause, resume, isActive } = pausableFilter(filter);
  const stop = watchWithFilter(
    source,
    cb,
    __spreadProps(__spreadValues({}, watchOptions), {
      eventFilter
    })
  );
  return { stop, pause, resume, isActive };
};
const throttledWatch = (source, cb, options = {}) => {
  const _a = options,
    { throttle = 0, trailing = true, leading = true } = _a,
    watchOptions = __objRest(_a, ['throttle', 'trailing', 'leading']);
  return watchWithFilter(
    source,
    cb,
    __spreadProps(__spreadValues({}, watchOptions), {
      eventFilter: throttleFilter(throttle, trailing, leading)
    })
  );
};
const until = (r) => {
  let isNot = false;
  const toMatch = (condition, options = {}) => {
    let { timeout, deep = false, flush = 'sync', throwOnTimeout } = options;
    let stop = null;
    const watcher = new Promise((resolve) => {
      stop = watch$1(
        r,
        (v) => {
          if (condition(v) === !isNot) {
            stop == null ? void 0 : stop();
            resolve();
          }
        },
        {
          flush,
          deep,
          immediate: true
        }
      );
    });
    const promises = [watcher];
    if (timeout) {
      promises.push(promiseTimeout(timeout, throwOnTimeout).finally(() => (stop == null ? void 0 : stop())));
    }
    return Promise.race(promises);
  };
  const toBe = (value, options) => toMatch((v) => v === unref(value), options);
  const toBeTruthy = (options) => toMatch((v) => Boolean(v), options);
  const toBeNull = (options) => toBe(null, options);
  const toBeUndefined = (options) => toBe(void 0, options);
  const toBeNaN = (options) => toMatch(Number.isNaN, options);
  const toContains = (value, options) => {
    return toMatch((v) => {
      const array = Array.from(v);
      return array.includes(value) || array.includes(unref(value));
    }, options);
  };
  const changed = (options) => changedTimes(1, options);
  const changedTimes = (n = 1, options) => {
    let count = -1;
    return toMatch(() => {
      count += 1;
      return count >= n;
    }, options);
  };
  if (Array.isArray(unref(r))) {
    const instance = {
      toMatch,
      toContains,
      changed,
      changedTimes,
      get not () {
        isNot = !isNot;
        return this;
      }
    };
    return instance;
  } else {
    const instance = {
      toMatch,
      toBe,
      toBeTruthy,
      toBeNull,
      toBeNaN,
      toBeUndefined,
      changed,
      changedTimes,
      get not () {
        isNot = !isNot;
        return this;
      }
    };
    return instance;
  }
};
const watchAtMost = (source, cb, options = {}) => {
  const _a = options,
    { count } = _a,
    watchOptions = __objRest(_a, ['count']);
  const current = ref(0);
  const stop = watchWithFilter(
    source,
    (...args) => {
      current.value += 1;
      if (current.value >= unref(count)) {
        nextTick(stop);
      }
      cb(...args);
    },
    watchOptions
  );
  return { count: current, stop };
};
const watchOnce = (source, cb, options = {}) => {
  const stop = watch$1(
    source,
    (...args) => {
      nextTick(stop);
      return cb(...args);
    },
    options
  );
};
const whenever = (source, cb, options) => {
  return watch$1(
    source,
    (v, ov, onInvalidate) => {
      if (v) {
        cb(v, ov, onInvalidate);
      }
    },
    options
  );
};
const createSharedComposable = (composable) => {
  let subscribers = 0;
  let state, scope;
  const dispose = () => {
    if (scope && --subscribers <= 0) {
      scope.stop();
      state = scope = null;
    }
  };
  return (...args) => {
    subscribers++;
    if (!state) {
      scope = effectScope(true);
      state = scope.run(() => composable(...args));
    }
    onScopeDispose(dispose);
    return state;
  };
};
export {
  and,
  asyncComputed,
  autoResetRef,
  biSyncRef,
  bypassFilter,
  clamp,
  computedInject,
  controlledComputed,
  controlledRef,
  createEventHook,
  createFilterWrapper,
  reactify as createReactiveFn,
  createSharedComposable,
  createUnrefFn,
  debounceFilter,
  useDebounce as debouncedRef,
  debouncedWatch,
  eagerComputed,
  events,
  extendRef,
  get,
  ignorableWatch,
  isBoolean,
  isDefined,
  isFunction,
  isNumber,
  isString,
  isUndefined,
  makeDestructurable,
  noop,
  not,
  or,
  pausableFilter,
  pausableWatch,
  promiseTimeout,
  reactify,
  reactifyObject,
  reactivePick,
  refDefault,
  set,
  syncRef,
  throttleFilter,
  useThrottle as throttledRef,
  throttledWatch,
  timestamp,
  toReactive,
  toRefs,
  tryOnBeforeUnmount,
  tryOnMounted,
  tryOnScopeDispose,
  tryOnUnmounted,
  until,
  useAsyncQueue,
  useClamp,
  useConfirmDialog,
  useCounter,
  useCycleList,
  useDebounce,
  useDebounceFn,
  useEventBus,
  useInterval,
  useIntervalFn,
  useLastChanged,
  useMemoize,
  useMounted,
  useOffsetPagination,
  useTemplateRefsList,
  useThrottle,
  useThrottleFn,
  useTimeout,
  useTimeoutFn,
  useToggle,
  useVModel,
  useVModels,
  watchAtMost,
  watchOnce,
  watchWithFilter,
  whenever
};
