import React, { useState } from 'react';
import {
  Terminal,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Hash,
  Play,
  Bug,
  ChevronDown,
  ChevronUp,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { AutomationRun, AutomationTask, TaskStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface AutomationRunsViewProps {
  automationRuns: AutomationRun[];
  onRetryTask: (taskId: string) => void;
  onSimulateWorkerFailure: () => void;
}

export const AutomationRunsView: React.FC<AutomationRunsViewProps> = ({
  automationRuns,
  onRetryTask,
  onSimulateWorkerFailure
}) => {
  const [expandedRunId, setExpandedRunId] = useState<string | null>(
    automationRuns.length > 0 ? automationRuns[0].id : null
  );

  return (
    <div className="space-y-4">
      {/* Worker Lifecycle & Idempotency Guide Banner */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900">
              Worker Execution Ledger & Idempotency Engine (TRD 7.5 & 7.6)
            </h3>
          </div>
          <p className="text-slate-500 mt-1 max-w-2xl leading-relaxed">
            All background operations run asynchronously with durable task IDs and idempotency keys. Failed tasks remain visible with retry eligibility; replaying a task cannot duplicate side-effects.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSimulateWorkerFailure}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-medium transition-colors"
            title="Simulate transient provider timeout to test error handling & idempotency"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Simulate Worker Timeout</span>
          </button>
        </div>
      </div>

      {/* Runs List */}
      <div className="space-y-3">
        {automationRuns.map((run) => {
          const isExpanded = expandedRunId === run.id;
          const failedTasks = run.tasks.filter((t) => t.status === 'failed' || t.status === 'retry_wait');
          const succeededTasks = run.tasks.filter((t) => t.status === 'succeeded');

          return (
            <div
              key={run.id}
              className="bg-white border border-slate-200/80 rounded-lg overflow-hidden shadow-2xs"
            >
              {/* Run Header */}
              <div
                onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-mono text-slate-700 font-bold text-xs">
                    {run.runType.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 capitalize">
                        {run.runType.replace('_', ' ')} Run
                      </span>
                      <StatusBadge status={run.status} size="sm" />
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>ID: {run.id}</span>
                      <span aria-hidden="true">·</span>
                      <span>Initiated by: {run.createdBy}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {new Date(run.startedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="hidden sm:flex items-center gap-3 text-slate-500 text-[11px]">
                    <span className="text-emerald-700 font-medium">
                      {succeededTasks.length} succeeded
                    </span>
                    {failedTasks.length > 0 && (
                      <span className="text-rose-700 font-medium">
                        {failedTasks.length} failed
                      </span>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Tasks Expansion */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  {run.errorSummary && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block">Execution Error Summary:</span>
                        <span>{run.errorSummary}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-700 block">
                      Underlying Task Ledger ({run.tasks.length} tasks)
                    </span>

                    {run.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 bg-white border border-slate-200 rounded-md text-xs space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 font-mono">
                                {task.taskType}
                              </span>
                              <StatusBadge status={task.status} size="sm" />
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                              Task ID: {task.id} · Attempts: {task.attemptCount}/{task.maxAttempts}
                            </div>
                          </div>

                          {/* Safe retry button (Appendix B Step 7) */}
                          {task.retryEligible && (
                            <button
                              onClick={() => onRetryTask(task.id)}
                              className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Safe Retry</span>
                            </button>
                          )}
                        </div>

                        {/* Error info */}
                        {task.errorMessage && (
                          <div className="p-2 bg-rose-50 border border-rose-200 rounded font-mono text-[11px] text-rose-800">
                            <strong>{task.errorCode}:</strong> {task.errorMessage}
                          </div>
                        )}

                        {/* Result summary */}
                        {task.resultSummary && (
                          <div className="p-2 bg-slate-50 rounded font-mono text-[11px] text-slate-700 border border-slate-100">
                            <strong>Output Summary:</strong> {JSON.stringify(task.resultSummary)}
                          </div>
                        )}

                        {/* Idempotency Key Lock */}
                        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span className="truncate max-w-md">
                            Idempotency Key: {task.idempotencyKey}
                          </span>
                          <span className="text-emerald-700 font-semibold">REPLAY SAFE</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
