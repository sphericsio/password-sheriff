import {isObject, isNumber, isEmpty, isFunction} from 'lodash';

import {PasswordCharset} from './contains';
import type {PasswordPolicyRule} from './types';

export {charsets} from './contains';

function createIntroMessage() {
    return 'At least %d of the following %d types of characters:';
}

type ContainsAtLeastOptions = {
    atLeast: number;
    expressions: PasswordCharset[];
};
const rule: PasswordPolicyRule<ContainsAtLeastOptions> = {
    // TODO validate atLeast to be a number > 0 and expressions to be a list of at least 1
    validate: function (options) {
        if (!isObject(options)) {
            throw new Error('options should be an object');
        }

        if (!isNumber(options.atLeast) || isNaN(options.atLeast) || options.atLeast < 1) {
            throw new Error('atLeast should be a valid, non-NaN number, greater than 0');
        }

        if (!Array.isArray(options.expressions) || isEmpty(options.expressions)) {
            throw new Error('expressions should be an non-empty array');
        }

        if (options.expressions.length < options.atLeast) {
            throw new Error('expressions length should be greater than atLeast');
        }

        const ok = options.expressions.every(function (expression) {
            return isFunction(expression.explain) && isFunction(expression.test);
        });

        if (!ok) {
            throw new Error(
                'containsAtLeast expressions are invalid: An explain and a test function should be provided',
            );
        }

        return true;
    },
    explain: function (options) {
        return {
            message: createIntroMessage(),
            code: 'containsAtLeast',
            format: [options.atLeast, options.expressions.length],
            items: options.expressions.map(function (x) {
                return x.explain();
            }),
        };
    },
    missing: function (options, password) {
        const expressions =
            options.expressions &&
            options.expressions.map(function (expression) {
                return {
                    ...expression.explain(),
                    verified: expression.test(password),
                };
            });

        const verifiedCount = expressions.reduce(function (val, ex) {
            return val + (ex.verified ? 1 : 0);
        }, 0);
        const verified = verifiedCount >= options.atLeast;

        return {
            message: createIntroMessage(),
            code: 'containsAtLeast',
            format: [options.atLeast, options.expressions.length],
            items: expressions,
            verified: verified,
        };
    },
    assert: function (options, password) {
        if (!password) {
            return false;
        }

        const workingExpressions = options.expressions.filter(function (expression) {
            return expression.test(password);
        });

        return workingExpressions.length >= options.atLeast;
    },
};

export default rule;
