export type PasswordPolicyRuleExplaination = {
    code: string;
    message: string;
    format?: any[];
    items?: PasswordPolicyRuleExplaination[];
    verified?: boolean;
};

export type PasswordPolicyMissingResult = PasswordPolicyRuleExplaination & {verified: boolean};

export type PasswordPolicyRule<T> = {
    validate: (options: T) => void;
    assert: (options: T, password: string) => boolean;
    explain: (options: T) => PasswordPolicyRuleExplaination;
    missing: (options: T, password: string) => PasswordPolicyMissingResult;
};
