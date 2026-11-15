import { CircleAlert, CircleCheck, Clock } from 'lucide-react';
import { useIntl } from 'react-intl';

import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

import type { TConversionStatus } from '@/types';

interface IStatusBadgeProps {
  status: TConversionStatus;
  errorMessage?: string;
}

export function StatusBadge({ status, errorMessage }: IStatusBadgeProps) {
  const { formatMessage } = useIntl();
  const label = formatMessage({ id: `converter.status.${status}` });

  if (status === 'done') {
    return (
      <Badge className="bg-success-subtle text-success">
        <CircleCheck aria-hidden="true" />
        {label}
      </Badge>
    );
  }
  if (status === 'error') {
    return (
      <Badge variant="destructive" title={errorMessage}>
        <CircleAlert aria-hidden="true" />
        {label}
      </Badge>
    );
  }
  if (status === 'converting') {
    return (
      <Badge className="bg-info-subtle text-info">
        <Spinner size="sm" aria-hidden="true" />
        {label}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      <Clock aria-hidden="true" />
      {label}
    </Badge>
  );
}
