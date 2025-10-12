import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';
import { LoggerService } from '../logger/logger.service';

/**
 * Guard to protect admin routes with API key authentication
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new LoggerService(ApiKeyGuard.name);
  
  constructor(private configService: ConfigService) {}
  
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const providedApiKey = this.extractKeyFromHeader(request);
    const apiKey = this.configService.get<string>('API_KEY');
    
    if (!apiKey) {
      this.logger.warn('API_KEY not set in environment configuration');
      return true; // Allow if API_KEY is not set (for development)
    }
    
    if (!providedApiKey) {
      this.logger.warn('API key missing in request');
      throw new UnauthorizedException('API key is required');
    }
    
    if (providedApiKey !== apiKey) {
      this.logger.warn('Invalid API key provided');
      throw new UnauthorizedException('Invalid API key');
    }
    
    return true;
  }
  
  private extractKeyFromHeader(request: FastifyRequest): string | undefined {
    // First check for standard header
    const apiKey = request.headers['x-api-key'];
    if (apiKey) {
      return Array.isArray(apiKey) ? apiKey[0] : apiKey;
    }
    
    // Then check for authorization header with "Bearer" prefix
    const authHeader = request.headers['authorization'];
    if (authHeader && typeof authHeader === 'string' && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }
    
    return undefined;
  }
}
