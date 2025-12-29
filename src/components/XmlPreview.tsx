import { useState } from "react";
import { Code, Edit3, Eye, Copy, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface XmlPreviewProps {
  xmls: string[];
  onXmlChange: (index: number, xml: string) => void;
}

export function XmlPreview({ xmls, onXmlChange }: XmlPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [page, setPage] = useState(0);

  const xml = xmls[page] || "";
  const lineCount = xml.split('\n').length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(xml);
    setCopied(true);
    toast({
      title: "Copiado!",
      description: "XML copiado para a área de transferência",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePageChange = (newPage: number) => {
    setIsEditing(false);
    setPage(newPage);
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Code className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Preview do XML</h3>
            <p className="text-sm text-muted-foreground">
              {lineCount} linhas geradas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="gap-2"
          >
            {isEditing ? (
              <>
                <Eye className="w-4 h-4" />
                Visualizar
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                Editar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm">
          {page + 1} / {xmls.length}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === xmls.length - 1}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="relative rounded-xl border border-border overflow-hidden bg-card">
        {isEditing ? (
          <Textarea
            value={xml}
            onChange={(e) => onXmlChange(page, e.target.value)}
            className="min-h-[400px] font-mono text-sm bg-transparent border-0 resize-none focus-visible:ring-0"
            spellCheck={false}
          />
        ) : (
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted/50 border-r border-border flex flex-col items-end pr-2 pt-4 text-xs text-muted-foreground font-mono select-none overflow-hidden">
              {xml.split('\n').slice(0, 50).map((_, i) => (
                <div key={i} className="h-5 leading-5">
                  {i + 1}
                </div>
              ))}
              {lineCount > 50 && (
                <div className="h-5 leading-5">...</div>
              )}
            </div>
            <pre className="p-4 pl-16 overflow-auto max-h-[400px] text-sm font-mono text-foreground leading-5">
              <code>{xml}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
