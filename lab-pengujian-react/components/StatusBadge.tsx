
import React from 'react';
import { RequestStatus } from '../types';

interface StatusBadgeProps {
  status: RequestStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let colorClass = '';

  switch (status) {
    case RequestStatus.PENDING:
      colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
      break;
    case RequestStatus.APPROVED:
      colorClass = 'bg-indigo-100 text-indigo-800 border-indigo-200'; // Warna Indigo untuk Approved
      break;
    case RequestStatus.RECEIVED:
      colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
      break;
    case RequestStatus.IN_PROGRESS:
      colorClass = 'bg-purple-100 text-purple-800 border-purple-200';
      break;
    case RequestStatus.COMPLETED:
      colorClass = 'bg-green-100 text-green-800 border-green-200';
      break;
    case RequestStatus.DELIVERED:
      colorClass = 'bg-slate-100 text-slate-800 border-slate-200';
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800';
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {status}
    </span>
  );
};
