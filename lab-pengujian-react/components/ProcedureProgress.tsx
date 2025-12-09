
import React, { useState } from 'react';
import {
  CheckCircle2, Clock, PlayCircle, XCircle, AlertCircle,
  ChevronDown, ChevronUp, User, Beaker, Lock
} from 'lucide-react';
import { RequestProcedureStep, StepStatus, PassFailStatus, ProcedureStatus } from '../types';

interface ProcedureProgressProps {
  templateName: string;
  templateVersion: string;
  status: ProcedureStatus;
  assignedAnalyst?: { id: number; name: string } | null;
  progressPercentage: number;
  steps: RequestProcedureStep[];
  onStepClick?: (step: RequestProcedureStep) => void;
  canExecute?: boolean;
}

const getStatusIcon = (status: StepStatus) => {
  switch (status) {
    case StepStatus.COMPLETED:
      return <CheckCircle2 size={20} className="text-green-500" />;
    case StepStatus.IN_PROGRESS:
      return <PlayCircle size={20} className="text-blue-500 animate-pulse" />;
    case StepStatus.FAILED:
      return <XCircle size={20} className="text-red-500" />;
    case StepStatus.SKIPPED:
      return <AlertCircle size={20} className="text-gray-400" />;
    default:
      return <Clock size={20} className="text-slate-300" />;
  }
};

const getStatusLabel = (status: StepStatus): string => {
  switch (status) {
    case StepStatus.COMPLETED:
      return 'Selesai';
    case StepStatus.IN_PROGRESS:
      return 'Sedang Berjalan';
    case StepStatus.FAILED:
      return 'Gagal';
    case StepStatus.SKIPPED:
      return 'Dilewati';
    default:
      return 'Menunggu';
  }
};

const getPassFailBadge = (status: PassFailStatus) => {
  switch (status) {
    case PassFailStatus.PASS:
      return (
        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
          LULUS
        </span>
      );
    case PassFailStatus.FAIL:
      return (
        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
          GAGAL
        </span>
      );
    default:
      return null;
  }
};

const getProcedureStatusBadge = (status: ProcedureStatus) => {
  switch (status) {
    case ProcedureStatus.DRAFT:
      return <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">Draft</span>;
    case ProcedureStatus.IN_PROGRESS:
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Sedang Diuji</span>;
    case ProcedureStatus.COMPLETED:
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Selesai</span>;
    case ProcedureStatus.REJECTED:
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">Ditolak</span>;
    case ProcedureStatus.NEEDS_REVISION:
      return <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">Perlu Revisi</span>;
    default:
      return null;
  }
};

export const ProcedureProgress: React.FC<ProcedureProgressProps> = ({
  templateName,
  templateVersion,
  status,
  assignedAnalyst,
  progressPercentage,
  steps,
  onStepClick,
  canExecute = false,
}) => {
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);

  const toggleStep = (stepId: number) => {
    setExpandedSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Beaker size={18} className="text-uii-blue" />
              {templateName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Versi {templateVersion}</p>
          </div>
          {getProcedureStatusBadge(status)}
        </div>

        {/* Analyst */}
        {assignedAnalyst && (
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
            <User size={16} className="text-slate-400" />
            <span>Analyst: <span className="font-medium">{assignedAnalyst.name}</span></span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                status === ProcedureStatus.COMPLETED
                  ? 'bg-green-500'
                  : status === ProcedureStatus.REJECTED
                    ? 'bg-red-500'
                    : 'bg-uii-blue'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="divide-y divide-gray-100">
        {steps.map((step, index) => {
          const isExpanded = expandedSteps.includes(step.id);
          const isLocked = step.status === StepStatus.PENDING && index > 0 && steps[index - 1].status !== StepStatus.COMPLETED;
          const canClick = canExecute && !isLocked && step.status !== StepStatus.COMPLETED;

          return (
            <div key={step.id} className="transition-colors hover:bg-slate-50">
              {/* Step Header */}
              <div
                className={`p-4 flex items-center gap-3 ${canClick ? 'cursor-pointer' : ''}`}
                onClick={() => canClick && onStepClick?.(step)}
              >
                {/* Step Icon */}
                <div className="flex-shrink-0">
                  {isLocked ? (
                    <Lock size={20} className="text-slate-300" />
                  ) : (
                    getStatusIcon(step.status)
                  )}
                </div>

                {/* Step Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400">#{step.stepOrder}</span>
                    <h4 className={`font-medium truncate ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
                      {step.name}
                    </h4>
                    {step.requiresApproval && (
                      <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                        Perlu Approval
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-xs ${
                      step.status === StepStatus.IN_PROGRESS
                        ? 'text-blue-600 font-medium'
                        : 'text-slate-500'
                    }`}>
                      {getStatusLabel(step.status)}
                    </span>
                    {step.completedAt && (
                      <span className="text-xs text-slate-400">{formatDate(step.completedAt)}</span>
                    )}
                    {getPassFailBadge(step.passFailStatus)}
                  </div>
                </div>

                {/* Expand Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStep(step.id);
                  }}
                  className="p-1 hover:bg-slate-200 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={18} className="text-slate-400" />
                  )}
                </button>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 ml-8 border-l-2 border-slate-100 ml-6">
                  <p className="text-sm text-slate-600 mb-3">{step.description}</p>

                  {/* Equipment */}
                  {step.equipment && step.equipment.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-slate-500 mb-1">Alat:</p>
                      <div className="flex flex-wrap gap-1">
                        {step.equipment.map((eq, i) => (
                          <span key={i} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Parameters */}
                  {step.parameters && step.parameters.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-slate-500 mb-1">Parameter:</p>
                      <div className="text-xs text-slate-600">
                        {step.parameters.map((p, i) => (
                          <span key={i} className="mr-3">
                            {p.name} ({p.unit})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Results */}
                  {step.results && Object.keys(step.results).length > 0 && (
                    <div className="mb-2 p-3 bg-green-50 rounded-lg">
                      <p className="text-xs font-medium text-green-700 mb-1">Hasil:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(step.results).map(([key, val]) => (
                          <div key={key} className="text-xs">
                            <span className="text-slate-500">{key}:</span>{' '}
                            <span className="font-medium text-slate-800">
                              {(val as any).value} {(val as any).unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {step.notes && (
                    <div className="p-2 bg-slate-50 rounded text-xs text-slate-600 italic">
                      "{step.notes}"
                    </div>
                  )}

                  {/* Executor */}
                  {step.executedBy && (
                    <p className="text-xs text-slate-400 mt-2">
                      Dilakukan oleh: {step.executedBy}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
