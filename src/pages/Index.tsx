import { useState, useMemo } from "react";
import { FileCode2, Send, ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TypeSelector } from "@/components/TypeSelector";
import { FileUpload } from "@/components/FileUpload";
import { AuthInputs } from "@/components/AuthInputs";
import { XmlPreview } from "@/components/XmlPreview";
import { SendStatus, SendStatusType } from "@/components/SendStatus";
import { StepIndicator } from "@/components/StepIndicator";
import {
  convertToXml,
  getExpectedFields,
  mapExcelRowToType,
  type CadastroType
} from "@/utils/xmlConverter";
import { toast } from "@/hooks/use-toast";
import { apiRoutes, ApiRouteKey } from "@/lib/apiRoutes";

const steps = [
  { number: 1, label: 'Tipo' },
  { number: 2, label: 'Upload' },
  { number: 3, label: 'Autenticação' },
  { number: 4, label: 'Preview' },
  { number: 5, label: 'Enviar' },
];

export default function Index() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<ApiRouteKey | null>(null);
  const [excelData, setExcelData] = useState<Record<string, unknown>[]>([]);
  const [cnpj, setCnpj] = useState('');
  const [token, setToken] = useState('');
  const [xmls, setXmls] = useState<string[]>([]);
  const [sendStatus, setSendStatus] = useState<SendStatusType>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusDetails, setStatusDetails] = useState('');

  const expectedFields = useMemo(() => {
    return selectedType ? getExpectedFields(selectedType) : [];
  }, [selectedType]);

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1: return selectedType !== null;
      case 2: return excelData.length > 0;
      case 3: return cnpj.replace(/\D/g, '').length === 14 && token.trim().length > 0;
      case 4: return xmls.length > 0 && xmls.every(x => x.trim().length > 0);
      default: return false;
    }
  }, [currentStep, selectedType, excelData, cnpj, token, xmls]);

  const handleTypeSelect = (type: CadastroType) => {
    setSelectedType(type);
    setExcelData([]);
    setXmls([]);
  };

  const handleDataLoaded = (data: Record<string, unknown>[]) => {
    setExcelData(data);
  };

  const handleNextStep = () => {
    if (currentStep === 3 && selectedType && excelData.length > 0) {
      const cleanCnpj = cnpj.replace(/\D/g, '');
      const mappedData = excelData.map(row => mapExcelRowToType(row, selectedType));
      const generatedXmls = mappedData.map(data =>
        convertToXml([data], selectedType, cleanCnpj, token)
      );
      setXmls(generatedXmls);
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    if (currentStep === 5) {
      setSendStatus('idle');
    }
  };

  const handleXmlChange = (index: number, newXml: string) => {
    setXmls(prev => prev.map((xml, i) => (i === index ? newXml : xml)));
  };

  const handleSend = async () => {
    setSendStatus('sending');
    setStatusMessage('Enviando XML para o servidor...');
    setStatusDetails('');

    if (selectedType && apiRoutes[selectedType]) {
      try {
        let successCount = 0;
        for (const xml of xmls) {
          const response = await fetch(apiRoutes[selectedType], {
            method: "POST",
            body: xml,
            headers: { "Content-Type": "text/xml; charset=utf-8" },
          });
          if (response.ok) successCount++;
        }
        setSendStatus('success');
        setStatusMessage('XML(s) enviado(s) com sucesso!');
        setStatusDetails(`${successCount} de ${xmls.length} registro(s) processado(s)`);
        toast({
          title: "Sucesso!",
          description: "Todos os XMLs foram enviados.",
        });
      } catch (error) {
        setSendStatus('error');
        setStatusMessage('Erro ao enviar XML');
        setStatusDetails(error instanceof Error ? error.message : 'Erro desconhecido');
        toast({
          title: "Erro",
          description: "Não foi possível enviar todos os XMLs.",
          variant: "destructive",
        });
      }
    } else {
      setSendStatus('error');
      setStatusMessage('Erro ao enviar XML');
      setStatusDetails('Tipo não selecionado ou rota não encontrada');
      toast({
        title: "Erro",
        description: "Tipo não selecionado ou rota não encontrada.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedType(null);
    setExcelData([]);
    setCnpj('');
    setToken('');
    setXmls([]);
    setSendStatus('idle');
    setStatusMessage('');
    setStatusDetails('');
  };

  const url = apiRoutes[selectedType as ApiRouteKey];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <FileCode2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">XML Converter</h1>
              <p className="text-sm text-muted-foreground">Excel para XML</p>
            </div>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4">
          <StepIndicator steps={steps} currentStep={currentStep} />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Type Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Selecione o tipo de cadastro
                </h2>
                <p className="text-muted-foreground">
                  Escolha o tipo de dados que você deseja converter para XML
                </p>
              </div>
              <TypeSelector
                selectedType={selectedType}
                onSelect={handleTypeSelect}
              />
            </div>
          )}

          {/* Step 2: File Upload */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Upload do arquivo Excel
                </h2>
                <p className="text-muted-foreground">
                  Envie sua planilha com os dados de {selectedType?.replace('_', ' ')}
                </p>
              </div>
              <FileUpload
                onDataLoaded={handleDataLoaded}
                expectedFields={expectedFields}
              />
            </div>
          )}

          {/* Step 3: Authentication */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Dados de autenticação
                </h2>
                <p className="text-muted-foreground">
                  Informe o CNPJ e Token para autenticação da requisição
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <AuthInputs
                  cnpj={cnpj}
                  token={token}
                  onCnpjChange={setCnpj}
                  onTokenChange={setToken}
                />
              </div>
            </div>
          )}

          {/* Step 4: Preview */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Preview do XML
                </h2>
                <p className="text-muted-foreground">
                  Revise e edite cada XML antes de enviar
                </p>
              </div>
              <XmlPreview xmls={xmls} onXmlChange={handleXmlChange} />
            </div>
          )}

          {/* Step 5: Send */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Enviar XML
                </h2>
                <p className="text-muted-foreground">
                  Envie o XML para processamento
                </p>
              </div>

              {sendStatus === 'idle' ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <Send className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Pronto para enviar
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {excelData.length} registro(s) serão enviados
                  </p>
                  <Button
                    onClick={handleSend}
                    size="lg"
                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Send className="w-4 h-4" />
                    Enviar XML
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <SendStatus
                    status={sendStatus}
                    message={statusMessage}
                    details={statusDetails}
                  />
                  {sendStatus !== 'sending' && (
                    <div className="flex justify-center">
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Novo envio
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>

            {currentStep < 5 && (
              <Button
                onClick={handleNextStep}
                disabled={!canProceed}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Continuar
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
