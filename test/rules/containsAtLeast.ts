import {expect} from 'chai';
import {PasswordCharset} from '../../lib/rules/contains';

import containsAtLeast, {charsets} from '../../lib/rules/containsAtLeast';
import {PasswordPolicyRuleExplaination} from '../../lib/rules/types';

function createMissingEntry(
    x: number,
    y: number,
    items: PasswordPolicyRuleExplaination[],
    verified?: boolean,
) {
    return {
        ...(verified == null ? {} : {verified}),
        message: 'At least %d of the following %d types of characters:',
        code: 'containsAtLeast',
        format: [x, y],
        items: items,
    };
}

function generateMessageFn(msg: string, code: string) {
    return function (verified?: boolean) {
        return {...(verified == null ? {} : {verified}), message: msg, code: code};
    };
}

const lowerCaseMessage = generateMessageFn('lower case letters (a-z)', 'lowerCase');
const upperCaseMessage = generateMessageFn('upper case letters (A-Z)', 'upperCase');
const numbersMessage = generateMessageFn('numbers (i.e. 0-9)', 'numbers');
const specialCharsMessage = generateMessageFn(
    'special characters (e.g. !@#$%^&*)',
    'specialCharacters',
);

function fourMessages(a?: boolean, b?: boolean, c?: boolean, d?: boolean) {
    return [lowerCaseMessage(a), upperCaseMessage(b), numbersMessage(c), specialCharsMessage(d)];
}
const fourCharsets = [
    charsets.lowerCase,
    charsets.upperCase,
    charsets.numbers,
    charsets.specialCharacters,
];

function createOptions(charsets) {
    return {atLeast: 3, expressions: charsets};
}

function containsAtLeastValidate(atLeast: number, expressions: PasswordCharset[]) {
    return function () {
        return containsAtLeast.validate({atLeast: atLeast, expressions: expressions});
    };
}

describe('"contains at least" rule', function () {
    describe('validate', function () {
        it('should fail if atLeast is not a number greater than 0', function () {
            const errorRegex = /atLeast should be a valid, non-NaN number, greater than 0/;

            // @ts-expect-error testing runtime validation
            expect(containsAtLeastValidate(-34)).to.throw(errorRegex);
            // @ts-expect-error testing runtime validation
            expect(containsAtLeastValidate(0)).to.throw(errorRegex);
            // @ts-expect-error testing runtime validation
            expect(containsAtLeastValidate('hello')).to.throw(errorRegex);
            // @ts-expect-error testing runtime validation
            expect(containsAtLeastValidate(undefined)).to.throw(errorRegex);
            // @ts-expect-error testing runtime validation
            expect(containsAtLeastValidate(false)).to.throw(errorRegex);
            // @ts-expect-error testing runtime validation
            expect(containsAtLeastValidate(true)).to.throw(errorRegex);
        });

        it('should fail if expressions is empty or not an array', function () {
            const errorRegex = /expressions should be an non-empty array/;

            expect(containsAtLeastValidate(3, [])).to.throw(errorRegex);
            // @ts-expect-error testing runtime validation
            expect(containsAtLeastValidate(3, undefined)).to.throw(errorRegex);
            // @ts-expect-error testing runtime validation
            expect(containsAtLeastValidate(3, null)).to.throw(errorRegex);
            // @ts-expect-error testing runtime validation
            expect(containsAtLeastValidate(3, true)).to.throw(errorRegex);
        });

        it('should fail if expressions array contains invalid items', function () {
            const entry = {test: () => false, explain: () => ({message: '', code: ''})};
            const errorRegex = /containsAtLeast expressions are invalid: An explain and a test function should be provided/;
            // @ts-expect-error testing runtime validation
            expect(containsAtLeastValidate(3, [1, 2, 3])).to.throw(errorRegex);
            // @ts-expect-error testing runtime validation
            expect(containsAtLeastValidate(3, ['hi', 'bye', 'woot'], entry, entry)).to.throw(
                errorRegex,
            );
            expect(
                // @ts-expect-error testing runtime validation
                containsAtLeastValidate(3, [{test: 'hi', explain: 'bye'}, entry, entry]),
            ).to.throw(errorRegex);
            expect(
                // @ts-expect-error testing runtime validation
                containsAtLeastValidate(3, [{test: () => false, explain: 'bye'}, entry, entry]),
            ).to.throw(errorRegex);
        });

        it('should fail if expressions array length is less than atLeast', function () {
            const errorRegex = /expressions length should be greater than atLeast/;
            const entry = {test: () => false, explain: () => ({message: '', code: ''})};
            expect(containsAtLeastValidate(3, [entry, entry])).to.throw(errorRegex);
        });

        it('should work otherwise', function () {
            const entry = {test: () => false, explain: () => ({message: '', code: ''})};
            expect(containsAtLeastValidate(3, [entry, entry, entry])).not.to.throw();
        });
    });

    let explained;
    describe('explain', function () {
        it('should return list with contained expressions', function () {
            const result = createMissingEntry(3, 4, fourMessages());
            expect(
                containsAtLeast.explain({atLeast: 3, expressions: fourCharsets}),
            ).to.be.deep.equal(result);
        });
    });

    describe('missing', function () {
        const state = [
            [false, false, false, false],
            [true, false, false, false],
            [true, true, false, false],
            [true, false, false, true],
            [true, true, true, false],
            [true, true, true, true],
        ];
        it('should return structure that explains what is missing', function () {
            explained = containsAtLeast.missing(createOptions(fourCharsets), '');
            expect(explained).to.be.deep.equal(
                createMissingEntry(3, 4, fourMessages(...state[0]), false),
            );

            explained = containsAtLeast.missing(createOptions(fourCharsets), 'hello');
            expect(explained).to.be.deep.equal(
                createMissingEntry(3, 4, fourMessages(...state[1]), false),
            );

            explained = containsAtLeast.missing(createOptions(fourCharsets), 'helloO');
            expect(explained).to.be.deep.equal(
                createMissingEntry(3, 4, fourMessages(...state[2]), false),
            );

            explained = containsAtLeast.missing(createOptions(fourCharsets), 'hello!');
            expect(explained).to.be.deep.equal(
                createMissingEntry(3, 4, fourMessages(...state[3]), false),
            );
        });

        it('should return an structure with verified == true when fulfilled', function () {
            explained = containsAtLeast.missing(createOptions(fourCharsets), 'helloO9');
            expect(explained).to.be.deep.equal(
                createMissingEntry(3, 4, fourMessages(...state[4]), true),
            );

            explained = containsAtLeast.missing(createOptions(fourCharsets), 'helloO9!');
            expect(explained).to.be.deep.equal(
                createMissingEntry(3, 4, fourMessages(...state[5]), true),
            );
        });
    });

    describe('assert', function () {
        it('should fail when it does not contain at least those minimum character groups', function () {
            expect(containsAtLeast.assert(createOptions(fourCharsets), 'hello')).to.be.equal(false);
            expect(containsAtLeast.assert(createOptions(fourCharsets), 'helloO')).to.be.equal(
                false,
            );
            expect(containsAtLeast.assert(createOptions(fourCharsets), 'hello3')).to.be.equal(
                false,
            );
        });

        it('should not fail when it does contain the minimum required character groups', function () {
            expect(containsAtLeast.assert(createOptions(fourCharsets), 'helloO!')).to.be.equal(
                true,
            );
            expect(containsAtLeast.assert(createOptions(fourCharsets), 'hello3!')).to.be.equal(
                true,
            );
        });
    });
});
