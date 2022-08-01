import {expect} from 'chai';

import createPolicy from '..';

describe('password-sheriff', function () {
    describe('createPolicy', function () {
        it('should support "low", "fair", "good" and "excellent" default policies', function () {
            const lowPolicy = createPolicy('low');
            const fairPolicy = createPolicy('fair');
            const goodPolicy = createPolicy('good');
            const excellentPolicy = createPolicy('excellent');

            expect(lowPolicy).to.be.ok;
            expect(fairPolicy).to.be.ok;
            expect(goodPolicy).to.be.ok;
            expect(excellentPolicy).to.be.ok;
        });

        it('should default to "none" when there is an invalid policy name', function () {
            const invalid = createPolicy('asd');

            expect(invalid).to.be.ok;
            expect(invalid.check('')).to.be.equal(false);
            expect(invalid.check('a')).to.be.equal(true);
        });
    });

    describe('assert', function () {
        it('should throw an exception when policy check fails', function () {
            const policy = createPolicy('none');
            expect(function () {
                policy.assert('');
            }).to.throw(/Password does not meet password policy/);
        });

        it('should not thrown an exception when policy check passes', function () {
            const policy = createPolicy('none');
            expect(function () {
                policy.assert('hello');
            }).not.to.throw(/Password does not meet password policy/);
        });
    });
});
