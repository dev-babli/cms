import db from '@/lib/db';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  timestamp: string;
  uptime: number;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  responseTime?: number;
  metadata?: Record<string, any>;
}

export interface PerformanceMetrics {
  apiLatency: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  errorRate: number;
  requestRate: number;
  databaseLatency: number;
  memoryUsage: number;
  cpuUsage: number;
}

const startTime = Date.now();
const latencyRecords: number[] = [];
const errorCount: { [key: string]: number } = {};
const requestCount: { [key: string]: number } = {};

export class HealthMonitor {
  private static instance: HealthMonitor;

  static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }

  // Perform health check
  async check(): Promise<HealthStatus> {
    const checks: HealthCheck[] = [];

    // Database health
    checks.push(await this.checkDatabase());

    // Memory health
    checks.push(await this.checkMemory());

    // Disk space health
    checks.push(await this.checkDiskSpace());

    // API health
    checks.push(await this.checkAPI());

    // Overall status
    const failedChecks = checks.filter(c => c.status === 'fail').length;
    const warnChecks = checks.filter(c => c.status === 'warn').length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (failedChecks > 0) {
      overallStatus = 'unhealthy';
    } else if (warnChecks > 0) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      checks,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - startTime,
    };
  }

  private async checkDatabase(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      // Simple query to check database connectivity
      db.prepare('SELECT 1').get();
      
      const responseTime = Date.now() - start;

      return {
        name: 'database',
        status: responseTime < 100 ? 'pass' : 'warn',
        message: responseTime < 100 ? 'Database is healthy' : 'Database response time is slow',
        responseTime,
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Database connection failed',
        responseTime: Date.now() - start,
      };
    }
  }

  private async checkMemory(): Promise<HealthCheck> {
    try {
      const usage = process.memoryUsage();
      const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
      const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
      const percentage = (usedMB / totalMB) * 100;

      let status: 'pass' | 'warn' | 'fail' = 'pass';
      let message = `Memory usage: ${usedMB}MB / ${totalMB}MB (${percentage.toFixed(1)}%)`;

      if (percentage > 90) {
        status = 'fail';
        message = `High memory usage: ${percentage.toFixed(1)}%`;
      } else if (percentage > 75) {
        status = 'warn';
        message = `Elevated memory usage: ${percentage.toFixed(1)}%`;
      }

      return {
        name: 'memory',
        status,
        message,
        metadata: {
          heapUsed: usedMB,
          heapTotal: totalMB,
          percentage: percentage.toFixed(1),
        },
      };
    } catch (error) {
      return {
        name: 'memory',
        status: 'fail',
        message: 'Failed to check memory usage',
      };
    }
  }

  private async checkDiskSpace(): Promise<HealthCheck> {
    try {
      // Get database file size
      const dbSize = await this.getDatabaseSize();
      
      return {
        name: 'disk',
        status: 'pass',
        message: `Database size: ${(dbSize / 1024 / 1024).toFixed(2)}MB`,
        metadata: {
          databaseSize: dbSize,
        },
      };
    } catch (error) {
      return {
        name: 'disk',
        status: 'warn',
        message: 'Could not determine disk usage',
      };
    }
  }

  private async checkAPI(): Promise<HealthCheck> {
    const avgLatency = this.getAverageLatency();
    const errorRate = this.getErrorRate();

    let status: 'pass' | 'warn' | 'fail' = 'pass';
    let message = 'API is healthy';

    if (errorRate > 0.1) {
      status = 'fail';
      message = `High error rate: ${(errorRate * 100).toFixed(2)}%`;
    } else if (errorRate > 0.05) {
      status = 'warn';
      message = `Elevated error rate: ${(errorRate * 100).toFixed(2)}%`;
    } else if (avgLatency > 1000) {
      status = 'warn';
      message = `High API latency: ${avgLatency.toFixed(0)}ms`;
    }

    return {
      name: 'api',
      status,
      message,
      responseTime: avgLatency,
      metadata: {
        errorRate: (errorRate * 100).toFixed(2) + '%',
        avgLatency: avgLatency.toFixed(0) + 'ms',
      },
    };
  }

  // Track API request
  trackRequest(endpoint: string, latency: number, success: boolean): void {
    latencyRecords.push(latency);
    
    // Keep only last 1000 records
    if (latencyRecords.length > 1000) {
      latencyRecords.shift();
    }

    requestCount[endpoint] = (requestCount[endpoint] || 0) + 1;

    if (!success) {
      errorCount[endpoint] = (errorCount[endpoint] || 0) + 1;
    }
  }

  // Get performance metrics
  getMetrics(): PerformanceMetrics {
    const sorted = [...latencyRecords].sort((a, b) => a - b);
    const avg = sorted.reduce((sum, val) => sum + val, 0) / sorted.length || 0;
    const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;

    const totalRequests = Object.values(requestCount).reduce((sum, val) => sum + val, 0);
    const totalErrors = Object.values(errorCount).reduce((sum, val) => sum + val, 0);
    const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0;

    const uptime = Date.now() - startTime;
    const requestRate = totalRequests / (uptime / 1000); // requests per second

    const memUsage = process.memoryUsage();
    const memoryUsage = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    return {
      apiLatency: {
        avg,
        p50,
        p95,
        p99,
      },
      errorRate,
      requestRate,
      databaseLatency: 0, // Implement based on your needs
      memoryUsage,
      cpuUsage: 0, // Implement based on your needs
    };
  }

  private getAverageLatency(): number {
    if (latencyRecords.length === 0) return 0;
    return latencyRecords.reduce((sum, val) => sum + val, 0) / latencyRecords.length;
  }

  private getErrorRate(): number {
    const totalRequests = Object.values(requestCount).reduce((sum, val) => sum + val, 0);
    const totalErrors = Object.values(errorCount).reduce((sum, val) => sum + val, 0);
    return totalRequests > 0 ? totalErrors / totalRequests : 0;
  }

  private async getDatabaseSize(): Promise<number> {
    // Get approximate database size
    const fs = require('fs');
    const path = require('path');
    
    try {
      const dbPath = path.join(process.cwd(), 'content.db');
      const stats = fs.statSync(dbPath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  // Get endpoint statistics
  getEndpointStats(): Array<{
    endpoint: string;
    requests: number;
    errors: number;
    errorRate: number;
  }> {
    const stats: Array<{
      endpoint: string;
      requests: number;
      errors: number;
      errorRate: number;
    }> = [];

    for (const endpoint in requestCount) {
      const requests = requestCount[endpoint];
      const errors = errorCount[endpoint] || 0;
      const errorRate = requests > 0 ? errors / requests : 0;

      stats.push({
        endpoint,
        requests,
        errors,
        errorRate,
      });
    }

    return stats.sort((a, b) => b.requests - a.requests);
  }

  // Reset metrics
  reset(): void {
    latencyRecords.length = 0;
    Object.keys(errorCount).forEach(key => delete errorCount[key]);
    Object.keys(requestCount).forEach(key => delete requestCount[key]);
  }
}

export const healthMonitor = HealthMonitor.getInstance();




