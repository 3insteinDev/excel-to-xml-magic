import { User, Truck, Building2, UserCircle, Briefcase } from "lucide-react";
import type { CadastroType } from "@/utils/xmlConverter";

interface TypeSelectorProps {
  selectedType: CadastroType | null;
  onSelect: (type: CadastroType) => void;
}

const cadastroTypes = [
  {
    type: 'motorista' as CadastroType,
    label: 'Motorista',
    description: 'Cadastro de motoristas',
    icon: User,
  },
  {
    type: 'veiculo' as CadastroType,
    label: 'Veículo',
    description: 'Cadastro de veículos',
    icon: Truck,
  },
  {
    type: 'transportador' as CadastroType,
    label: 'Transportador',
    description: 'Cadastro de transportadores',
    icon: Building2,
  },
  {
    type: 'pessoa_fisica' as CadastroType,
    label: 'Pessoa Física',
    description: 'Cadastro de pessoa física',
    icon: UserCircle,
  },
  {
    type: 'pessoa_juridica' as CadastroType,
    label: 'Pessoa Jurídica',
    description: 'Cadastro de pessoa jurídica',
    icon: Briefcase,
  },
];

export function TypeSelector({ selectedType, onSelect }: TypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cadastroTypes.map((item, index) => {
        const Icon = item.icon;
        const isSelected = selectedType === item.type;
        
        return (
          <button
            key={item.type}
            onClick={() => onSelect(item.type)}
            className={`
              relative p-6 rounded-xl border transition-all duration-300 text-left
              animate-fade-in group
              ${isSelected 
                ? 'border-primary bg-primary/10 glow-primary' 
                : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'
              }
            `}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center mb-4
              transition-colors duration-300
              ${isSelected 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
              }
            `}>
              <Icon className="w-6 h-6" />
            </div>
            <h3 className={`font-semibold mb-1 transition-colors ${isSelected ? 'text-primary' : 'text-foreground'}`}>
              {item.label}
            </h3>
            <p className="text-sm text-muted-foreground">
              {item.description}
            </p>
            {isSelected && (
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            )}
          </button>
        );
      })}
    </div>
  );
}
