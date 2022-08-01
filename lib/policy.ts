import PasswordPolicyError from './policy_error';
import * as defaultRuleset from './rules';
import {PasswordPolicyRule, PasswordPolicyRuleExplaination} from './rules/types';
import {format} from './helper';

type RulesetOption<T> = T extends PasswordPolicyRule<infer R> ? R : never;
type RulesetOptions<T extends Record<string, PasswordPolicyRule<any>> = typeof defaultRuleset> = {
    [K in keyof T]: RulesetOption<T[K]>;
};

function isString(value: any) {
    return typeof value === 'string' || value instanceof String;
}

function flatDescriptions(descriptions: PasswordPolicyRuleExplaination[], index: number) {
    if (!descriptions.length) {
        return '';
    }

    function flatSingleDescription(description: PasswordPolicyRuleExplaination, index: number) {
        const spaces = new Array(index + 1).join(' ');
        let result = spaces + '* ';
        if (description.format) {
            result += format(description.message, ...description.format);
        } else {
            result += description.message;
        }

        if (description.items) {
            result += '\n' + spaces + flatDescriptions(description.items, index + 1);
        }
        return result;
    }

    const firstDescription = flatSingleDescription(descriptions[0], index);

    return descriptions.slice(1).reduce(function (result, description) {
        result += '\n' + flatSingleDescription(description, index);

        return result;
    }, firstDescription);
}

/**
 * Creates a PasswordPolicy which is a set of rules.
 *
 * @class PasswordPolicy
 * @constructor
 */
export default class PasswordPolicy<T extends Record<string, PasswordPolicyRule<any>>> {
    constructor(private rules: RulesetOptions<T>, private ruleset: T = defaultRuleset as any) {
        this._reduce((result, ruleOptions, rule) => {
            rule.validate(ruleOptions);
            return;
        });
    }

    private _reduce<V>(
        fn: (
            result: V,
            ruleOptions: RulesetOption<T[string]>,
            rule: PasswordPolicyRule<unknown>,
        ) => V,
        value?: V,
    ) {
        return Object.keys(this.rules).reduce((result, ruleName) => {
            const ruleOptions = this.rules[ruleName];
            const rule = this.ruleset[ruleName];

            return fn(result as V, ruleOptions, rule);
        }, value) as V;
    }

    private _applyRules(password: string) {
        return this._reduce(function (result, ruleOptions, rule) {
            // If previous result was false as this an &&, then nothing to do here!
            if (!result) {
                return false;
            }

            if (!rule) {
                return false;
            }

            return rule.assert(ruleOptions, password);
        }, true);
    }

    missing(password: string) {
        return this._reduce(
            function (result, ruleOptions, rule) {
                const missingRule = rule.missing(ruleOptions, password);
                result.rules.push(missingRule);
                result.verified = result.verified && !!missingRule.verified;
                return result;
            },
            {rules: [] as PasswordPolicyRuleExplaination[], verified: true},
        );
    }

    explain() {
        return this._reduce(function (result, ruleOptions, rule) {
            result.push(rule.explain(ruleOptions));
            return result;
        }, [] as PasswordPolicyRuleExplaination[]);
    }

    missingAsMarkdown(password: string) {
        return flatDescriptions(this.missing(password).rules, 1);
    }

    toString() {
        const descriptions = this.explain();
        return flatDescriptions(descriptions, 0);
    }

    check(password: string) {
        if (!isString(password)) {
            return false;
        }

        return this._applyRules(password);
    }

    assert(password: string) {
        if (!this.check(password)) {
            throw new PasswordPolicyError('Password does not meet password policy');
        }
    }
}
