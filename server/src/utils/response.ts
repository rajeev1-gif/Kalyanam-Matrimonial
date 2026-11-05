import { Response } from 'express';

export function successResponse(
  res: Response,
  data: any = {},
  message: string = 'Success',
  statusCode: number = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(
  res: Response,
  message: string = 'Something went wrong',
  statusCode: number = 500,
  errors: any = null
) {
  const response: any = {
    success: false,
    message,
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
}

export default {
  successResponse,
  errorResponse,
};
