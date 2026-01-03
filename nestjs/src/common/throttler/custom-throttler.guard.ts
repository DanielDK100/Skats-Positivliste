import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ExecutionContext } from '@nestjs/common';

/**
 * Custom ThrottlerGuard that skips specific routes or IPs
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  /**
   * Check if request should be throttled
   * @param context Execution context
   * @returns boolean
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get request object
    const request = context.switchToHttp().getRequest();

    // Skip throttling for whitelisted IPs (e.g., internal services)
    const ip = request.ip;
    const whitelistedIps = ['127.0.0.1', '::1']; // Add trusted IPs here

    if (whitelistedIps.includes(ip)) {
      return true;
    }

    // Skip throttling for specific routes
    const { path } = request.route;
    const skipPaths = ['/health', '/metrics'];

    if (skipPaths.some((skipPath) => path?.includes(skipPath))) {
      return true;
    }

    // Apply throttling for all other requests
    return super.canActivate(context);
  }
}
