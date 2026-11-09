import { IConfigurationService } from '@manaratak/core';

export class EnvironmentConfigurationProvider {
  constructor(private env: Record<string, string | undefined> = process.env) {}
  get<T = any>(key: string): T {
    return this.env[key] as unknown as T;
  }
  getOptional<T = any>(key: string): T | undefined {
    return this.env[key] as unknown as T | undefined;
  }
}

export class EnvironmentLoader {
  constructor(private providers: any[]) {}
}

export class ZodEnvironmentValidator {}

export class ConfigurationRegistry implements IConfigurationService {
  private static instance: ConfigurationRegistry | null = null;
  private constructor(private env: Record<string, string | undefined> = process.env) {}

  static getInstance(): ConfigurationRegistry {
    if (!ConfigurationRegistry.instance) {
      ConfigurationRegistry.instance = new ConfigurationRegistry();
    }
    return ConfigurationRegistry.instance;
  }

  static async bootstrap(loader: any, validator: any): Promise<ConfigurationRegistry> {
    ConfigurationRegistry.instance = new ConfigurationRegistry();
    return ConfigurationRegistry.instance;
  }

  static isInitialized(): boolean {
    return ConfigurationRegistry.instance !== null;
  }

  static _reset(): void {
    ConfigurationRegistry.instance = null;
  }

  get<T = any>(key: string): T {
    return this.env[key] as unknown as T;
  }

  getOptional<T = any>(key: string): T | undefined {
    return this.env[key] as unknown as T | undefined;
  }
}

export class ProductionReadinessValidator {
  static validate(config: any): { ready: boolean; blockerCount: number; findings: any[] } {
    return { ready: true, blockerCount: 0, findings: [] };
  }
}

export function loadAppConfig(env: Record<string, string | undefined> = process.env): any {
  return env;
}
