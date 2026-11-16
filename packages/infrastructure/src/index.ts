export class AsyncLogContext {}
export class PinoLoggerProvider {
  constructor(options?: any) {}
}
export class LoggerService {
  constructor(provider?: any, context?: any, config?: any) {}
  info(message: string, ...args: any[]): void {}
  warn(message: string, ...args: any[]): void {}
  error(message: string, ...args: any[]): void {}
  debug(message: string, ...args: any[]): void {}
}
export class RequestLogger {
  constructor(logger?: any, context?: any) {}
}
export class ErrorLogger {
  constructor(logger?: any, context?: any) {}
}
export class DefaultErrorSerializer {}
export class MonitoringService {
  constructor(provider?: any) {}
}
export class OtlpHttpMonitoringProvider {
  constructor(options?: any) {}
}
export class SecurityService {
  constructor(rateLimiter?: any, options?: any) {}
}
export class DatabaseHealthChecker {}
export class RedisHealthChecker {}
export function assertAssetReferenceIntegrityInstalled(): void {}
export class PrismaTranslationWorkspaceReadGateway {}
export class PrismaTranslationImportGateway {}
