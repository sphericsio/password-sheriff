import assert from 'assert';
import {PasswordPolicy} from '..';

import {PasswordPolicyRule} from '../lib/rules/types';

// Custom rules

// Let's create a custom rule named Foo. The rule will enforce that
// "foo" is present at least `count` times.
type FooRuleConfig = {
    count: number;
};
const FooRule: PasswordPolicyRule<FooRuleConfig> = {
    validate(options) {
        if (!options) {
            throw new Error('options should be an object');
        }
        if (typeof options.count !== 'number') {
            throw new Error('count should be Number');
        }
        if (options.count !== (options.count | 0)) {
            throw new Error('count should be Integer');
        }
    },
    assert(options, password) {
        if (!password) {
            return false;
        }
        if (typeof password !== 'string') {
            throw new Error('password should be string');
        }

        let count = options.count;
        let lastIndex = 0;

        while (count > 0 && lastIndex !== -1) {
            lastIndex = password.indexOf('foo', lastIndex + 1);
            count--;
        }

        if (lastIndex === -1) {
            return false;
        }

        return true;
    },
    explain(options) {
        return {
            // identifier rule (to make i18n easier)
            code: 'foo',
            message: 'Foo should be present at least %d times.',
            format: [options.count],
        };
    },
    missing(options, password) {
        const explain = this.explain();
        explain.verified = this.assert(options, password);
        return explain;
    },
};

const fooOnlyPolicy = new PasswordPolicy({noFoo: {count: 3}}, {noFoo: FooRule});

assert.equal(true, fooOnlyPolicy.check('lalafooasdasdfooasddafooadsasd'));
assert.equal(false, fooOnlyPolicy.check('asd'));
