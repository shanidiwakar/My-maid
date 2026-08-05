import { SetMetadata } from '@nestjs/common';

export const API_MESSAGE = 'API_MESSAGE';

export const ApiMessage = (message: string) =>
  SetMetadata(API_MESSAGE, message);