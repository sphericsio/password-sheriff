import {isObject, isEmpty, isFunction} from 'lodash';

import type {PasswordPolicyRule} from './types';

/* OWASP Special Characters: https://www.owasp.org/index.php/Password_special_characters */
const specialCharacters = [
    ' ',
    '!',
    '"',
    '#',
    '\\$',
    '%',
    '&',
    "'",
    '\\(',
    '\\)',
    '\\*',
    '\\+',
    ',',
    '-',
    '\\.',
    '/',
    ':',
    ';',
    '<',
    '=',
    '>',
    '\\?',
    '@',
    '\\[',
    '\\\\',
    '\\]',
    '\\^',
    '_',
    '`',
    '{',
    '\\|',
    '}',
    '~',
].join('|');

const specialCharactersRegexp = new RegExp(specialCharacters);

export type PasswordCharset = {
    explain: () => {message: string; code: string};
    test: (password: string) => boolean;
};

export const charsets: Record<
    'upperCase' | 'lowerCase' | 'specialCharacters' | 'numbers',
    PasswordCharset
> = {
    upperCase: {
        explain: function () {
            return {
                message: 'upper case letters (A-Z)',
                code: 'upperCase',
            };
        },
        test: function (password) {
            return /[A-Z]/.test(password);
        },
    },
    lowerCase: {
        explain: function () {
            return {
                message: 'lower case letters (a-z)',
                code: 'lowerCase',
            };
        },
        test: function (password) {
            return /[a-z]/.test(password);
        },
    },
    specialCharacters: {
        explain: function () {
            return {
                message: 'special characters (e.g. !@#$%^&*)',
                code: 'specialCharacters',
            };
        },
        test: function (password) {
            return specialCharactersRegexp.test(password);
        },
    },
    numbers: {
        explain: function () {
            return {
                message: 'numbers (i.e. 0-9)',
                code: 'numbers',
            };
        },
        test: function (password) {
            return /\d/.test(password);
        },
    },
};

type ContainsOptions = {
    expressions: PasswordCharset[];
};
const rule: PasswordPolicyRule<ContainsOptions> = {
    validate: function (options) {
        if (!isObject(options)) {
            throw new Error('options should be an object');
        }

        if (!Array.isArray(options.expressions) || isEmpty(options.expressions)) {
            throw new Error('contains expects expressions to be a non-empty array');
        }

        const ok = options.expressions.every(function (expression) {
            return isFunction(expression.explain) && isFunction(expression.test);
        });

        if (!ok) {
            throw new Error(
                'contains expressions are invalid: An explain and a test function should be provided',
            );
        }
        return true;
    },
    explain: function (options) {
        return {
            message: 'Should contain:',
            code: 'shouldContain',
            items: options.expressions.map(function (expression) {
                return expression.explain();
            }),
        };
    },
    missing: function (options, password) {
        const expressions = options.expressions.map(function (expression) {
            return {
                ...expression.explain(),
                verified: expression.test(password),
            };
        });

        const verified = expressions.every(function (expression) {
            return expression.verified;
        });

        return {
            message: 'Should contain:',
            code: 'shouldContain',
            verified: verified,
            items: expressions,
        };
    },
    assert: function (options, password) {
        if (!password) {
            return false;
        }

        return options.expressions.every(function (expression: any) {
            const result = expression.test(password);
            return result;
        });
    },
};

export default rule;
