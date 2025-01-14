import {expect} from 'chai';

import length from '../../lib/rules/length';

function nonEmptyMsg(verified?: boolean) {
    return {
        ...(verified == null ? {} : {verified}),
        message: 'Non-empty password required',
        code: 'nonEmpty',
    };
}

function atLeast(x: number, verified?: boolean) {
    return {
        ...(verified == null ? {} : {verified}),
        message: 'At least %d characters in length',
        code: 'lengthAtLeast',
        format: [x],
    };
}

function lengthValidate(minLength: number) {
    return function () {
        length.validate({minLength: minLength});
    };
}

describe('"length" rule', function () {
    describe('validate', function () {
        const errorRegex = /length expects minLength to be a non-zero number/;
        it('should fail when minLength is not a number or zero', function () {
            // @ts-expect-error testing runtime validation
            expect(lengthValidate(null)).to.throw(errorRegex);
            // @ts-expect-error testing runtime validation
            expect(lengthValidate(undefined)).to.throw(errorRegex);
            // @ts-expect-error testing runtime validation
            expect(lengthValidate(false)).to.throw(errorRegex);
            // @ts-expect-error testing runtime validation
            expect(lengthValidate(true)).to.throw(errorRegex);
            // @ts-expect-error testing runtime validation
            expect(lengthValidate('hello')).to.throw(errorRegex);
            // @ts-expect-error testing runtime validation
            expect(lengthValidate('123')).to.throw(errorRegex);
        });
        it('should work otherwise', function () {
            expect(lengthValidate(123)).not.to.throw(errorRegex);
        });
    });

    describe('explain', function () {
        it('should return ["Non-empty password required."] when minLength is 1', function () {
            expect(length.explain({minLength: 1})).to.be.deep.equal(nonEmptyMsg());
        });
        it('should return ["At least x characters in length"] when minLength is x', function () {
            expect(length.explain({minLength: 5})).to.be.deep.equal(atLeast(5));
        });
    });

    describe('missing', function () {
        it('should return describe missing fields on fail', function () {
            expect(length.missing({minLength: 1}, '')).to.be.deep.equal(nonEmptyMsg(false));
            expect(length.missing({minLength: 9}, 'hello')).to.be.deep.equal(atLeast(9, false));
        });
        it('should return verified on success', function () {
            expect(length.missing({minLength: 1}, 'hi')).to.be.deep.equal(nonEmptyMsg(true));
            expect(length.missing({minLength: 4}, 'hello')).to.be.deep.equal(atLeast(4, true));
            expect(length.missing({minLength: 4}, 'hello:B')).to.be.deep.equal(atLeast(4, true));
        });
    });

    describe('assert', function () {
        it('should return false if password.length < options.minLength', function () {
            expect(length.assert({minLength: 9}, 'hello')).to.be.equal(false);
        });
        it('should return true if password.length == options.minLength', function () {
            expect(length.assert({minLength: 4}, 'hello')).to.be.equal(true);
        });
        it('should return true if password.length > options.minLength', function () {
            expect(length.assert({minLength: 4}, 'hellobye')).to.be.equal(true);
        });
    });
});
