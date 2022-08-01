import {isNumber, isObject} from 'lodash';

import type {PasswordPolicyRule} from './types';

type IdenticalCharsOptions = {
    max: number;
};

function assert(options: IdenticalCharsOptions, password: string) {
    if (!password) {
        return false;
    }

    const current: {c?: string; count: number} = {count: 0};

    for (let i = 0; i < password.length; i++) {
        if (current.c !== password[i]) {
            current.c = password[i];
            current.count = 1;
        } else {
            current.count++;
        }

        if (current.count > options.max) {
            return false;
        }
    }

    return true;
}

function explain(options: IdenticalCharsOptions) {
    const example = new Array(options.max + 2).join('a');
    const d = {
        message: 'No more than %d identical characters in a row (e.g., "%s" not allowed)',
        code: 'identicalChars',
        format: [options.max, example],
    };
    return d;
}

const rule: PasswordPolicyRule<IdenticalCharsOptions> = {
    validate: function (options: IdenticalCharsOptions) {
        if (!isObject(options)) {
            throw new Error('options should be an object');
        }

        if (!isNumber(options.max) || isNaN(options.max) || options.max < 1) {
            throw new Error('max should be a number greater than 1');
        }

        return true;
    },
    explain,
    missing: function (options, password) {
        return {...explain(options), verified: assert(options, password)};
    },
    assert: assert,
};

export default rule;
