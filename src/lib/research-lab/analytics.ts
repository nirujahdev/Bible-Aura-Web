// Analytics and Monitoring for Research Lab Agents
// Tracks agent performance, usage, and errors

export interface AgentMetrics {
  agentType: string;
  successCount: number;
  errorCount: number;
  averageResponseTime: number;
  totalRequests: number;
  lastUsed?: string;
}

export interface ErrorLog {
  timestamp: string;
  agentType: string;
  errorType: string;
  errorMessage: string;
  context?: any;
}

// In-memory storage (in production, use database or analytics service)
const metricsStore = new Map<string, AgentMetrics>();
const errorLogs: ErrorLog[] = [];
const MAX_ERROR_LOGS = 1000;

/**
 * Track agent execution
 */
export function trackAgentExecution(
  agentType: string,
  success: boolean,
  responseTime: number,
  error?: any
): void {
  const key = agentType;
  const existing = metricsStore.get(key) || {
    agentType,
    successCount: 0,
    errorCount: 0,
    averageResponseTime: 0,
    totalRequests: 0,
  };

  existing.totalRequests++;
  existing.lastUsed = new Date().toISOString();

  if (success) {
    existing.successCount++;
    // Update average response time
    existing.averageResponseTime = 
      (existing.averageResponseTime * (existing.successCount - 1) + responseTime) / existing.successCount;
  } else {
    existing.errorCount++;
    // Log error
    if (errorLogs.length >= MAX_ERROR_LOGS) {
      errorLogs.shift(); // Remove oldest
    }
    errorLogs.push({
      timestamp: new Date().toISOString(),
      agentType,
      errorType: error?.name || error?.code || 'Unknown',
      errorMessage: error?.message || String(error),
      context: {
        responseTime,
        ...(error?.context || {}),
      },
    });
  }

  metricsStore.set(key, existing);
}

/**
 * Get metrics for an agent
 */
export function getAgentMetrics(agentType: string): AgentMetrics | null {
  return metricsStore.get(agentType) || null;
}

/**
 * Get all agent metrics
 */
export function getAllMetrics(): AgentMetrics[] {
  return Array.from(metricsStore.values());
}

/**
 * Get error logs
 */
export function getErrorLogs(agentType?: string, limit: number = 100): ErrorLog[] {
  let logs = errorLogs;
  
  if (agentType) {
    logs = logs.filter(log => log.agentType === agentType);
  }
  
  return logs.slice(-limit).reverse(); // Most recent first
}

/**
 * Get success rate for an agent
 */
export function getSuccessRate(agentType: string): number {
  const metrics = getAgentMetrics(agentType);
  if (!metrics || metrics.totalRequests === 0) {
    return 0;
  }
  return (metrics.successCount / metrics.totalRequests) * 100;
}

/**
 * Get overall statistics
 */
export function getOverallStats(): {
  totalAgents: number;
  totalRequests: number;
  totalSuccess: number;
  totalErrors: number;
  averageResponseTime: number;
  overallSuccessRate: number;
} {
  const allMetrics = getAllMetrics();
  
  const totalRequests = allMetrics.reduce((sum, m) => sum + m.totalRequests, 0);
  const totalSuccess = allMetrics.reduce((sum, m) => sum + m.successCount, 0);
  const totalErrors = allMetrics.reduce((sum, m) => sum + m.errorCount, 0);
  const totalResponseTime = allMetrics.reduce((sum, m) => sum + (m.averageResponseTime * m.successCount), 0);
  const averageResponseTime = totalSuccess > 0 ? totalResponseTime / totalSuccess : 0;
  const overallSuccessRate = totalRequests > 0 ? (totalSuccess / totalRequests) * 100 : 0;

  return {
    totalAgents: allMetrics.length,
    totalRequests,
    totalSuccess,
    totalErrors,
    averageResponseTime,
    overallSuccessRate,
  };
}

/**
 * Clear metrics (useful for testing)
 */
export function clearMetrics(): void {
  metricsStore.clear();
  errorLogs.length = 0;
}

/**
 * Export metrics as JSON
 */
export function exportMetrics(): string {
  return JSON.stringify({
    metrics: getAllMetrics(),
    errorLogs: getErrorLogs(undefined, 100),
    stats: getOverallStats(),
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

