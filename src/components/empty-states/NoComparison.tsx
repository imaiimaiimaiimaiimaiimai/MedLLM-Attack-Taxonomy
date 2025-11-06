import { CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from './EmptyState';

export function NoComparison() {
  const navigate = useNavigate();

  return (
    <EmptyState
      icon={CheckSquare}
      title="No attacks selected for comparison"
      description="Select 2-3 attacks from the Explorer page to compare their features side-by-side."
      actionLabel="Go to Explorer"
      onAction={() => navigate('/explorer')}
    />
  );
}
