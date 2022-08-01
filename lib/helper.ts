// const _ = {};
// const root =
//     (typeof self == 'object' && self.self === self && self) ||
//     (typeof global == 'object' && global.global === global && global) ||
//     this ||
//     {};
// const nativeIsArray = Array.isArray;
// const nativeKeys = Object.keys;
// const ObjProto = Object.prototype;
// const toString = ObjProto.toString;

// const shallowProperty = function (key: string) {
//     return function <T extends Record<string, any>>(obj: T) {
//         return obj == null ? void 0 : obj[key];
//     };
// };

// const MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
// const getLength = shallowProperty('length');
// const isArrayLike = function (collection) {
//     const length = getLength(collection);
//     return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
// };

// // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.
// const typeNames = ['Arguments', 'Function', 'String', 'Number'];
// function loopAsign(name) {
//     _['is' + name] = function (obj) {
//         return toString.call(obj) === '[object ' + name + ']';
//     };
// }
// for (const a = 0; a < typeNames.length; a++) {
//     loopAsign(typeNames[a]);
// }

// const nodelist = root.document && root.document.childNodes;
// if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
//     _.isFunction = function (obj) {
//         return typeof obj == 'function' || false;
//     };
// }

// _.identity = function (value) {
//     return value;
// };

// _.keys = function (obj) {
//     if (!_.isObject(obj)) return [];
//     if (nativeKeys) return nativeKeys(obj);
//     const keys = [];
//     for (const key in obj) keys.push(key);
//     return keys;
// };

// _.isObject = function (obj) {
//     const type = typeof obj;
//     return type === 'function' || (type === 'object' && !!obj);
// };

// _.isArray =
//     nativeIsArray ||
//     function (obj) {
//         return toString.call(obj) === '[object Array]';
//     };

// _.isEmpty = function (obj) {
//     if (obj == null) return true;
//     if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)))
//         return obj.length === 0;
//     return _.keys(obj).length === 0;
// };

// _.isNaN = function (obj) {
//     return _.isNumber(obj) && isNaN(obj);
// };

import {isObject} from 'lodash';

// Code attribution
// Inlined and modified from https://github.com/browserify/node-util/blob/e37ce41f4063bcd7bc27e01470d6654053bdcd14/util.js#L33-L69
// Copyright Joyent, Inc. and other Node contributors.
// Please see LICENSE for full copyright and license attribution.
const formatRegExp = /%[sdj%]/g;

export function format(f: string, ..._params: any) {
    let i = 1;
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    const len = args.length;
    let str = String(f).replace(formatRegExp, function (x: string) {
        if (x === '%%') return '%';
        if (i >= len) return x;
        switch (x) {
            case '%s':
                return String(args[i++]);
            case '%d':
                return Number(args[i++]).toString();
            case '%j':
                try {
                    return JSON.stringify(args[i++]);
                } catch (_) {
                    return '[Circular]';
                }
            default:
                return x;
        }
    });
    for (let x = args[i]; i < len; x = args[++i]) {
        if (x === null || !isObject(x)) {
            str += ' ' + x;
        } else if (x !== null) {
            str += ' ' + JSON.stringify(x);
        }
    }
    return str;
}
// End code attribution
