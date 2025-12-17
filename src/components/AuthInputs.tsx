import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";

interface AuthInputsProps {
  cnpj: string;
  token: string;
  onCnpjChange: (value: string) => void;
  onTokenChange: (value: string) => void;
}

function formatCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 14);
  
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12)}`;
}

export function AuthInputs({ cnpj, token, onCnpjChange, onTokenChange }: AuthInputsProps) {
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    onCnpjChange(formatted);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Autenticação</h3>
          <p className="text-sm text-muted-foreground">
            Dados obrigatórios para envio do XML
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="cnpj" className="text-foreground">
            CNPJ <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cnpj"
            type="text"
            placeholder="00.000.000/0000-00"
            value={cnpj}
            onChange={handleCnpjChange}
            className="bg-input border-border focus:border-primary font-mono"
          />
          <p className="text-xs text-muted-foreground">
            CNPJ da empresa responsável pelo envio
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="token" className="text-foreground">
            Token <span className="text-destructive">*</span>
          </Label>
          <Input
            id="token"
            type="text"
            placeholder="Digite o token de autenticação"
            value={token}
            onChange={(e) => onTokenChange(e.target.value)}
            className="bg-input border-border focus:border-primary font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Token de acesso à API
          </p>
        </div>
      </div>
    </div>
  );
}
