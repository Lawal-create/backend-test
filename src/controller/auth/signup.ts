import { Request, Response, NextFunction } from "express";
import logger from "../../utils/logger";
import formatLog from "../../utils/logger/formatLog";
import ApiError from "../../middlewares/errorHandler/ApiError";
import { successResponse } from "../../utils/responses";
import User from "../../model/userModel";
import {
  generateHashedValue,
  getBasicUserDetails
} from "../../utils/helpers/auth";

const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  logger.info(formatLog(req, "START: Register User Service"));
  const { firstName, lastName, emailAddress, password, role } = req.body;
  const user = await User.findOne({ where: { emailAddress: emailAddress } });
  if (user) return next(new ApiError(422, "The email Address already exist"));
  let data: User;
  try {
    const user = await User.create({
      firstName: firstName,
      lastName: lastName,
      emailAddress: emailAddress,
      password: generateHashedValue(password),
      role: role
    });
    data = user.toJSON();
    logger.info(formatLog(req, "END: Register User Service"));
    return successResponse(
      res,
      201,
      "Successfully Created A User Account",
      getBasicUserDetails(data)
    );
  } catch (err) {
    next(err);
  }
};

export default signup;
