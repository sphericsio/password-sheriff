/* A rule should contain explain and rule methods */
// TODO explain explain
// TODO explain missing
// TODO explain assert

import {isNumber, isObject} from 'lodash';

import type {PasswordPolicyRule} from './types';

type LengthOptions = {
    minLength: number;
};

function assert(options: LengthOptions, password: string) {
    return !!password && options.minLength <= password.length;
}

function explain(options: LengthOptions) {
    if (options.minLength === 1) {
        return {
            message: 'Non-empty password required',
            code: 'nonEmpty',
        };
    }

    return {
        message: 'At least %d characters in length',
        format: [options.minLength],
        code: 'lengthAtLeast',
    };
}

const rule: PasswordPolicyRule<LengthOptions> = {
    validate: function (options) {
        if (!isObject(options)) {
            throw new Error('options should be an object');
        }

        if (!isNumber(options.minLength) || isNaN(options.minLength)) {
            throw new Error('length expects minLength to be a non-zero number');
        }

        return true;
    },
    explain: explain,
    missing: function (options, password: string) {
        return {
            ...explain(options),
            verified: !!assert(options, password),
        };
    },
    assert: assert,
};

export default rule;
