/**
 * Error thrown when asserting a policy against a password.
 *
 * @class PasswordPolicyError
 * @constructor
 *
 * @param {String} msg Descriptive message of the error
 */
export default class PasswordPolicyError extends Error {
    constructor(msg: string) {
        super(msg);
        this.name = 'PasswordPolicyError';
    }
}
