"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatValidator = exports.signupValidator = exports.loginValidator = exports.validate = void 0;
const express_validator_1 = require("express-validator");
const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        res.status(422).json({ errors: errors.array() });
    };
};
exports.validate = validate;
exports.loginValidator = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Invalid email format"),
    (0, express_validator_1.body)("password")
        .trim()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
];
exports.signupValidator = [
    (0, express_validator_1.body)("name").notEmpty().withMessage("Name is required"),
    ...exports.loginValidator
];
exports.chatValidator = [
    (0, express_validator_1.body)("message").notEmpty().withMessage("Message is required"),
];
