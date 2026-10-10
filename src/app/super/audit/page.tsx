import { Metadata } from 'next';
import { AuditLogsClient } from './AuditLogsClient';

export const metadata: Metadata = {
  title: 'Audit Logs & Security | QRslice Superadmin',
  description: 'Immutable system audit trail tracking price edits, stock updates, workflow transitions, and refunds.',
};

export default function SuperAuditPage() {
  return <AuditLogsClient />;
}
