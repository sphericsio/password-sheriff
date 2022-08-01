import PasswordPolicy from './lib/policy';
import {charsets} from './lib/rules/contains';

export {default as PasswordPolicy} from './lib/policy';
export {charsets} from './lib/rules/contains';

const upperCase = charsets.upperCase;
const lowerCase = charsets.lowerCase;
const numbers = charsets.numbers;
const specialCharacters = charsets.specialCharacters;

const none = new PasswordPolicy({
    length: {minLength: 1},
});

const low = new PasswordPolicy({
    length: {minLength: 6},
});

const fair = new PasswordPolicy({
    length: {minLength: 8},
    contains: {
        expressions: [lowerCase, upperCase, numbers],
    },
});

const good = new PasswordPolicy({
    length: {minLength: 8},
    containsAtLeast: {
        atLeast: 3,
        expressions: [lowerCase, upperCase, numbers, specialCharacters],
    },
});

const excellent = new PasswordPolicy({
    length: {minLength: 10},
    containsAtLeast: {
        atLeast: 3,
        expressions: [lowerCase, upperCase, numbers, specialCharacters],
    },
    identicalChars: {max: 2},
});

const policiesByName: Record<string, PasswordPolicy<any>> = {
    none: none,
    low: low,
    fair: fair,
    good: good,
    excellent: excellent,
};

/**
 * Creates a password policy.
 *
 * @param {String} policyName Name of policy to use.
 */
export default function (policyName: string) {
    const policy = policiesByName[policyName] || policiesByName.none;

    return {
        /**
         * Checks that a password meets this policy
         *
         * @method check
         * @param {String} password
         */
        check: function (password: string) {
            return policy.check(password);
        },
        /**
         * @method assert
         * Asserts that a passord meets this policy else throws an exception.
         *
         * @param {String} password
         */
        assert: function (password: string) {
            return policy.assert(password);
        },

        missing: function (password: string) {
            return policy.missing(password);
        },

        missingAsMarkdown: function (password: string) {
            return policy.missingAsMarkdown(password);
        },

        explain: function () {
            return policy.explain();
        },

        /**
         * Friendly string representation of the policy
         * @method toString
         */
        toString: function () {
            return policy.toString();
        },
    };
}
