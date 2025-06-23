import {body, ValidationChain,validationResult} from 'express-validator';
import {Request, Response, NextFunction} from 'express';
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    res.status(422).json({ errors: errors.array() });
  };
}
export const loginValidator = [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password")
    .trim()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
]

export const signupValidator = [
    body("name").notEmpty().withMessage("Name is required"),
    ...loginValidator
]

export const chatValidator=[
  body("message").notEmpty().withMessage("Message is required"),
]