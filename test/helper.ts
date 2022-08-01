import {expect} from 'chai';

import {format} from '../lib/helper';

describe('helper', function () {
    describe('format', function () {
        it('can format a string', function () {
            expect(format('a string')).to.equal('a string');
        });

        it('can replace a string', function () {
            expect(format('%s', 'test')).to.equal('test');
        });

        it('can replace a string inside a string', function () {
            expect(format('a string: %s', 'test')).to.equal('a string: test');
        });

        it('can replace multiple strings', function () {
            expect(format('%s:%s', 'a', 'b')).to.equal('a:b');
        });

        it('can replace with a number', function () {
            expect(format('%d', 12)).to.equal('12');
        });

        it('can format an object', function () {
            expect(format('%j', {key: 'value'})).to.equal('{"key":"value"}');
        });
    });
});
