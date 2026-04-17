# Documentação Completa - XML Converter (Excel to XML Magic)

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Tipos de Cadastro](#tipos-de-cadastro)
3. [Fluxo Passo a Passo](#fluxo-passo-a-passo)
4. [Arquitetura do Projeto](#arquitetura-do-projeto)
5. [Componentes React](#componentes-react)
6. [Funções de Conversão e Formatação](#funções-de-conversão-e-formatação)
7. [Estruturas de Dados (Types)](#estruturas-de-dados-types)
8. [API Routes](#api-routes)
9. [Dados de Entrada](#dados-de-entrada)
10. [Tratamento de Erros](#tratamento-de-erros)

---

## Visão Geral

**XML Converter** é uma aplicação frontend que converte planilhas Excel em XMLs estruturados para diferentes tipos de cadastros (motoristas, veículos, transportadores, etc.).

### Funcionalidades Principais
- ✅ Suporte a 5 tipos de cadastro diferentes
- ✅ Upload de arquivos Excel (.xlsx, .xls)
- ✅ Conversão automática para XML com validações
- ✅ Preview e edição de XMLs antes do envio
- ✅ Envio para API com autenticação (CNPJ + Token)
- ✅ Validação de placas para veículos
- ✅ Formatação automática de números (CPF, CNH, CEP, etc.)
- ✅ Conversão de nomes de municípios para código IBGE
- ✅ Interface intuitiva com 5 passos

### Stack Tecnológico
- **React 19** com TypeScript
- **Vite** como bundler
- **Tailwind CSS** para estilização
- **Shadcn/ui** para componentes
- **React Query** para requisições
- **XLSX** para leitura de Excel
- **React Router** para navegação

---

## Tipos de Cadastro

### 1. **MOTORISTA** (`motorista`)
Cadastro de informações de motoristas

**Campos Obrigatórios:**
- `idUsuario`, `CPF`, `RG`, `ufRG`, `expedRG`, `dtExpedRG`
- `xNome`, `dtNascto`, `nomeMae`, `Sexo`, `Natural`
- `dtPrimHabilit`, `CEP`, `xLgr`, `nro`, `xBairro`, `xCpl`, `cMun`
- `nCNH`, `nSegCNH`, `catCNH`, `dtVencCNH`
- `PIS`, `xDocContrat`, `tpFunc`, `Email`, `Telefone`
- `tpCartao`, `nCartao`, `tpOpera`, `Raca`

**Envelope XML:** `<envMoto>`

---

### 2. **VEÍCULO** (`veiculo`)
Cadastro de informações de veículos

**Campos Obrigatórios:**
- `idUsuario`, `tpVeic`, `placa`, `RENAVAM`
- `tara`, `capKG`, `capM3`, `tpRod`, `tpCar`
- `UF`, `RNTRC`, `xDocProp`, `nEixos`
- `Cor`, `AnoFabric`, `AnoMod`, `Chassi`
- `Marca`, `Modelo`, `cMunEmplac`, `xDocAgreg`
- `xCNPJEmissor`, `nTAG`

**Envelope XML:** `<envVeic>`

**Validação Especial:** Filtra veículos por placas válidas (arquivo `placas-cadastrar.txt`)

---

### 3. **TRANSPORTADOR** (`transportador`)
Cadastro de proprietários/transportadores (pessoa física ou jurídica)

**Campos Obrigatórios (comuns):**
- `idUsuario`, `CEP`, `xLgr`, `nro`, `xBairro`, `xCpl`, `cMun`
- `RNTRC`, `dtVencRNTRC`, `tpProp`
- `tpCartao`, `nCartao`, `tpOpera`

**Para Pessoa Física (tipoPessoa = 1):**
- `CPF`, `RG`, `ufRG`, `expedRG`, `dtExpedRG`
- `xNome`, `dtNascto`, `Email`, `qtdDepend`, `Telefone`
- `Sexo`, `Natural`, `Raca`

**Para Pessoa Jurídica (tipoPessoa = 2):**
- `xCNPJEmpresa`, `xIE`, `xIM`
- `xRazaoSocial`, `xNomeFant`, `tpPart`
- `EmailEmpresa`, `TelefoneEmpresa`, `tpEmpresa`

**Envelope XML:** `<envProprietario>`

---

### 4. **PESSOA FÍSICA** (`pessoa_fisica`)
Cadastro de pessoa física com endereço

**Campos Obrigatórios:**
- `idUsuario`
- `CPF`, `RG`, `ufRG`, `expedRG`, `dtExpedRG`
- `xNome`, `dtNascto`, `Email`, `Telefone`
- `Sexo`, `Natural`, `Raca`
- `CEP`, `xLgr`, `nro`, `xBairro`, `xCpl`, `cMun`

**Envelope XML:** `<envParticipante>`

---

### 5. **PESSOA JURÍDICA** (`pessoa_juridica`)
Cadastro de pessoa jurídica com endereço

**Campos Obrigatórios:**
- `idUsuario`
- `xCNPJ`, `xIE`, `xIM`
- `xRazaoSocial`, `xNomeFant`, `tpPart`
- `Email`, `Telefone`, `RNTRC`
- `CEP`, `xLgr`, `nro`, `xBairro`, `xCpl`, `cMun`

**Envelope XML:** `<envParticipante>`

---

## Fluxo Passo a Passo

### **PASSO 1: Seleção do Tipo** 
**Componente:** `TypeSelector.tsx`
**Ações:**
1. Usuário visualiza 5 opções de cadastro em cards
2. Clica para selecionar o tipo desejado
3. Card selecionado fica destacado com glow effect
4. Dados anteriores são resetados

**Validação:** Tipo deve estar selecionado

---

### **PASSO 2: Upload do Arquivo Excel**
**Componente:** `FileUpload.tsx`
**Ações:**
1. Usuário pode arrastar arquivo ou clicar para selecionar
2. Sistema valida formato (.xlsx, .xls)
3. XLSX.js lê a primeira aba da planilha
4. Converte linhas em array de objetos JSON
5. Mostra preview dos campos esperados
6. Exibe quantidade de registros encontrados

**Validação:** 
- Arquivo deve estar em Excel (.xlsx ou .xls)
- Arquivo não pode estar vazio
- Deve ter pelo menos 1 registro

**Função:** `processFile()` → `XLSX.read()` → `sheet_to_json()`

---

### **PASSO 3: Autenticação**
**Componente:** `AuthInputs.tsx`
**Ações:**
1. Usuário insere CNPJ (com autoformatação)
2. Usuário insere Token de autenticação
3. Sistema valida CNPJ (14 dígitos após limpeza)
4. Sistema valida Token (não vazio)

**Validação:**
- CNPJ: Exatamente 14 dígitos
- Token: Mínimo 1 caractere
- Formato CNPJ final: `XX.XXX.XXX/XXXX-XX`

**Função:** `formatCNPJ()` → Remove símbolos e formata progressivamente

---

### **PASSO 4: Preview do XML**
**Componente:** `XmlPreview.tsx`
**Ações:**
1. Sistema chama `mapExcelRowToType()` para cada linha
2. Cada linha é convertida para XML com `convertToXml()`
3. Mostra preview de cada XML com paginação
4. Usuário pode:
   - Ver linhas numeradas
   - Editar XML manualmente
   - Copiar para clipboard
   - Navegar entre múltiplos registros

**Especial para Veículos:**
- Filtra por placas válidas antes de gerar XML
- Mostra toast com quantidade de ignoradas

**Função:** 
- `mapExcelRowToType()` → Transforma linha em objeto tipado
- `convertToXml()` → Gera XML estruturado
- `loadPlacasValidas()` → Carrega set de placas válidas

---

### **PASSO 5: Envio**
**Componente:** `SendStatus.tsx`
**Ações:**
1. Sistema faz POST para cada XML
2. Headers: `Content-Type: text/xml; charset=utf-8`
3. Envia para URL definida em `apiRoutes[selectedType]`
4. Mostra status (enviando, sucesso, erro)
5. Exibe contador de sucessos
6. Oferece opção para novo envio (reset)

**Função:** `handleSend()` → Fetch POST → Feedback visual

---

## Arquitetura do Projeto

```
src/
├── pages/
│   ├── Index.tsx           # Página principal com fluxo completo
│   └── NotFound.tsx        # Página 404
├── components/
│   ├── TypeSelector.tsx    # Seleção do tipo de cadastro
│   ├── FileUpload.tsx      # Upload e leitura Excel
│   ├── AuthInputs.tsx      # Inputs CNPJ e Token
│   ├── XmlPreview.tsx      # Visualização e edição XML
│   ├── SendStatus.tsx      # Status do envio
│   ├── StepIndicator.tsx   # Indicador de progresso
│   ├── NavLink.tsx         # Links de navegação
│   └── ui/                 # Componentes Shadcn
├── utils/
│   └── xmlConverter.ts     # 🔧 Funções principais de conversão
├── lib/
│   ├── apiRoutes.ts        # Rotas da API
│   └── utils.ts            # Utilitários genéricos
├── hooks/
│   ├── use-toast.ts        # Hook para notificações
│   └── use-mobile.tsx      # Hook para responsivo
├── types/
│   └── cadastro-xml.ts     # Tipos TypeScript
├── App.tsx                 # Configuração de routing
├── main.tsx                # Entry point
├── estados.json            # Mapeamento estado-código IBGE
├── municipios.json         # Mapeamento município-código IBGE
└── placas-cadastrar.txt    # Lista de placas válidas
```

---

## Componentes React

### 1. **TypeSelector** (`src/components/TypeSelector.tsx`)

```typescript
interface TypeSelectorProps {
  selectedType: CadastroType | null;
  onSelect: (type: CadastroType) => void;
}

export function TypeSelector({ selectedType, onSelect }: TypeSelectorProps)
```

**Funcionalidade:**
- Grid de 5 cards (1 col mobile, 2 sm, 3 lg, 5 xl)
- Cada card mostra ícone, label e descrição
- Seleção ativa destaca com border e background primário
- Animação fade-in com delay progressivo
- Ícones: User (motorista), Truck (veículo), Building2 (transportador), UserCircle (pessoa física), Briefcase (pessoa jurídica)

**Estados:**
- `isSelected`: booleano
- Hover effects com cores primárias

---

### 2. **FileUpload** (`src/components/FileUpload.tsx`)

```typescript
interface FileUploadProps {
  onDataLoaded: (data: Record<string, unknown>[]) => void;
  expectedFields: string[];
}

export function FileUpload({ onDataLoaded, expectedFields }: FileUploadProps)
```

**Funcionalidade:**
- Drag & drop zone com validação de tipo
- Input file hidden com aceita .xlsx e .xls
- Leitura com `XLSX.read()` e `sheet_to_json()`
- Preview de campo esperados (até 10)
- Mostra contador de registros
- Botão para remover arquivo selecionado
- Mensagens de erro com AlertCircle icon

**Estados:**
- `isDragging`: boolean
- `file`: File | null
- `error`: string | null
- `rowCount`: number

**Validações:**
- Extensão do arquivo
- Tipo MIME
- Arquivo não vazio

---

### 3. **AuthInputs** (`src/components/AuthInputs.tsx`)

```typescript
interface AuthInputsProps {
  cnpj: string;
  token: string;
  onCnpjChange: (value: string) => void;
  onTokenChange: (value: string) => void;
}

export function AuthInputs({ cnpj, token, onCnpjChange, onTokenChange }: AuthInputsProps)
```

**Funcionalidade:**
- 2 inputs em grid (1 col mobile, 2 md)
- CNPJ com autoformatação: `XX.XXX.XXX/XXXX-XX`
- Token input simples
- Labels com indicador de obrigatório (asterisco vermelho)
- Descrições de ajuda em texto pequeno
- Ícone Shield na cabeça

**Função `formatCNPJ(value)`:**
```
valor.length ≤ 2   → XX
valor.length ≤ 5   → XX.XXX
valor.length ≤ 8   → XX.XXX.XXX
valor.length ≤ 12  → XX.XXX.XXX/XXXX
valor.length = 14  → XX.XXX.XXX/XXXX-XX
```

---

### 4. **XmlPreview** (`src/components/XmlPreview.tsx`)

```typescript
interface XmlPreviewProps {
  xmls: string[];
  onXmlChange: (index: number, xml: string) => void;
}

export function XmlPreview({ xmls, onXmlChange }: XmlPreviewProps)
```

**Funcionalidade:**
- Modo visualização e edição
- Paginação de XMLs (Prev/Next buttons)
- Exibir contador `{page + 1} / {xmls.length}`
- Numeração de linhas (até 50 visíveis)
- Botão Copiar (com feedback "Copiado!")
- Textarea editable quando em modo edit
- Altura mínima 400px
- Font mono para código

**Estados:**
- `isEditing`: boolean
- `copied`: boolean
- `page`: number

**Eventos:**
- Copy via `navigator.clipboard.writeText()`
- Edit/View toggle
- Paginação entre XMLs

---

### 5. **SendStatus** (`src/components/SendStatus.tsx`)

```typescript
export type SendStatusType = 'idle' | 'sending' | 'success' | 'error';

interface SendStatusProps {
  status: SendStatusType;
  message?: string;
  details?: string;
}

export function SendStatus({ status, message, details }: SendStatusProps)
```

**Funcionalidade:**
- 4 estados visuais: idle (hidden), sending, success, error
- Ícone animado (spin para sending)
- Cores: primary (sending), success (sucesso), destructive (erro)
- Glow effect para sucesso/erro
- Mensagem customizável
- Detalhes em texto quebrado

**Ícones:**
- Loader2 (enviando) com spin
- CheckCircle2 (sucesso)
- XCircle (erro)
- AlertCircle (para padrão)

---

### 6. **StepIndicator** (`src/components/StepIndicator.tsx`)

```typescript
interface Step {
  number: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps)
```

**Funcionalidade:**
- Exibe 5 passos em linha horizontal
- Estados: completado (check icon, bg success), atual (glow effect, bg primary), futuro (bg muted)
- Conectores entre passos (linha, cor varia com conclusão)
- Labels ocultos em mobile (hidden sm:block)
- Animação suave de transição

**Passos:**
```
1. Tipo
2. Upload
3. Autenticação
4. Preview
5. Enviar
```

---

## Funções de Conversão e Formatação

### Core Converter Functions

#### 1. **`convertToXml(data, type, cnpj, token)`**
Converte array de dados em XML estruturado

```typescript
export function convertToXml(
  data: Record<string, unknown>[],
  type: CadastroType,
  cnpj: string,
  token: string
): string
```

**Estrutura do XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envMoto versao="1.00" xmlns="http://www.controleembarque.com.br">
  <Autentic>
    <xCNPJ>CNPJ_AQUI</xCNPJ>
    <xToken>TOKEN_AQUI</xToken>
  </Autentic>
  <Control>
    <!-- Dados do objeto -->
  </Control>
</envMoto>
```

**Comportamento:**
- Determina tag raiz baseado no tipo (`getEnvTag()`)
- Adiciona autenticação
- Envolve dados em `<Control>`
- Ordena especialmente para transportador
- Remove campos vazios/null

---

#### 2. **`mapExcelRowToType(row, type)`**
Mapeia linha Excel para objeto tipado com validações

```typescript
export function mapExcelRowToType(
  row: Record<string, unknown>,
  type: CadastroType
): Record<string, unknown>
```

**Por tipo:**

**MOTORISTA:**
- Formata CPF (11 dígitos)
- Converte datas Excel → ISO
- Resolve cMun por nome → código IBGE
- Formata CNH (11 dígitos)
- Formata PIS (11 dígitos)
- Limpa números de telefone
- Estrutura endereço aninhado
- Estrutura cartão aninhado

**VEÍCULO:**
- Formata RENAVAM (11 dígitos)
- Formata RNTRC (8 dígitos)
- Resolve UF → código IBGE
- Limpa documentos
- Estrutura TAG aninhado

**TRANSPORTADOR:**
- Verifica `tipoPessoa` (1 = física, 2 = jurídica)
- Se física: mapeia pFisica
- Se jurídica: mapeia pJuridica
- Campos comuns para ambos
- Flag `__forceTransportadorOrder` para ordem fixa

**PESSOA FÍSICA:**
- Estrutura pFisica com dados pessoais
- Estrutura Ender aninhado

**PESSOA JURÍDICA:**
- Estrutura pJuridica com dados empresa
- Estrutura Ender aninhado

---

### Data Formatting Functions

#### 3. **`formatCPF(cpf)`**
Garante 11 dígitos, completa com zeros à esquerda

```typescript
export function formatCPF(cpf: unknown): string
```

**Lógica:**
- Remove não-dígitos
- Pad left com '0' até 11 caracteres
- Retorna '00000000000' se vazio

**Exemplo:** `123456789` → `00123456789`

---

#### 4. **`formatNCNH(nCNH)`**
Formata número de CNH para 11 dígitos

```typescript
export function formatNCNH(nCNH: unknown): string
```

**Lógica:**
- Remove não-dígitos
- Pad left com '0' até 11 caracteres
- Retorna vazio se não fornecido

---

#### 5. **`formatPIS(pis)`**
Formata PIS para 11 dígitos

```typescript
export function formatPIS(pis: unknown): string
```

**Lógica:**
- Remove não-dígitos
- Retorna vazio se vazio
- Pad left com '0' até 11 caracteres
- Retorna vazio se resultado vazio

---

#### 6. **`formatCEP(cep)`**
Formata CEP para 8 dígitos

```typescript
export function formatCEP(cep: unknown): string
```

**Lógica:**
- Remove não-dígitos
- Pad left com '0' até 8 caracteres
- Retorna vazio se não fornecido

---

#### 7. **`formatRenavam(value)`**
Formata RENAVAM para 11 dígitos

```typescript
function formatRenavam(value: unknown): string
```

**Lógica:**
- Remove não-dígitos
- Se < 11 chars, pad left com '0'
- Se >= 11 chars, retorna como está
- Retorna vazio se não fornecido

---

#### 8. **`formatRNTRC(value)`**
Formata RNTRC para 8 dígitos

```typescript
function formatRNTRC(value: unknown): string
```

**Lógica:**
- Remove não-dígitos
- Se < 8 chars, pad left com '0'
- Se >= 8 chars, retorna como está
- Retorna vazio se não fornecido

---

### Date Handling

#### 9. **`excelDateToISO(value, format)`**
Converte múltiplos formatos de data para ISO ou DD/MM/YYYY

```typescript
function excelDateToISO(
  value: unknown,
  format: 'yyyy-mm-dd' | 'dd/mm/yyyy' = 'yyyy-mm-dd'
): string
```

**Formatos aceitos:**
1. **Número (Excel serial):** `44968` → `2023-01-15`
   - Fórmula: `(serial - 25569) * 86400 * 1000`
   - Corrige fuso horário

2. **String DD/MM/YYYY:** `"15/01/2023"` → `"2023-01-15"`

3. **String YYYY-MM-DD:** `"2023-01-15"` → `"2023-01-15"`

**Retorno:**
- Formato 'yyyy-mm-dd': `"2023-01-15"`
- Formato 'dd/mm/yyyy': `"15/01/2023"`
- String vazia se inválido

---

### Text Processing

#### 10. **`cleanDocProp(value)`**
Remove caracteres não-alfanuméricos

```typescript
function cleanDocProp(value: unknown): string
```

**Lógica:**
- Remove tudo que não é letra/número
- Remove pontos, barras, hífens
- Resultado: apenas a-zA-Z0-9

**Exemplo:** `"123.456.789-00"` → `"12345678900"`

---

#### 11. **`preserveTextSpaces(value, maxLength?)`**
Normaliza espaços, mantendo espaços internos

```typescript
function preserveTextSpaces(value: unknown, maxLength?: number): string
```

**Lógica:**
- Substitui múltiplos espaços por 1
- Trim apenas do final (trimEnd)
- Se maxLength fornecido, trunca
- Retorna vazio se não é string

**Exemplo:** `"João    da    Silva  "` → `"João da Silva"`

---

#### 12. **`truncateString(value, maxLength)`**
Trunca string e normaliza espaços

```typescript
function truncateString(value: unknown, maxLength: number): string
```

**Lógica:**
- Trim completo
- Normaliza espaços
- Se > maxLength, corta e trim final
- Retorna vazio se não é string

---

### Geographic Conversions

#### 13. **`getCodigoIbgePorNome(nome)`**
Converte nome do município para código IBGE

```typescript
function getCodigoIbgePorNome(nome: string): number | undefined
```

**Lógica:**
- Procura em `municipios.json`
- Match case-insensitive
- Retorna `codigo_ibge` ou undefined

**Dados:** `municipios.json` contém array de objetos:
```json
[
  { "nome": "São Paulo", "codigo_ibge": 3550308 },
  { "nome": "Rio de Janeiro", "codigo_ibge": 3304557 }
]
```

---

#### 14. **`getCodigoIbgeUf(uf)`**
Converte sigla UF ou valida código IBGE

```typescript
export function getCodigoIbgeUf(uf: string | number): number | undefined
```

**Lógica:**
1. Se número: procura por ID em `estados.json`
2. Se string: verifica se é número (parseInt)
   - Se sim, procura por ID
   - Se não, procura por sigla (uppercase)

**Dados:** `estados.json` contém array:
```json
[
  { "id": 11, "sigla": "RO" },
  { "id": 12, "sigla": "AC" },
  { "id": 35, "sigla": "SP" }
]
```

**Exemplos:**
- `"SP"` → `35`
- `"35"` → `35`
- `35` → `35`
- `"XX"` → `undefined`

---

### Helper Functions

#### 15. **`escapeXml(value)`**
Escapa caracteres especiais para XML

```typescript
function escapeXml(value: string | undefined | null): string
```

**Substituições:**
- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;`
- `'` → `&apos;`

---

#### 16. **`objectToXml(obj, indent)`**
Converte objeto JS para string XML

```typescript
function objectToXml(obj: Record<string, unknown>, indent: string = ''): string
```

**Funcionalidade:**
- Recursivo para objetos aninhados
- Skip de campos vazios/null
- Indentação progressiva
- Ordem fixa para transportador (via `__forceTransportadorOrder`)
- Escapa valores automaticamente

---

#### 17. **`getEnvTag(type)`**
Retorna tag raiz XML baseada no tipo

```typescript
function getEnvTag(type: CadastroType): string
```

**Mapeamento:**
- `motorista` → `envMoto`
- `veiculo` → `envVeic`
- `transportador` → `envProprietario`
- `pessoa_fisica` → `envParticipante`
- `pessoa_juridica` → `envParticipante`
- default → `env`

---

#### 18. **`loadPlacasValidas()`**
Carrega e cacheia placas válidas de arquivo

```typescript
export function loadPlacasValidas(): Set<string>
```

**Funcionalidade:**
- Lê `placas-cadastrar.txt`
- Split por `\n`
- Trim e uppercase
- Cacheia em variável global `placasValidas`
- Retorna Set para lookup O(1)

---

#### 19. **`isPlacaValida(placa, placasSet)`**
Verifica se placa está no conjunto válido

```typescript
export function isPlacaValida(placa: string, placasSet: Set<string>): boolean
```

**Lógica:**
- Retorna false se vazio
- Uppercase e trim
- Verifica no Set

---

#### 20. **`resolveNum(value)`**
Resolve número ou retorna "SN" se vazio

```typescript
function resolveNum(value: unknown): string
```

**Lógica:**
- Se vazio/null/undefined → `"SN"` (Sem Número)
- Senão → `String(value)`

---

### Utility Functions

#### 21. **`getExpectedFields(type)`**
Retorna array de campos esperados por tipo

```typescript
export function getExpectedFields(type: CadastroType): string[]
```

**Retorna:**
- **motorista:** 31 campos
- **veiculo:** 23 campos
- **transportador:** 35 campos
- **pessoa_fisica:** 19 campos
- **pessoa_juridica:** 19 campos

---

## Estruturas de Dados (Types)

Arquivo: `src/types/cadastro-xml.ts`

### **MotoristaData**
```typescript
type MotoristaData = {
  xCNPJ: string;
  xToken: string;
  idUsuario: string;
  CPF: string;
  RG: string;
  ufRG: string;
  expedRG: string;
  dtExpedRG: string;
  xNome: string;
  dtNascto: string;
  nomeMae: string;
  Sexo: string;
  Natural: string;
  dtPrimHabilit: string;
  Ender: {
    CEP: string;
    xLgr: string;
    nro: string;
    xBairro: string;
    xCpl: string;
    cMun: string;
  };
  nCNH: string;
  nSegCNH: string;
  catCNH: string;
  dtVencCNH: string;
  PIS: string;
  xDocContrat: string;
  tpFunc: string;
  Email: string;
  Telefone: string;
  Cartao: {
    tpCartao: string;
    nCartao: string;
    tpOpera: string;
  };
  Raca: string;
};
```

---

### **ProprietarioData**
```typescript
type ProprietarioData = {
  xCNPJ: string;
  xToken: string;
  idUsuario: string;
  pFisica: {
    CPF: string;
    RG: string;
    ufRG: string;
    expedRG: string;
    dtExpedRG: string;
    xNome: string;
    dtNascto: string;
    Email: string;
    qtdDepend: string;
    Telefone: string;
    Sexo: string;
    Natural: string;
    Raca: string;
  };
  pJuridica: {
    xCNPJ: string;
    xIE: string;
    xIM: string;
    xRazaoSocial: string;
    xNomeFant: string;
    tpPart: string;
    Email: string;
    Telefone: string;
    tpEmpresa: string;
  };
  Ender: {
    CEP: string;
    xLgr: string;
    nro: string;
    xBairro: string;
    xCpl: string;
    cMun: string;
  };
  RNTRC: string;
  dtVencRNTRC: string;
  tpProp: string;
  Cartao: {
    tpCartao: string;
    nCartao: string;
    tpOpera: string;
  };
};
```

---

### **VeiculoData**
```typescript
type VeiculoData = {
  xCNPJ: string;
  xToken: string;
  idUsuario: string;
  tpVeic: string;
  placa: string;
  RENAVAM: string;
  tara: string;
  capKG: string;
  capM3: string;
  tpRod: string;
  tpCar: string;
  UF: string;
  RNTRC: string;
  xDocProp: string;
  nEixos: string;
  Cor: string;
  AnoFabric: string;
  AnoMod: string;
  Chassi: string;
  Marca: string;
  Modelo: string;
  cMunEmplac: string;
  xDocAgreg: string;
  TAG: {
    xCNPJEmissor: string;
    nTAG: string;
  };
};
```

---

### **ParticipanteData** (Pessoa Física/Jurídica)
```typescript
type ParticipanteData = {
  xToken: string;
  xCNPJ: string;
  idUsuario: string;
  pFisica: {
    CPF: string;
    RG: string;
    ufRG: string;
    expedRG: string;
    dtExpedRG: string;
    xNome: string;
    dtNascto: string;
    Email: string;
    Telefone: string;
    Sexo: string;
    Natural: string;
    Raca: string;
  };
  pJuridica: {
    xCNPJ: string;
    xIE: string;
    xIM: string;
    xRazaoSocial: string;
    xNomeFant: string;
    tpPart: string;
    Email: string;
    Telefone: string;
  };
  Ender: {
    CEP: string;
    xLgr: string;
    nro: string;
    xBairro: string;
    xCpl: string;
    cMun: string;
  };
};
```

---

### **CadastroType** (Union Type)
```typescript
type CadastroType = 
  'motorista' | 
  'veiculo' | 
  'transportador' | 
  'pessoa_fisica' | 
  'pessoa_juridica';
```

---

## API Routes

Arquivo: `src/lib/apiRoutes.ts`

```typescript
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3100';

export const apiRoutes = {
  motorista: `${BACKEND_URL}/api/proxy/webapi/cadastro/motorista`,
  veiculo: `${BACKEND_URL}/api/proxy/webapi/cadastro/veiculo`,
  transportador: `${BACKEND_URL}/api/proxy/webapi/cadastro/proprietario`,
  pessoa_fisica: `${BACKEND_URL}/api/proxy/webapi/cadastro/participante`,
  pessoa_juridica: `${BACKEND_URL}/api/proxy/webapi/cadastro/participante`,
} as const;

export type ApiRouteKey = keyof typeof apiRoutes;
```

### Detalhes
- **Environment Variable:** `VITE_BACKEND_URL`
- **Default:** `http://localhost:3100`
- **Método:** POST
- **Content-Type:** `text/xml; charset=utf-8`
- **Parâmetros:** Corpo da requisição é o XML completo

### Endpoints
- **Motorista:** `/api/proxy/webapi/cadastro/motorista`
- **Veículo:** `/api/proxy/webapi/cadastro/veiculo`
- **Transportador:** `/api/proxy/webapi/cadastro/proprietario` (proprietário)
- **Pessoa Física:** `/api/proxy/webapi/cadastro/participante`
- **Pessoa Jurídica:** `/api/proxy/webapi/cadastro/participante`

---

## Dados de Entrada

### Arquivo Excel
- **Formato:** .xlsx ou .xls
- **Primeira Aba:** Lida automaticamente
- **Formato:** Tabela com headers na primeira linha
- **Linhas:** Cada linha = 1 registro

### Exemplo para Motorista

| idUsuario | CPF | RG | ufRG | xNome | ... |
|-----------|-----|----|------|-------|-----|
| 1001 | 12345678901 | 123456789 | SP | João da Silva | ... |
| 1002 | 98765432109 | 987654321 | RJ | Maria Santos | ... |

### Campos Especiais

**Datas:**
- Excel serial (número): `44968` (automaticamente convertido)
- Formato: `DD/MM/YYYY` ou `YYYY-MM-DD`
- Retorno: `YYYY-MM-DD` (padrão ISO)

**Números com Mascaras:**
- CPF: Remove `.-` automaticamente
- CNH: Remove caracteres especiais
- CEP: Remove `.-` automaticamente
- Telefone: Remove `()- ` automaticamente

**Documentos:**
- RENAVAM: Completa com '0' à esquerda até 11 dígitos
- RNTRC: Completa com '0' à esquerda até 8 dígitos
- CNPJ: Remove símbolos

**Geográfico:**
- UF: Aceita sigla (SP) ou código IBGE (35)
- Município: Aceita nome ou código IBGE
- Converte automaticamente para código IBGE

**Endereço:**
- `CEP`: 8 dígitos
- `xLgr`: Nome da rua
- `nro`: Número (ou "SN" se vazio)
- `xBairro`: Bairro
- `xCpl`: Complemento
- `cMun`: Nome do município (convertido para código IBGE)

**Para Transportador:**
- `tipoPessoa`: 1 = Pessoa Física, 2 = Pessoa Jurídica
- Define qual estrutura será usada (pFisica ou pJuridica)

**Para Veículos:**
- `placa`: Validada contra `placas-cadastrar.txt`
- Veículos com placa inválida são ignorados (filtrados)

---

## Tratamento de Erros

### No Upload

| Erro | Mensagem | Ação |
|------|----------|------|
| Tipo arquivo inválido | "Por favor, envie um arquivo Excel (.xlsx ou .xls)" | Volta ao seletor |
| Arquivo vazio | "O arquivo está vazio ou não possui dados válidos." | Permite novo upload |
| Parse error | "Erro ao processar o arquivo. Verifique se é um arquivo Excel válido." | Permite novo upload |

### Na Autenticação

| Campo | Validação | Mensagem |
|-------|-----------|----------|
| CNPJ | Exatamente 14 dígitos | Desabilita próximo se < 14 |
| Token | Mínimo 1 caractere | Desabilita próximo se vazio |

### Na Conversão

| Erro | Ação |
|------|------|
| Placa inválida (veículo) | Filtra veículo, mostra toast com quantidade ignorada |
| Data inválida | Retorna string vazia |
| Município não encontrado | Mantém nome como está |
| UF não encontrado | Retorna undefined |

### No Envio

| Erro | Mensagem | Status |
|------|----------|--------|
| Falha fetch | Mensagem de erro | `error` |
| Response não ok | Conta sucessos/falhas | `error` |
| Sucesso | "XML(s) enviado(s) com sucesso!" | `success` |

---

## Fluxo de Dados Completo

```
USUÁRIO SELECIONA TIPO
    ↓
┌─ Reseta dados anteriores
└─ excelData = []
   xmls = []

USUÁRIO UPLOAD ARQUIVO EXCEL
    ↓
┌─ XLSX.read() lê arquivo
├─ sheet_to_json() cria array de objetos
├─ Valida se não vazio
└─ onDataLoaded(data)
   excelData = [...records]

USUÁRIO PREENCHE CNPJ E TOKEN
    ↓
┌─ formatCNPJ() formata visualmente
└─ Valida 14 dígitos
   Valida token não vazio

USUÁRIO CLICA "CONTINUAR" (STEP 3→4)
    ↓
┌─ Para cada row em excelData:
│  ├─ mapExcelRowToType(row, type)
│  ├─   ├─ Formata todos os números
│  ├─   ├─ Converte datas
│  ├─   ├─ Resolve IBGE codes
│  ├─   └─ Estrutura objetos aninhados
│  └─ Resultado: objeto tipado
│
├─ Se type === 'veiculo':
│  ├─ loadPlacasValidas() → Set
│  ├─ Filtra por placa válida
│  └─ Mostra toast com ignoradas
│
└─ Para cada objeto mapeado:
   └─ convertToXml(obj, type, cnpj, token)
      ├─ getEnvTag(type) → tag raiz
      ├─ Cria Autentic
      ├─ objectToXml() cria XML
      └─ Retorna string XML
   xmls = [...xmlStrings]

USUÁRIO VISUALIZA/EDITA XMLS (STEP 4)
    ↓
┌─ XmlPreview mostra primeiro XML
├─ Pode paginar entre XMLs
├─ Pode copiar XML
└─ Pode editar antes de enviar

USUÁRIO CLICA "ENVIAR" (STEP 5)
    ↓
┌─ setSendStatus('sending')
├─ Para cada xml em xmls:
│  ├─ fetch(apiRoutes[type], {
│  │  method: 'POST',
│  │  body: xml,
│  │  headers: { 'Content-Type': 'text/xml; charset=utf-8' }
│  │ })
│  └─ if (response.ok) successCount++
├─ setSendStatus('success')
└─ Mostra resultado: {successCount} de {xmls.length}

USUÁRIO CLICA "NOVO ENVIO"
    ↓
└─ handleReset()
   ├─ currentStep = 1
   ├─ selectedType = null
   ├─ excelData = []
   ├─ cnpj = ''
   ├─ token = ''
   ├─ xmls = []
   └─ sendStatus = 'idle'
```

---

## Exemplo Prático Completo

### Entrada (Excel)

**Tipo:** Motorista

| idUsuario | CPF | RG | ufRG | expedRG | dtExpedRG | xNome | dtNascto | nomeMae | Sexo | Natural | dtPrimHabilit | CEP | xLgr | nro | xBairro | xCpl | cMun | nCNH | nSegCNH | catCNH | dtVencCNH | PIS | xDocContrat | tpFunc | Email | Telefone | tpCartao | nCartao | tpOpera | Raca |
|-----------|-----|----|----|---------|----------|-------|---------|---------|------|---------|--------------|-----|------|-----|---------|------|------|------|---------|--------|----------|-----|-------------|--------|-------|----------|----------|---------|---------|------|
| 001 | 12345678901 | 123456789 | SP | SSP | 15/01/2020 | João da Silva | 01/01/1990 | Maria Silva | M | São Paulo | 01/01/2015 | 01310100 | Av Paulista | 1000 | Centro | Apto 101 | São Paulo | 12345678901 | 123456 | B | 15/01/2030 | 12345678901 | DOC001 | Motorista | joao@email.com | 11987654321 | DÉBITO | 1234567890123456 | DÉBITO | Branca |

### Processamento

1. **Formatação:**
   - CPF: `12345678901` ✓
   - CNH: `12345678901` ✓
   - PIS: `12345678901` ✓
   - CEP: `01310100` ✓
   - Telefone: `11987654321` → `11987654321` (após cleanDocProp)
   - Data: `15/01/2020` → `2020-01-15`
   - UF: `SP` → `35` (código IBGE)
   - Município: `São Paulo` → `3550308` (código IBGE)

2. **Estrutura de Saída:**
```typescript
{
  idUsuario: "001",
  CPF: "12345678901",
  RG: "123456789",
  ufRG: 35,
  expedRG: "SSP",
  dtExpedRG: "2020-01-15",
  xNome: "João da Silva",
  dtNascto: "1990-01-01",
  nomeMae: "Maria Silva",
  Sexo: "M",
  Natural: "São Paulo",
  dtPrimHabilit: "2015-01-01",
  Ender: {
    CEP: "01310100",
    xLgr: "Av Paulista",
    nro: "1000",
    xBairro: "Centro",
    xCpl: "Apto 101",
    cMun: 3550308
  },
  nCNH: "12345678901",
  nSegCNH: "123456",
  catCNH: "B",
  dtVencCNH: "2030-01-15",
  PIS: "12345678901",
  xDocContrat: "DOC001",
  tpFunc: "Motorista",
  Email: "joao@email.com",
  Telefone: "11987654321",
  Cartao: {
    tpCartao: "DÉBITO",
    nCartao: "1234567890123456",
    tpOpera: "DÉBITO"
  },
  Raca: "Branca"
}
```

3. **XML Gerado:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<envMoto versao="1.00" xmlns="http://www.controleembarque.com.br">
  <Autentic>
    <xCNPJ>12345678000190</xCNPJ>
    <xToken>token_abc123xyz</xToken>
  </Autentic>
  <Control>
    <idUsuario>001</idUsuario>
    <CPF>12345678901</CPF>
    <RG>123456789</RG>
    <ufRG>35</ufRG>
    <expedRG>SSP</expedRG>
    <dtExpedRG>2020-01-15</dtExpedRG>
    <xNome>João da Silva</xNome>
    <dtNascto>1990-01-01</dtNascto>
    <nomeMae>Maria Silva</nomeMae>
    <Sexo>M</Sexo>
    <Natural>São Paulo</Natural>
    <dtPrimHabilit>2015-01-01</dtPrimHabilit>
    <Ender>
      <CEP>01310100</CEP>
      <xLgr>Av Paulista</xLgr>
      <nro>1000</nro>
      <xBairro>Centro</xBairro>
      <xCpl>Apto 101</xCpl>
      <cMun>3550308</cMun>
    </Ender>
    <nCNH>12345678901</nCNH>
    <nSegCNH>123456</nSegCNH>
    <catCNH>B</catCNH>
    <dtVencCNH>2030-01-15</dtVencCNH>
    <PIS>12345678901</PIS>
    <xDocContrat>DOC001</xDocContrat>
    <tpFunc>Motorista</tpFunc>
    <Email>joao@email.com</Email>
    <Telefone>11987654321</Telefone>
    <Cartao>
      <tpCartao>DÉBITO</tpCartao>
      <nCartao>1234567890123456</nCartao>
      <tpOpera>DÉBITO</tpOpera>
    </Cartao>
    <Raca>Branca</Raca>
  </Control>
</envMoto>
```

4. **Envio POST:**
```
POST http://localhost:3100/api/proxy/webapi/cadastro/motorista
Content-Type: text/xml; charset=utf-8

[XML COMPLETO ACIMA]
```

5. **Resposta:** `200 OK` → Status de sucesso

---

## Importação e Reutilização

### Para usar em outro projeto:

1. **Copie os arquivos necessários:**
   ```
   src/utils/xmlConverter.ts       ← Core converter
   src/types/cadastro-xml.ts       ← Types
   src/municipios.json             ← Mapeamento municípios
   src/estados.json                ← Mapeamento estados
   src/placas-cadastrar.txt        ← Placas válidas (opcional)
   src/lib/apiRoutes.ts            ← URLs da API
   ```

2. **Componentes (opcionais, pode criar seus próprios):**
   ```
   src/components/TypeSelector.tsx
   src/components/FileUpload.tsx
   src/components/AuthInputs.tsx
   src/components/XmlPreview.tsx
   src/components/SendStatus.tsx
   src/components/StepIndicator.tsx
   ```

3. **Integração Básica:**
   ```typescript
   import { 
     convertToXml, 
     mapExcelRowToType,
     getExpectedFields,
     type CadastroType 
   } from '@/utils/xmlConverter';

   // 1. Ler Excel
   const excelData = await readExcelFile(file);

   // 2. Mapear dados
   const mappedData = excelData.map(row => 
     mapExcelRowToType(row, 'motorista')
   );

   // 3. Converter para XML
   const xml = convertToXml(mappedData, 'motorista', cnpj, token);

   // 4. Enviar
   fetch('/api/motorista', {
     method: 'POST',
     body: xml,
     headers: { 'Content-Type': 'text/xml; charset=utf-8' }
   });
   ```

3. **Dependências Necessárias:**
   ```json
   {
     "dependencies": {
       "xlsx": "^0.18.0",
       "react": "^19.0.0",
       "react-dom": "^19.0.0"
     }
   }
   ```

---

## Notas Importantes

1. **Validação de Placas (Veículos):**
   - Arquivo `placas-cadastrar.txt` deve estar no diretório `src/`
   - Uma placa por linha
   - Automaticamente convertida para uppercase
   - Veículos com placa inválida são filtrados (não geram XML)

2. **Datas Excel:**
   - Excel serial number = dias desde 01/01/1900
   - Conversão automática para ISO (YYYY-MM-DD)
   - Corrige fuso horário

3. **Geolocalização:**
   - Municípios e estados devem estar em JSON
   - Match é case-insensitive
   - Se nome não encontrado, mantém nome como está

4. **Formatação de Números:**
   - CPF/CNH/PIS: 11 dígitos (completa com zero)
   - CEP: 8 dígitos (completa com zero)
   - RENAVAM: 11 dígitos (completa com zero)
   - RNTRC: 8 dígitos (completa com zero)

5. **XML Especial para Transportador:**
   - Ordem de elementos é importante
   - Flag `__forceTransportadorOrder` controla isto
   - Elemento especial: `pFisica` ou `pJuridica` baseado em `tipoPessoa`

6. **Performance:**
   - Placas carregadas uma única vez (cachê Set)
   - Municipios/estados em JSON (lookup rápido)
   - Conversão paralela (cada linha independente)

---

## Dúvidas Frequentes

**P: Como adicionar novo tipo de cadastro?**
A: 
1. Adicione type em `CadastroType`
2. Crie type em `cadastro-xml.ts`
3. Adicione case em `mapExcelRowToType()`
4. Adicione case em `getExpectedFields()`
5. Adicione case em `getEnvTag()`
6. Adicione rota em `apiRoutes.ts`

**P: Como customizar formatação de campos?**
A: Edite funções de formatação específicas (formatCPF, excelDateToISO, etc)

**P: Como integrar com outro design system?**
A: Copie apenas `xmlConverter.ts` e `tipos`, implemente seus próprios componentes

**P: Posso enviar múltiplos registros em um XML?**
A: Sim, passe array com múltiplos objetos em `convertToXml()`, mas o sistema gera um XML por registro

**P: Como lidar com erros de validação?**
A: Sistema filtra/ignora registros inválidos e mostra toast com quantidade de ignorados

---

**Versão:** 1.0  
**Última atualização:** 2024  
**Autor:** XML Converter Magic Team
