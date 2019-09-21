/** @license React vundefined
 * react-noop-renderer-persistent.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const regeneratorRuntime = require("regenerator-runtime");

if (process.env.NODE_ENV !== "production") {
  (function() {
'use strict';

var ReactFiberPersistentReconciler = require('react-reconciler/persistent');
var _assign = require('object-assign');
var Scheduler = require('scheduler/unstable_mock');
var expect = require('expect');
var React = require('react');

// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
var hasSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;



 // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
// (unstable) APIs that have been removed. Can we remove the symbols?

function createPortal(children, containerInfo, // TODO: figure out the API for cross-renderer implementation.
implementation) {
  var key = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  return {
    // This tag allow us to uniquely identify this as a React Portal
    $$typeof: REACT_PORTAL_TYPE,
    key: key == null ? null : '' + key,
    children: children,
    containerInfo: containerInfo,
    implementation: implementation
  };
}

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */
var warningWithoutStack = function () {};

{
  warningWithoutStack = function (condition, format) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    if (format === undefined) {
      throw new Error('`warningWithoutStack(condition, format, ...args)` requires a warning ' + 'message argument');
    }

    if (args.length > 8) {
      // Check before the condition to catch violations early.
      throw new Error('warningWithoutStack() currently supports at most 8 arguments.');
    }

    if (condition) {
      return;
    }

    if (typeof console !== 'undefined') {
      var argsWithFormat = args.map(function (item) {
        return '' + item;
      });
      argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
      // breaks IE9: https://github.com/facebook/react/issues/13610

      Function.prototype.apply.call(console.error, console, argsWithFormat);
    }

    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      var argIndex = 0;
      var message = 'Warning: ' + format.replace(/%s/g, function () {
        return args[argIndex++];
      });
      throw new Error(message);
    } catch (x) {}
  };
}

var warningWithoutStack$1 = warningWithoutStack;

var didWarnAboutMessageChannel = false;
var enqueueTask;

try {
  // read require off the module object to get around the bundlers.
  // we don't want them to detect a require and bundle a Node polyfill.
  var requireString = ('require' + Math.random()).slice(0, 7);
  var nodeRequire = module && module[requireString]; // assuming we're in node, let's try to get node's
  // version of setImmediate, bypassing fake timers if any.

  enqueueTask = nodeRequire('timers').setImmediate;
} catch (_err) {
  // we're in a browser
  // we can't use regular timers because they may still be faked
  // so we try MessageChannel+postMessage instead
  enqueueTask = function (callback) {
    {
      if (didWarnAboutMessageChannel === false) {
        didWarnAboutMessageChannel = true;
        !(typeof MessageChannel !== 'undefined') ? warningWithoutStack$1(false, 'This browser does not have a MessageChannel implementation, ' + 'so enqueuing tasks via await act(async () => ...) will fail. ' + 'Please file an issue at https://github.com/facebook/react/issues ' + 'if you encounter this warning.') : void 0;
      }
    }

    var channel = new MessageChannel();
    channel.port1.onmessage = callback;
    channel.port2.postMessage(undefined);
  };
}

var enqueueTask$1 = enqueueTask;

var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED; // Prevent newer renderers from RTE when used with older react package versions.
// Current owner and dispatcher used to share the same ref,
// but PR #14548 split them out to better support the react-debug-tools package.

if (!ReactSharedInternals.hasOwnProperty('ReactCurrentDispatcher')) {
  ReactSharedInternals.ReactCurrentDispatcher = {
    current: null
  };
}

if (!ReactSharedInternals.hasOwnProperty('ReactCurrentBatchConfig')) {
  ReactSharedInternals.ReactCurrentBatchConfig = {
    suspense: null
  };
}

var LegacyRoot = 0;
var BatchedRoot = 1;
var ConcurrentRoot = 2;

/**
 * This is a renderer of React that doesn't have a render target output.
 * It is useful to demonstrate the internals of the reconciler in isolation
 * and for testing semantics of reconciliation separate from the host
 * environment.
 */
var IsSomeRendererActing = ReactSharedInternals.IsSomeRendererActing;
var NO_CONTEXT = {};
var UPPERCASE_CONTEXT = {};
var UPDATE_SIGNAL = {};

{
  Object.freeze(NO_CONTEXT);
  Object.freeze(UPDATE_SIGNAL);
}

function createReactNoop(reconciler, useMutation) {
  var instanceCounter = 0;
  var hostDiffCounter = 0;
  var hostUpdateCounter = 0;
  var hostCloneCounter = 0;

  function appendChildToContainerOrInstance(parentInstance, child) {
    var index = parentInstance.children.indexOf(child);

    if (index !== -1) {
      parentInstance.children.splice(index, 1);
    }

    parentInstance.children.push(child);
  }

  function appendChildToContainer(parentInstance, child) {
    if (typeof parentInstance.rootID !== 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error('appendChildToContainer() first argument is not a container.');
    }

    appendChildToContainerOrInstance(parentInstance, child);
  }

  function appendChild(parentInstance, child) {
    if (typeof parentInstance.rootID === 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error('appendChild() first argument is not an instance.');
    }

    appendChildToContainerOrInstance(parentInstance, child);
  }

  function insertInContainerOrInstanceBefore(parentInstance, child, beforeChild) {
    var index = parentInstance.children.indexOf(child);

    if (index !== -1) {
      parentInstance.children.splice(index, 1);
    }

    var beforeIndex = parentInstance.children.indexOf(beforeChild);

    if (beforeIndex === -1) {
      throw new Error('This child does not exist.');
    }

    parentInstance.children.splice(beforeIndex, 0, child);
  }

  function insertInContainerBefore(parentInstance, child, beforeChild) {
    if (typeof parentInstance.rootID !== 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error('insertInContainerBefore() first argument is not a container.');
    }

    insertInContainerOrInstanceBefore(parentInstance, child, beforeChild);
  }

  function insertBefore(parentInstance, child, beforeChild) {
    if (typeof parentInstance.rootID === 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error('insertBefore() first argument is not an instance.');
    }

    insertInContainerOrInstanceBefore(parentInstance, child, beforeChild);
  }

  function removeChildFromContainerOrInstance(parentInstance, child) {
    var index = parentInstance.children.indexOf(child);

    if (index === -1) {
      throw new Error('This child does not exist.');
    }

    parentInstance.children.splice(index, 1);
  }

  function removeChildFromContainer(parentInstance, child) {
    if (typeof parentInstance.rootID !== 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error('removeChildFromContainer() first argument is not a container.');
    }

    removeChildFromContainerOrInstance(parentInstance, child);
  }

  function removeChild(parentInstance, child) {
    if (typeof parentInstance.rootID === 'string') {
      // Some calls to this aren't typesafe.
      // This helps surface mistakes in tests.
      throw new Error('removeChild() first argument is not an instance.');
    }

    removeChildFromContainerOrInstance(parentInstance, child);
  }

  function cloneInstance(instance, updatePayload, type, oldProps, newProps, internalInstanceHandle, keepChildren, recyclableInstance) {
    var clone = {
      id: instance.id,
      type: type,
      children: keepChildren ? instance.children : [],
      text: shouldSetTextContent(type, newProps) ? computeText(newProps.children + '', instance.context) : null,
      prop: newProps.prop,
      hidden: newProps.hidden === true,
      context: instance.context
    };
    Object.defineProperty(clone, 'id', {
      value: clone.id,
      enumerable: false
    });
    Object.defineProperty(clone, 'text', {
      value: clone.text,
      enumerable: false
    });
    Object.defineProperty(clone, 'context', {
      value: clone.context,
      enumerable: false
    });
    hostCloneCounter++;
    return clone;
  }

  function shouldSetTextContent(type, props) {
    if (type === 'errorInBeginPhase') {
      throw new Error('Error in host config.');
    }

    return typeof props.children === 'string' || typeof props.children === 'number';
  }

  function computeText(rawText, hostContext) {
    return hostContext === UPPERCASE_CONTEXT ? rawText.toUpperCase() : rawText;
  }

  var sharedHostConfig = {
    getRootHostContext: function () {
      return NO_CONTEXT;
    },
    getChildHostContext: function (parentHostContext, type, rootcontainerInstance) {
      if (type === 'uppercase') {
        return UPPERCASE_CONTEXT;
      }

      return NO_CONTEXT;
    },
    getPublicInstance: function (instance) {
      return instance;
    },
    createInstance: function (type, props, rootContainerInstance, hostContext) {
      if (type === 'errorInCompletePhase') {
        throw new Error('Error in host config.');
      }

      var inst = {
        id: instanceCounter++,
        type: type,
        children: [],
        text: shouldSetTextContent(type, props) ? computeText(props.children + '', hostContext) : null,
        prop: props.prop,
        hidden: props.hidden === true,
        context: hostContext
      }; // Hide from unit tests

      Object.defineProperty(inst, 'id', {
        value: inst.id,
        enumerable: false
      });
      Object.defineProperty(inst, 'text', {
        value: inst.text,
        enumerable: false
      });
      Object.defineProperty(inst, 'context', {
        value: inst.context,
        enumerable: false
      });
      return inst;
    },
    appendInitialChild: function (parentInstance, child) {
      parentInstance.children.push(child);
    },
    finalizeInitialChildren: function (domElement, type, props) {
      return false;
    },
    prepareUpdate: function (instance, type, oldProps, newProps) {
      if (type === 'errorInCompletePhase') {
        throw new Error('Error in host config.');
      }

      if (oldProps === null) {
        throw new Error('Should have old props');
      }

      if (newProps === null) {
        throw new Error('Should have new props');
      }

      hostDiffCounter++;
      return UPDATE_SIGNAL;
    },
    shouldSetTextContent: shouldSetTextContent,
    shouldDeprioritizeSubtree: function (type, props) {
      return !!props.hidden;
    },
    createTextInstance: function (text, rootContainerInstance, hostContext, internalInstanceHandle) {
      if (hostContext === UPPERCASE_CONTEXT) {
        text = text.toUpperCase();
      }

      var inst = {
        text: text,
        id: instanceCounter++,
        hidden: false,
        context: hostContext
      }; // Hide from unit tests

      Object.defineProperty(inst, 'id', {
        value: inst.id,
        enumerable: false
      });
      Object.defineProperty(inst, 'context', {
        value: inst.context,
        enumerable: false
      });
      return inst;
    },
    scheduleTimeout: setTimeout,
    cancelTimeout: clearTimeout,
    noTimeout: -1,
    prepareForCommit: function () {},
    resetAfterCommit: function () {},
    now: Scheduler.unstable_now,
    isPrimaryRenderer: true,
    warnsIfNotActing: true,
    supportsHydration: false,
    mountResponderInstance: function () {// NO-OP
    },
    unmountResponderInstance: function () {// NO-OP
    },
    getFundamentalComponentInstance: function (fundamentalInstance) {
      var impl = fundamentalInstance.impl,
          props = fundamentalInstance.props,
          state = fundamentalInstance.state;
      return impl.getInstance(null, props, state);
    },
    mountFundamentalComponent: function (fundamentalInstance) {
      var impl = fundamentalInstance.impl,
          instance = fundamentalInstance.instance,
          props = fundamentalInstance.props,
          state = fundamentalInstance.state;
      var onMount = impl.onUpdate;

      if (onMount !== undefined) {
        onMount(null, instance, props, state);
      }
    },
    shouldUpdateFundamentalComponent: function (fundamentalInstance) {
      var impl = fundamentalInstance.impl,
          instance = fundamentalInstance.instance,
          prevProps = fundamentalInstance.prevProps,
          props = fundamentalInstance.props,
          state = fundamentalInstance.state;
      var shouldUpdate = impl.shouldUpdate;

      if (shouldUpdate !== undefined) {
        return shouldUpdate(null, instance, prevProps, props, state);
      }

      return true;
    },
    updateFundamentalComponent: function (fundamentalInstance) {
      var impl = fundamentalInstance.impl,
          instance = fundamentalInstance.instance,
          prevProps = fundamentalInstance.prevProps,
          props = fundamentalInstance.props,
          state = fundamentalInstance.state;
      var onUpdate = impl.onUpdate;

      if (onUpdate !== undefined) {
        onUpdate(null, instance, prevProps, props, state);
      }
    },
    unmountFundamentalComponent: function (fundamentalInstance) {
      var impl = fundamentalInstance.impl,
          instance = fundamentalInstance.instance,
          props = fundamentalInstance.props,
          state = fundamentalInstance.state;
      var onUnmount = impl.onUnmount;

      if (onUnmount !== undefined) {
        onUnmount(null, instance, props, state);
      }
    },
    cloneFundamentalInstance: function (fundamentalInstance) {
      var instance = fundamentalInstance.instance;
      return {
        children: [],
        text: instance.text,
        type: instance.type,
        prop: instance.prop,
        id: instance.id,
        context: instance.context,
        hidden: instance.hidden
      };
    }
  };
  var hostConfig = useMutation ? _assign({}, sharedHostConfig, {
    supportsMutation: true,
    supportsPersistence: false,
    commitMount: function (instance, type, newProps) {// Noop
    },
    commitUpdate: function (instance, updatePayload, type, oldProps, newProps) {
      if (oldProps === null) {
        throw new Error('Should have old props');
      }

      hostUpdateCounter++;
      instance.prop = newProps.prop;
      instance.hidden = newProps.hidden === true;

      if (shouldSetTextContent(type, newProps)) {
        instance.text = computeText(newProps.children + '', instance.context);
      }
    },
    commitTextUpdate: function (textInstance, oldText, newText) {
      hostUpdateCounter++;
      textInstance.text = computeText(newText, textInstance.context);
    },
    appendChild: appendChild,
    appendChildToContainer: appendChildToContainer,
    insertBefore: insertBefore,
    insertInContainerBefore: insertInContainerBefore,
    removeChild: removeChild,
    removeChildFromContainer: removeChildFromContainer,
    hideInstance: function (instance) {
      instance.hidden = true;
    },
    hideTextInstance: function (textInstance) {
      textInstance.hidden = true;
    },
    unhideInstance: function (instance, props) {
      if (!props.hidden) {
        instance.hidden = false;
      }
    },
    unhideTextInstance: function (textInstance, text) {
      textInstance.hidden = false;
    },
    resetTextContent: function (instance) {
      instance.text = null;
    }
  }) : _assign({}, sharedHostConfig, {
    supportsMutation: false,
    supportsPersistence: true,
    cloneInstance: cloneInstance,
    createContainerChildSet: function (container) {
      return [];
    },
    appendChildToContainerChildSet: function (childSet, child) {
      childSet.push(child);
    },
    finalizeContainerChildren: function (container, newChildren) {
      container.pendingChildren = newChildren;
    },
    replaceContainerChildren: function (container, newChildren) {
      container.children = newChildren;
    },
    cloneHiddenInstance: function (instance, type, props, internalInstanceHandle) {
      var clone = cloneInstance(instance, null, type, props, props, internalInstanceHandle, true, null);
      clone.hidden = true;
      return clone;
    },
    cloneHiddenTextInstance: function (instance, text, internalInstanceHandle) {
      var clone = {
        text: instance.text,
        id: instanceCounter++,
        hidden: true,
        context: instance.context
      }; // Hide from unit tests

      Object.defineProperty(clone, 'id', {
        value: clone.id,
        enumerable: false
      });
      Object.defineProperty(clone, 'context', {
        value: clone.context,
        enumerable: false
      });
      return clone;
    }
  });
  var NoopRenderer = reconciler(hostConfig);
  var rootContainers = new Map();
  var roots = new Map();
  var DEFAULT_ROOT_ID = '<default>';
  var flushPassiveEffects = NoopRenderer.flushPassiveEffects,
      batchedUpdates = NoopRenderer.batchedUpdates,
      IsThisRendererActing = NoopRenderer.IsThisRendererActing; // this act() implementation should be exactly the same in
  // ReactTestUtilsAct.js, ReactTestRendererAct.js, createReactNoop.js

  var isSchedulerMocked = typeof Scheduler.unstable_flushAllWithoutAsserting === 'function';

  var flushWork = Scheduler.unstable_flushAllWithoutAsserting || function () {
    var didFlushWork = false;

    while (flushPassiveEffects()) {
      didFlushWork = true;
    }

    return didFlushWork;
  };

  function flushWorkAndMicroTasks(onDone) {
    try {
      flushWork();
      enqueueTask$1(function () {
        if (flushWork()) {
          flushWorkAndMicroTasks(onDone);
        } else {
          onDone();
        }
      });
    } catch (err) {
      onDone(err);
    }
  } // we track the 'depth' of the act() calls with this counter,
  // so we can tell if any async act() calls try to run in parallel.


  var actingUpdatesScopeDepth = 0;
  function act(callback) {
    var previousActingUpdatesScopeDepth = actingUpdatesScopeDepth;
    var previousIsSomeRendererActing;
    var previousIsThisRendererActing;
    actingUpdatesScopeDepth++;
    previousIsSomeRendererActing = IsSomeRendererActing.current;
    previousIsThisRendererActing = IsThisRendererActing.current;
    IsSomeRendererActing.current = true;
    IsThisRendererActing.current = true;

    function onDone() {
      actingUpdatesScopeDepth--;
      IsSomeRendererActing.current = previousIsSomeRendererActing;
      IsThisRendererActing.current = previousIsThisRendererActing;

      {
        if (actingUpdatesScopeDepth > previousActingUpdatesScopeDepth) {
          // if it's _less than_ previousActingUpdatesScopeDepth, then we can assume the 'other' one has warned
          warningWithoutStack$1(false, 'You seem to have overlapping act() calls, this is not supported. ' + 'Be sure to await previous act() calls before making a new one. ');
        }
      }
    }

    var result;

    try {
      result = batchedUpdates(callback);
    } catch (error) {
      // on sync errors, we still want to 'cleanup' and decrement actingUpdatesScopeDepth
      onDone();
      throw error;
    }

    if (result !== null && typeof result === 'object' && typeof result.then === 'function') {
      // setup a boolean that gets set to true only
      // once this act() call is await-ed
      var called = false;

      {
        if (typeof Promise !== 'undefined') {
          //eslint-disable-next-line no-undef
          Promise.resolve().then(function () {}).then(function () {
            if (called === false) {
              warningWithoutStack$1(false, 'You called act(async () => ...) without await. ' + 'This could lead to unexpected testing behaviour, interleaving multiple act ' + 'calls and mixing their scopes. You should - await act(async () => ...);');
            }
          });
        }
      } // in the async case, the returned thenable runs the callback, flushes
      // effects and  microtasks in a loop until flushPassiveEffects() === false,
      // and cleans up


      return {
        then: function (resolve, reject) {
          called = true;
          result.then(function () {
            if (actingUpdatesScopeDepth > 1 || isSchedulerMocked === true && previousIsSomeRendererActing === true) {
              onDone();
              resolve();
              return;
            } // we're about to exit the act() scope,
            // now's the time to flush tasks/effects


            flushWorkAndMicroTasks(function (err) {
              onDone();

              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          }, function (err) {
            onDone();
            reject(err);
          });
        }
      };
    } else {
      {
        !(result === undefined) ? warningWithoutStack$1(false, 'The callback passed to act(...) function ' + 'must return undefined, or a Promise. You returned %s', result) : void 0;
      } // flush effects until none remain, and cleanup


      try {
        if (actingUpdatesScopeDepth === 1 && (isSchedulerMocked === false || previousIsSomeRendererActing === false)) {
          // we're about to exit the act() scope,
          // now's the time to flush effects
          flushWork();
        }

        onDone();
      } catch (err) {
        onDone();
        throw err;
      } // in the sync case, the returned thenable only warns *if* await-ed


      return {
        then: function (resolve) {
          {
            warningWithoutStack$1(false, 'Do not await the result of calling act(...) with sync logic, it is not a Promise.');
          }

          resolve();
        }
      };
    }
  } // end act() implementation


  function childToJSX(child, text) {
    if (text !== null) {
      return text;
    }

    if (child === null) {
      return null;
    }

    if (typeof child === 'string') {
      return child;
    }

    if (Array.isArray(child)) {
      if (child.length === 0) {
        return null;
      }

      if (child.length === 1) {
        return childToJSX(child[0], null);
      } // $FlowFixMe


      var children = child.map(function (c) {
        return childToJSX(c, null);
      });

      if (children.every(function (c) {
        return typeof c === 'string' || typeof c === 'number';
      })) {
        return children.join('');
      }

      return children;
    }

    if (Array.isArray(child.children)) {
      // This is an instance.
      var instance = child;

      var _children = childToJSX(instance.children, instance.text);

      var props = {
        prop: instance.prop
      };

      if (instance.hidden) {
        props.hidden = true;
      }

      if (_children !== null) {
        props.children = _children;
      }

      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type: instance.type,
        key: null,
        ref: null,
        props: props,
        _owner: null,
        _store: {}
      };
    } // This is a text instance


    var textInstance = child;

    if (textInstance.hidden) {
      return '';
    }

    return textInstance.text;
  }

  function getChildren(root) {
    if (root) {
      return root.children;
    } else {
      return null;
    }
  }

  function getPendingChildren(root) {
    if (root) {
      return root.pendingChildren;
    } else {
      return null;
    }
  }

  function getChildrenAsJSX(root) {
    var children = childToJSX(getChildren(root), null);

    if (children === null) {
      return null;
    }

    if (Array.isArray(children)) {
      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type: REACT_FRAGMENT_TYPE,
        key: null,
        ref: null,
        props: {
          children: children
        },
        _owner: null,
        _store: {}
      };
    }

    return children;
  }

  function getPendingChildrenAsJSX(root) {
    var children = childToJSX(getChildren(root), null);

    if (children === null) {
      return null;
    }

    if (Array.isArray(children)) {
      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type: REACT_FRAGMENT_TYPE,
        key: null,
        ref: null,
        props: {
          children: children
        },
        _owner: null,
        _store: {}
      };
    }

    return children;
  }

  var idCounter = 0;
  var ReactNoop = {
    _Scheduler: Scheduler,
    getChildren: function () {
      var rootID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_ROOT_ID;
      var container = rootContainers.get(rootID);
      return getChildren(container);
    },
    getPendingChildren: function () {
      var rootID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_ROOT_ID;
      var container = rootContainers.get(rootID);
      return getPendingChildren(container);
    },
    getOrCreateRootContainer: function () {
      var rootID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_ROOT_ID;
      var tag = arguments.length > 1 ? arguments[1] : undefined;
      var root = roots.get(rootID);

      if (!root) {
        var container = {
          rootID: rootID,
          pendingChildren: [],
          children: []
        };
        rootContainers.set(rootID, container);
        root = NoopRenderer.createContainer(container, tag, false, null);
        roots.set(rootID, root);
      }

      return root.current.stateNode.containerInfo;
    },
    // TODO: Replace ReactNoop.render with createRoot + root.render
    createRoot: function () {
      var container = {
        rootID: '' + idCounter++,
        pendingChildren: [],
        children: []
      };
      var fiberRoot = NoopRenderer.createContainer(container, ConcurrentRoot, false, null);
      return {
        _Scheduler: Scheduler,
        render: function (children) {
          NoopRenderer.updateContainer(children, fiberRoot, null, null);
        },
        getChildren: function () {
          return getChildren(container);
        },
        getChildrenAsJSX: function () {
          return getChildrenAsJSX(container);
        }
      };
    },
    createSyncRoot: function () {
      var container = {
        rootID: '' + idCounter++,
        pendingChildren: [],
        children: []
      };
      var fiberRoot = NoopRenderer.createContainer(container, BatchedRoot, false, null);
      return {
        _Scheduler: Scheduler,
        render: function (children) {
          NoopRenderer.updateContainer(children, fiberRoot, null, null);
        },
        getChildren: function () {
          return getChildren(container);
        },
        getChildrenAsJSX: function () {
          return getChildrenAsJSX(container);
        }
      };
    },
    getChildrenAsJSX: function () {
      var rootID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_ROOT_ID;
      var container = rootContainers.get(rootID);
      return getChildrenAsJSX(container);
    },
    getPendingChildrenAsJSX: function () {
      var rootID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_ROOT_ID;
      var container = rootContainers.get(rootID);
      return getPendingChildrenAsJSX(container);
    },
    createPortal: function (children, container) {
      var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      return createPortal(children, container, null, key);
    },
    // Shortcut for testing a single root
    render: function (element, callback) {
      ReactNoop.renderToRootWithID(element, DEFAULT_ROOT_ID, callback);
    },
    renderLegacySyncRoot: function (element, callback) {
      var rootID = DEFAULT_ROOT_ID;
      var container = ReactNoop.getOrCreateRootContainer(rootID, LegacyRoot);
      var root = roots.get(container.rootID);
      NoopRenderer.updateContainer(element, root, null, callback);
    },
    renderToRootWithID: function (element, rootID, callback) {
      var container = ReactNoop.getOrCreateRootContainer(rootID, ConcurrentRoot);
      var root = roots.get(container.rootID);
      NoopRenderer.updateContainer(element, root, null, callback);
    },
    unmountRootWithID: function (rootID) {
      var root = roots.get(rootID);

      if (root) {
        NoopRenderer.updateContainer(null, root, null, function () {
          roots.delete(rootID);
          rootContainers.delete(rootID);
        });
      }
    },
    findInstance: function (componentOrElement) {
      if (componentOrElement == null) {
        return null;
      } // Unsound duck typing.


      var component = componentOrElement;

      if (typeof component.id === 'number') {
        return component;
      }

      {
        return NoopRenderer.findHostInstanceWithWarning(component, 'findInstance');
      }

      return NoopRenderer.findHostInstance(component);
    },
    flushNextYield: function () {
      Scheduler.unstable_flushNumberOfYields(1);
      return Scheduler.unstable_clearYields();
    },
    flushWithHostCounters: function (fn) {
      hostDiffCounter = 0;
      hostUpdateCounter = 0;
      hostCloneCounter = 0;

      try {
        Scheduler.unstable_flushAll();
        return useMutation ? {
          hostDiffCounter: hostDiffCounter,
          hostUpdateCounter: hostUpdateCounter
        } : {
          hostDiffCounter: hostDiffCounter,
          hostCloneCounter: hostCloneCounter
        };
      } finally {
        hostDiffCounter = 0;
        hostUpdateCounter = 0;
        hostCloneCounter = 0;
      }
    },
    expire: Scheduler.unstable_advanceTime,
    flushExpired: function () {
      return Scheduler.unstable_flushExpired();
    },
    batchedUpdates: NoopRenderer.batchedUpdates,
    deferredUpdates: NoopRenderer.deferredUpdates,
    unbatchedUpdates: NoopRenderer.unbatchedUpdates,
    discreteUpdates: NoopRenderer.discreteUpdates,
    flushDiscreteUpdates: NoopRenderer.flushDiscreteUpdates,
    flushSync: function (fn) {
      NoopRenderer.flushSync(fn);
    },
    flushPassiveEffects: NoopRenderer.flushPassiveEffects,
    act: act,
    // Logs the current state of the tree.
    dumpTree: function () {
      var _console;

      var rootID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_ROOT_ID;
      var root = roots.get(rootID);
      var rootContainer = rootContainers.get(rootID);

      if (!root || !rootContainer) {
        console.log('Nothing rendered yet.');
        return;
      }

      var bufferedLog = [];

      function log() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        bufferedLog.push.apply(bufferedLog, args.concat(['\n']));
      }

      function logHostInstances(children, depth) {
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          var indent = '  '.repeat(depth);

          if (typeof child.text === 'string') {
            log(indent + '- ' + child.text);
          } else {
            // $FlowFixMe - The child should've been refined now.
            log(indent + '- ' + child.type + '#' + child.id); // $FlowFixMe - The child should've been refined now.

            logHostInstances(child.children, depth + 1);
          }
        }
      }

      function logContainer(container, depth) {
        log('  '.repeat(depth) + '- [root#' + container.rootID + ']');
        logHostInstances(container.children, depth + 1);
      }

      function logUpdateQueue(updateQueue, depth) {
        log('  '.repeat(depth + 1) + 'QUEUED UPDATES');
        var firstUpdate = updateQueue.firstUpdate;

        if (!firstUpdate) {
          return;
        }

        log('  '.repeat(depth + 1) + '~', '[' + firstUpdate.expirationTime + ']');

        while (firstUpdate.next) {
          log('  '.repeat(depth + 1) + '~', '[' + firstUpdate.expirationTime + ']');
        }
      }

      function logFiber(fiber, depth) {
        log('  '.repeat(depth) + '- ' + ( // need to explicitly coerce Symbol to a string
        fiber.type ? fiber.type.name || fiber.type.toString() : '[root]'), '[' + fiber.childExpirationTime + (fiber.pendingProps ? '*' : '') + ']');

        if (fiber.updateQueue) {
          logUpdateQueue(fiber.updateQueue, depth);
        } // const childInProgress = fiber.progressedChild;
        // if (childInProgress && childInProgress !== fiber.child) {
        //   log(
        //     '  '.repeat(depth + 1) + 'IN PROGRESS: ' + fiber.pendingWorkPriority,
        //   );
        //   logFiber(childInProgress, depth + 1);
        //   if (fiber.child) {
        //     log('  '.repeat(depth + 1) + 'CURRENT');
        //   }
        // } else if (fiber.child && fiber.updateQueue) {
        //   log('  '.repeat(depth + 1) + 'CHILDREN');
        // }


        if (fiber.child) {
          logFiber(fiber.child, depth + 1);
        }

        if (fiber.sibling) {
          logFiber(fiber.sibling, depth);
        }
      }

      log('HOST INSTANCES:');
      logContainer(rootContainer, 0);
      log('FIBERS:');
      logFiber(root.current, 0);

      (_console = console).log.apply(_console, bufferedLog);
    },
    flushWithoutCommitting: function (expectedFlush) {
      var rootID = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_ROOT_ID;
      var root = roots.get(rootID);
      var expiration = NoopRenderer.computeUniqueAsyncExpiration();
      var batch = {
        _defer: true,
        _expirationTime: expiration,
        _onComplete: function () {
          root.firstBatch = null;
        },
        _next: null
      };
      root.firstBatch = batch;
      Scheduler.unstable_flushAllWithoutAsserting();
      var actual = Scheduler.unstable_clearYields();
      expect(actual).toEqual(expectedFlush);
      return function (expectedCommit) {
        batch._defer = false;
        NoopRenderer.flushRoot(root, expiration);
        expect(Scheduler.unstable_clearYields()).toEqual(expectedCommit);
      };
    },
    getRoot: function () {
      var rootID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_ROOT_ID;
      return roots.get(rootID);
    }
  };
  return ReactNoop;
}

/**
 * This is a renderer of React that doesn't have a render target output.
 * It is useful to demonstrate the internals of the reconciler in isolation
 * and for testing semantics of reconciliation separate from the host
 * environment.
 */
var ReactNoopPersistent = createReactNoop(ReactFiberPersistentReconciler, // reconciler
false // useMutation
);


var ReactNoopPersistent$2 = Object.freeze({
	default: ReactNoopPersistent
});

var ReactNoopPersistent$3 = ( ReactNoopPersistent$2 && ReactNoopPersistent ) || ReactNoopPersistent$2;

// TODO: decide on the top-level export form.
// This is hacky but makes it work with both Rollup and Jest.


var persistent = ReactNoopPersistent$3.default || ReactNoopPersistent$3;

module.exports = persistent;
  })();
}
