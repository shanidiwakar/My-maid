import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { API_MESSAGE } from '../decorators/api-message.decorator';

@Injectable()
export class ResponseInterceptor
    implements NestInterceptor {
    constructor(
        private readonly reflector: Reflector,
    ) { }
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<any> {
        const message =
            this.reflector.get<string>(
                API_MESSAGE,
                context.getHandler(),
            ) ?? 'Request successful';

        return next.handle().pipe(
            map((data) => ({
                success: true,
                message: message,
                data,
            })),
        );
    }
}