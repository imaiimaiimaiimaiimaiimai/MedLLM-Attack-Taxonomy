import { useState } from 'react';
import toast from 'react-hot-toast';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { ExternalLink, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { formatAPA, formatBibTeX, formatMLA, copyToClipboard } from '../../utils/citationUtils';

export default function ReferenceCard({ reference, attackCount, attacks }) {
  const [showAttacks, setShowAttacks] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState(null);

  const handleCopy = async (format) => {
    let citation;
    let formatName;
    switch (format) {
      case 'apa':
        citation = formatAPA(reference);
        formatName = 'APA';
        break;
      case 'bibtex':
        citation = formatBibTeX(reference);
        formatName = 'BibTeX';
        break;
      case 'mla':
        citation = formatMLA(reference);
        formatName = 'MLA';
        break;
      default:
        citation = formatAPA(reference);
        formatName = 'APA';
    }

    try {
      await copyToClipboard(citation);
      setCopiedFormat(format);
      toast.success(`${formatName} citation copied to clipboard`);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy citation');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{reference.authors}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{reference.year}</Badge>
              <Badge variant="secondary">{attackCount} attack{attackCount !== 1 ? 's' : ''}</Badge>
            </div>
          </div>
          {reference.url && (
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a
                href={reference.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Citation Preview (APA) */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Citation (APA)</p>
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-mono">{formatAPA(reference)}</p>
          </div>
        </div>

        {/* Related Attacks */}
        {attacks && attacks.length > 0 && (
          <div>
            <button
              onClick={() => setShowAttacks(!showAttacks)}
              className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2 hover:text-foreground transition-colors"
            >
              Related Attacks
              {showAttacks ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {showAttacks && (
              <div className="space-y-2 mt-2">
                {attacks.slice(0, 5).map((attack) => (
                  <div key={attack.id} className="flex items-start gap-2 p-2 bg-muted rounded-md">
                    <Badge
                      variant={
                        attack.severity === 'critical'
                          ? 'critical'
                          : attack.severity === 'high'
                          ? 'warning'
                          : 'secondary'
                      }
                      className="capitalize flex-shrink-0"
                    >
                      {attack.severity}
                    </Badge>
                    <p className="text-sm flex-1">{attack.item}</p>
                  </div>
                ))}
                {attacks.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    +{attacks.length - 5} more attacks
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 flex-wrap border-t pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCopy('apa')}
          className="flex-1 min-w-[100px]"
        >
          {copiedFormat === 'apa' ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              APA
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCopy('bibtex')}
          className="flex-1 min-w-[100px]"
        >
          {copiedFormat === 'bibtex' ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              BibTeX
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCopy('mla')}
          className="flex-1 min-w-[100px]"
        >
          {copiedFormat === 'mla' ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              MLA
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
