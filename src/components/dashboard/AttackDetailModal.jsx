import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { ExternalLink } from 'lucide-react';

export default function AttackDetailModal({ attack, open, onOpenChange }) {
  if (!attack) return null;

  const severityColor = {
    critical: 'critical',
    high: 'warning',
    medium: 'secondary',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl pr-8">{attack.item}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <Badge variant={severityColor[attack.severity]} className="capitalize">
                {attack.severity} Severity
              </Badge>
              {attack.successRate !== null && (
                <Badge variant="outline">
                  {attack.successRate.toFixed(1)}% Success Rate
                </Badge>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Category */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Category</h3>
            <p className="text-sm text-muted-foreground">{attack.category}</p>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-sm mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {attack.description || 'No description available'}
            </p>
          </div>

          {/* Modalities */}
          {attack.modalities && attack.modalities.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Attack Modalities</h3>
              <div className="flex flex-wrap gap-2">
                {attack.modalities.map((mod) => (
                  <Badge key={mod} variant="outline">
                    {mod}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Attack Types */}
          {attack.attackTypes && attack.attackTypes.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Attack Types</h3>
              <div className="flex flex-wrap gap-2">
                {attack.attackTypes.map((type) => (
                  <Badge key={type} variant="secondary">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {attack.tags && attack.tags.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {attack.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="capitalize">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Reference */}
          {attack.reference && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Reference</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-1">{attack.reference.authors}</p>
                <p className="text-sm text-muted-foreground mb-2">
                  Published: {attack.reference.year}
                </p>
                {attack.reference.url && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={attack.reference.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Paper
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Success Rate Details */}
          {attack.successRate !== null && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Success Rate</h3>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${attack.successRate}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-lg font-bold">
                    {attack.successRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
