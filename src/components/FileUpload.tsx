import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, X, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onDataLoaded: (data: Record<string, unknown>[]) => void;
  expectedFields: string[];
}

export function FileUpload({ onDataLoaded, expectedFields }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState(0);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(firstSheet) as Record<string, unknown>[];
      
      if (data.length === 0) {
        setError("O arquivo está vazio ou não possui dados válidos.");
        return;
      }
      
      setFile(file);
      setRowCount(data.length);
      onDataLoaded(data);
    } catch (err) {
      setError("Erro ao processar o arquivo. Verifique se é um arquivo Excel válido.");
      console.error(err);
    }
  }, [onDataLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const isValidType = droppedFile.name.endsWith('.xlsx') || 
                          droppedFile.name.endsWith('.xls') ||
                          droppedFile.type.includes('spreadsheet');
      
      if (!isValidType) {
        setError("Por favor, envie um arquivo Excel (.xlsx ou .xls)");
        return;
      }
      
      processFile(droppedFile);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  }, [processFile]);

  const handleRemoveFile = () => {
    setFile(null);
    setRowCount(0);
    onDataLoaded([]);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center
            transition-all duration-300 cursor-pointer
            ${isDragging 
              ? 'border-primary bg-primary/5 glow-primary' 
              : 'border-border hover:border-primary/50 hover:bg-card/50'
            }
          `}
        >
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className={`
            w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
            transition-colors duration-300
            ${isDragging ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
          `}>
            <Upload className="w-8 h-8" />
          </div>
          <p className="text-lg font-medium text-foreground mb-2">
            Arraste seu arquivo Excel aqui
          </p>
          <p className="text-sm text-muted-foreground">
            ou clique para selecionar (.xlsx, .xls)
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-xl p-6 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {rowCount} registro{rowCount !== 1 ? 's' : ''} encontrado{rowCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <p className="text-sm text-muted-foreground mb-2">
          <strong className="text-foreground">Campos esperados:</strong>
        </p>
        <div className="flex flex-wrap gap-2">
          {expectedFields.slice(0, 10).map((field) => (
            <span
              key={field}
              className="px-2 py-1 text-xs rounded bg-secondary text-secondary-foreground font-mono"
            >
              {field}
            </span>
          ))}
          {expectedFields.length > 10 && (
            <span className="px-2 py-1 text-xs rounded bg-secondary text-secondary-foreground">
              +{expectedFields.length - 10} mais
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
