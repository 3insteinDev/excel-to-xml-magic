import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";

export type SendStatusType = 'idle' | 'sending' | 'success' | 'error';

interface SendStatusProps {
  status: SendStatusType;
  message?: string;
  details?: string;
}

export function SendStatus({ status, message, details }: SendStatusProps) {
  if (status === 'idle') return null;

  const configs = {
    sending: {
      icon: Loader2,
      iconClass: 'text-primary animate-spin',
      bgClass: 'bg-primary/10 border-primary/20',
      title: message || 'Enviando...',
    },
    success: {
      icon: CheckCircle2,
      iconClass: 'text-success',
      bgClass: 'bg-success/10 border-success/20 glow-success',
      title: message || 'Enviado com sucesso!',
    },
    error: {
      icon: XCircle,
      iconClass: 'text-destructive',
      bgClass: 'bg-destructive/10 border-destructive/20 glow-destructive',
      title: message || 'Erro ao enviar',
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <div className={`animate-fade-in rounded-xl border p-6 ${config.bgClass}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Icon className={`w-8 h-8 ${config.iconClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground">{config.title}</h4>
          {details && (
            <p className="mt-1 text-sm text-muted-foreground break-all">
              {details}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
