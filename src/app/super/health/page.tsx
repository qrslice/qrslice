import React from 'react';
import { SystemHealthClient } from './SystemHealthClient';

export const metadata = {
  title: 'System Health & Staff Permissions | QRslice Superadmin',
  description: 'Monitor database status, webhook health, WAL backups, error logs, and manage Staff Role-Based Access Control (RBAC).',
};

export default function SuperHealthPage() {
  return <SystemHealthClient />;
}
