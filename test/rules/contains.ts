import {expect} from 'chai';

import contains, {charsets, PasswordCharset} from '../../lib/rules/contains';
import {PasswordPolicyRuleExplaination} from '../../lib/rules/types';

const specialCharactersRegexp = charsets.specialCharacters;

const upperAndSpecial = [charsets.upperCase, charsets.specialCharacters];

function upperCaseMessage(verified?: boolean) {
    return {
        ...(verified == null ? {} : {verified}),
        message: 'upper case letters (A-Z)',
        code: 'upperCase',
    };
}
function specialCharsMessage(verified?: boolean) {
    return {
        ...(verified == null ? {} : {verified}),
        message: 'special characters (e.g. !@#$%^&*)',
        code: 'specialCharacters',
    };
}

function createMissingEntry(items: PasswordPolicyRuleExplaination[], verified?: boolean) {
    return {
        ...(verified == null ? {} : {verified}),
        message: 'Should contain:',
        code: 'shouldContain',
        items: items,
    };
}

function containsValidate(expressions: PasswordCharset[]) {
    return function () {
        return contains.validate({expressions});
    };
}

describe('"contains" rule', function () {
    describe('explain', function () {
        it('should return list with contained expressions', function () {
            const explained = contains.explain({expressions: upperAndSpecial});
            expect(explained).to.be.deep.equal(
                createMissingEntry([upperCaseMessage(), specialCharsMessage()]),
            );
        });
    });

    describe('validate', function () {
        it('should fail if expressions is not an array', function () {
            const errorRegex = /contains expects expressions to be a non-empty array/;
            // @ts-expect-error testing errors
            expect(containsValidate(null)).to.throw(errorRegex);
            // @ts-expect-error testing errors
            expect(containsValidate(false)).to.throw(errorRegex);
            // @ts-expect-error testing errors
            expect(containsValidate(true)).to.throw(errorRegex);
            // @ts-expect-error testing errors
            expect(containsValidate('hello')).to.throw(errorRegex);
        });

        it('should fail if expressions array contains invalid items', function () {
            const errorRegex = /contains expressions are invalid: An explain and a test function should be provided/;
            // @ts-expect-error testing errors
            expect(containsValidate([1, 2, 3])).to.throw(errorRegex);
            // @ts-expect-error testing errors
            expect(containsValidate(['hi'])).to.throw(errorRegex);
            // @ts-expect-error testing errors
            expect(containsValidate([{test: 'hi', explain: 'bye'}])).to.throw(errorRegex);
            // @ts-expect-error testing errors
            expect(containsValidate([{test: () => false, explain: 'bye'}])).to.throw(errorRegex);
        });

        it('should fail if expressions is an empty array', function () {
            const errorRegex = /ontains expects expressions to be a non-empty array/;
            expect(containsValidate([])).to.throw(errorRegex);
        });

        it('should work otherwise', function () {
            expect(
                containsValidate([{test: () => false, explain: () => ({message: '', code: ''})}]),
            ).not.to.throw();
        });
    });

    describe('assert missing', function () {
        it('should return a structure with failed expressions', function () {
            let explained = contains.missing({expressions: upperAndSpecial}, 'hello');
            expect(explained).to.be.deep.equal(
                createMissingEntry([upperCaseMessage(false), specialCharsMessage(false)], false),
            );

            explained = contains.missing({expressions: upperAndSpecial}, 'helloA');
            expect(explained).to.be.deep.equal(
                createMissingEntry([upperCaseMessage(true), specialCharsMessage(false)], false),
            );

            explained = contains.missing({expressions: upperAndSpecial}, 'helloA!');
            expect(explained).to.be.deep.equal(
                createMissingEntry([upperCaseMessage(true), specialCharsMessage(true)], true),
            );
        });
    });

    describe('assert', function () {
        it('should return false if not all expressions are not fulfilled', function () {
            expect(contains.assert({expressions: upperAndSpecial}, 'hello')).to.be.equal(false);
            expect(contains.assert({expressions: upperAndSpecial}, 'hellO')).to.be.equal(false);
            expect(contains.assert({expressions: upperAndSpecial}, 'hell!')).to.be.equal(false);
        });
        it('should return assert all expressions are fulfilled', function () {
            expect(contains.assert({expressions: upperAndSpecial}, 'hellO!')).to.be.equal(true);
        });
    });

    describe('specialCharactersRegexp', function () {
        it('should handle all OWASP symbols correctly', function () {
            const symbols = [
                ' ',
                '!',
                '"',
                '#',
                '$',
                '%',
                '&',
                "'",
                '(',
                ')',
                '*',
                '+',
                ',',
                '-',
                '.',
                '/',
                ':',
                ';',
                '<',
                '=',
                '>',
                '?',
                '@',
                '[',
                '\\',
                ']',
                '^',
                '_',
                '`',
                '{',
                '|',
                '}',
                '~',
            ];

            expect(
                symbols.every(function (symbol) {
                    const value = specialCharactersRegexp.test(symbol);
                    if (!value) {
                        throw symbol;
                    }
                    return specialCharactersRegexp.test(symbol);
                }),
            ).to.equal(true);
        });

        it('should not handle characters that are non-symbols', function () {
            const alphanum = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');

            expect(
                alphanum.some(function (symbol) {
                    const value = specialCharactersRegexp.test(symbol);
                    if (value) {
                        throw symbol;
                    }
                    return specialCharactersRegexp.test(symbol);
                }),
            ).to.equal(false);
        });
    });
});
