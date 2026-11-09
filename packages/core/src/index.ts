export enum HealthStatus {
  UP = 'UP',
  DOWN = 'DOWN',
  DEGRADED = 'DEGRADED',
  UNKNOWN = 'UNKNOWN',
}

export interface IConfigurationService {
  get<T = any>(key: string): T;
  getOptional<T = any>(key: string): T | undefined;
}

export interface ILogger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

export interface ISecurityService {}
export interface IMonitoringService {}
export interface IRateLimiter {}
export interface ITokenProvider {}
export interface ISessionManager {}
