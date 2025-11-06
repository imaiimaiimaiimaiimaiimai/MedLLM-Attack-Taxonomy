import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { ExternalLink, Info, CheckSquare } from 'lucide-react';

export default function AttackCard({ attack, onViewDetails, onCompare, isSelected }) {
  const severityColor = {
    critical: 'critical',
    high: 'warning',
    medium: 'secondary',
  };

  return (
    <Card className={`h-full flex flex-col transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{attack.item}</CardTitle>
          {isSelected && (
            <CheckSquare className="h-5 w-5 text-primary flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={severityColor[attack.severity]} className="capitalize">
            {attack.severity}
          </Badge>
          {attack.successRate !== null && (
            <Badge variant="outline">
              {attack.successRate.toFixed(1)}% success
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Category */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Category</p>
          <p className="text-sm">{attack.category}</p>
        </div>

        {/* Description */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Description</p>
          <p className="text-sm line-clamp-3 text-muted-foreground">
            {attack.description || 'No description available'}
          </p>
        </div>

        {/* Modalities */}
        {attack.modalities && attack.modalities.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Modalities</p>
            <div className="flex flex-wrap gap-1">
              {attack.modalities.map((mod) => (
                <Badge key={mod} variant="outline" className="text-xs">
                  {mod}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Attack Types */}
        {attack.attackTypes && attack.attackTypes.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Attack Types</p>
            <div className="flex flex-wrap gap-1">
              {attack.attackTypes.slice(0, 3).map((type) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ))}
              {attack.attackTypes.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{attack.attackTypes.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Reference */}
        {attack.reference && (
          <div className="mb-2">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Reference</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {attack.reference.authors} ({attack.reference.year})
              </p>
              {attack.reference.url && (
                <a
                  href={attack.reference.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onViewDetails(attack)}
        >
          <Info className="h-4 w-4 mr-1" />
          Details
        </Button>
        <Button
          variant={isSelected ? "default" : "outline"}
          size="sm"
          className="flex-1"
          onClick={() => onCompare(attack)}
        >
          <CheckSquare className="h-4 w-4 mr-1" />
          {isSelected ? 'Selected' : 'Compare'}
        </Button>
      </CardFooter>
    </Card>
  );
}
