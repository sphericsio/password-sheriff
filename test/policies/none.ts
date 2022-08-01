import {expect} from 'chai';

import createPolicy from '../..';

const nonePolicyDescription = '* Non-empty password required';

describe('none policy:\n' + nonePolicyDescription, function () {
    const policy = createPolicy('none');
    describe('check', function () {
        it('should fail with invalid values', function () {
            // @ts-expect-error testing runtime validation
            expect(policy.check(undefined)).to.be.equal(false);
            // @ts-expect-error testing runtime validation
            expect(policy.check(null)).to.be.equal(false);
            // @ts-expect-error testing runtime validation
            expect(policy.check(0)).to.be.equal(false);
            // @ts-expect-error testing runtime validation
            expect(policy.check([])).to.be.equal(false);
            // @ts-expect-error testing runtime validation
            expect(policy.check({})).to.be.equal(false);
        });

        it('should fail with empty string', function () {
            expect(policy.check('')).to.be.equal(false);
        });
        it('should work with non-empty string', function () {
            expect(policy.check('a')).to.be.equal(true);
        });
    });
    describe('missing', function () {
        it('should inform verified false when fails', function () {
            const result = policy.missing('');

            expect(result.verified).to.be.equal(false);
            expect(result.rules.length).to.be.equal(1);
            expect(result.rules[0].message).to.be.equal(nonePolicyDescription.slice(2));
            expect(result.rules[0].verified).to.be.equal(false);
        });
        it('should inform verified true otherwise', function () {
            const result = policy.missing('hello');

            expect(result.verified).to.be.equal(true);
            expect(result.rules.length).to.be.equal(1);
            expect(result.rules[0].message).to.be.equal(nonePolicyDescription.slice(2));
            expect(result.rules[0].verified).to.be.equal(true);
        });
    });
    describe('toString', function () {
        it('should describe policy correctly', function () {
            expect(policy.toString()).to.equal(nonePolicyDescription);
        });
    });
});
