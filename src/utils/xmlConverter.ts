import type { MotoristaData, ProprietarioData, VeiculoData, ParticipanteData } from "@/types/cadastro-xml";
import municipios from "@/municipios.json"; // ajuste o caminho se necessário
import estados from "@/estados.json";
import placasTexto from "@/placas-cadastrar.txt?raw";

export type CadastroType = 
  'motorista' | 
  'veiculo' | 
  'transportador' | 
  'pessoa_fisica' | 
  'pessoa_juridica';

// Cache das placas válidas
let placasValidas: Set<string> | null = null;

// Função para carregar placas do arquivo
export function loadPlacasValidas(): Set<string> {
  if (placasValidas) {
    return placasValidas;
  }
  
  try {
    const placas = placasTexto
      .split('\n')
      .map(line => line.trim().toUpperCase())
      .filter(line => line.length > 0);
    placasValidas = new Set(placas);
    console.log(`Carregadas ${placasValidas.size} placas válidas`);
    return placasValidas;
  } catch (error) {
    console.error('Erro ao carregar placas:', error);
    return new Set();
  }
}

// Função para verificar se uma placa é válida
export function isPlacaValida(placa: string, placasSet: Set<string>): boolean {
  if (!placa) return false;
  const placaLimpa = placa.toString().trim().toUpperCase();
  return placasSet.has(placaLimpa);
}

function escapeXml(value: string | undefined | null): string {
  if (!value) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Formata o número da CNH garantindo 11 dígitos
 * Completa com zeros à esquerda se necessário
 * @param nCNH - Número da CNH (string ou número)
 * @returns CNH formatada com 11 dígitos
 */
export function formatNCNH(nCNH: unknown): string {
  if (!nCNH) return '';
  const digits = String(nCNH).trim().replace(/\D/g, '');
  return digits.padStart(11, '0');
}

/**
 * Formata o número do CPF garantindo 11 dígitos
 * Completa com zeros à esquerda se necessário
 * @param cpf - Número do CPF (string ou número)
 * @returns CPF formatado com 11 dígitos
 */
export function formatCPF(cpf: unknown): string {
  if (!cpf) return '00000000000';
  const digits = String(cpf).trim().replace(/\D/g, '');
  return digits.padStart(11, '0');
}

/**
 * Formata o número do CEP garantindo 8 dígitos
 * Completa com zeros à esquerda se necessário
 * @param cep - Número do CEP (string ou número)
 * @returns CEP formatado com 8 dígitos
 */
export function formatCEP(cep: unknown): string {
  if (!cep) return '';
  const digits = String(cep).trim().replace(/\D/g, '');
  return digits.padStart(8, '0');
}

function getEnvTag(type: CadastroType): string {
  switch (type) {
    case "motorista": return "envMoto";
    case "veiculo": return "envVeic";
    case "transportador": return "envProprietario";
    case "pessoa_fisica": return "envParticipante";
    case "pessoa_juridica": return "envParticipante";
    default: return "env";
  }
}

function objectToXml(obj: Record<string, unknown>, indent: string = ''): string {
  let xml = '';

  // Ordem fixa para transportador
  const transportadorOrder = [
    'idUsuario',
    'pFisica',
    'pJuridica',
    'Ender',
    'RNTRC',
    'dtVencRNTRC',
    'tpProp',
    'Cartao',
  ];
  const keys =
    obj && obj.__forceTransportadorOrder
      ? transportadorOrder.filter(k => k in obj).concat(Object.keys(obj).filter(k => !transportadorOrder.includes(k) && k !== '__forceTransportadorOrder'))
      : Object.keys(obj);

  for (const key of keys) {
    if (key === '__forceTransportadorOrder') continue;
    const value = obj[key];
    if (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value === '') ||
      (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
    ) {
      continue;
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
      const innerXml = objectToXml(value as Record<string, unknown>, indent + '  ');
      if (innerXml.trim() !== '') {
        xml += `${indent}<${key}>\n${innerXml}${indent}</${key}>\n`;
      }
    } else {
      xml += `${indent}<${key}>${escapeXml(String(value))}</${key}>\n`;
    }
  }

  return xml;
}

export function convertToXml(
  data: Record<string, unknown>[],
  type: CadastroType,
  cnpj: string,
  token: string
): string {
  const envTag = getEnvTag(type);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<${envTag} versao="1.00" xmlns="http://www.controleembarque.com.br">\n`;
  xml += `  <Autentic>\n`;
  xml += `    <xCNPJ>${escapeXml(cnpj)}</xCNPJ>\n`;
  xml += `    <xToken>${escapeXml(token)}</xToken>\n`;
  xml += `  </Autentic>\n`;

  // Envolva os dados em <Control>
  xml += `  <Control>\n`;
  let obj = data[0];
  if (type === 'transportador') {
    obj = { ...obj, __forceTransportadorOrder: true };
  }
  xml += objectToXml(obj, '    ');
  xml += `  </Control>\n`;

  xml += `</${envTag}>`;

  return xml;
}



export function getExpectedFields(type: CadastroType): string[] {
  switch (type) {
    case 'motorista':
      return [
        'idUsuario', 'CPF', 'RG', 'ufRG', 'expedRG', 'dtExpedRG', 'xNome', 'dtNascto',
        'nomeMae', 'Sexo', 'Natural', 'dtPrimHabilit', 'CEP', 'xLgr', 'nro', 'xBairro',
        'xCpl', 'cMun', 'nCNH', 'nSegCNH', 'catCNH', 'dtVencCNH', 'PIS', 'xDocContrat',
        'tpFunc', 'Email', 'Telefone', 'tpCartao', 'nCartao', 'tpOpera', 'Raca'
      ];
    case 'veiculo':
      return [
        'idUsuario', 'tpVeic', 'placa', 'RENAVAM', 'tara', 'capKG', 'capM3', 'tpRod',
        'tpCar', 'UF', 'RNTRC', 'xDocProp', 'nEixos', 'Cor', 'AnoFabric', 'AnoMod',
        'Chassi', 'Marca', 'Modelo', 'cMunEmplac', 'xDocAgreg', 'xCNPJEmissor', 'nTAG'
      ];
    case 'transportador':
      return [
        'idUsuario', 'CPF', 'RG', 'ufRG', 'expedRG', 'dtExpedRG', 'xNome', 'dtNascto',
        'Email', 'qtdDepend', 'Telefone', 'Sexo', 'Natural', 'Raca', 'xCNPJEmpresa',
        'xIE', 'xIM', 'xRazaoSocial', 'xNomeFant', 'tpPart', 'EmailEmpresa', 'TelefoneEmpresa',
        'tpEmpresa', 'CEP', 'xLgr', 'nro', 'xBairro', 'xCpl', 'cMun', 'RNTRC',
        'dtVencRNTRC', 'tpProp', 'tpCartao', 'nCartao', 'tpOpera'
      ];
    case 'pessoa_fisica':
      return [
        'idUsuario', 'CPF', 'RG', 'ufRG', 'expedRG', 'dtExpedRG', 'xNome', 'dtNascto',
        'Email', 'Telefone', 'Sexo', 'Natural', 'Raca', 'CEP', 'xLgr', 'nro',
        'xBairro', 'xCpl', 'cMun'
      ];
    case 'pessoa_juridica':
      return [
        'idUsuario', 'xCNPJ', 'xIE', 'xIM', 'xRazaoSocial', 'xNomeFant', 'tpPart',
        'Email', 'Telefone', 'CEP', 'xLgr', 'nro', 'xBairro', 'xCpl', 'cMun'
      ];
    default:
      return [];
  }
}

export function mapExcelRowToType(
  row: Record<string, unknown>,
  type: CadastroType
): Record<string, unknown> {
  // Função auxiliar para tratar cMun
  const resolveCMun = (nome: unknown) =>
    typeof nome === "string" ? getCodigoIbgePorNome(nome) ?? nome : nome;

  switch (type) {
    case 'motorista':
      return {
        idUsuario: row.idUsuario,
        CPF: formatCPF(cleanDocProp(row.CPF)),
        RG: row.RG,
        ufRG: getCodigoIbgeUf(row.ufRG as string | number),
        expedRG: row.expedRG,
        dtExpedRG: excelDateToISO(row.dtExpedRG),
        xNome: preserveTextSpaces(row.xNome),
        dtNascto: excelDateToISO(row.dtNascto),
        nomeMae: row.nomeMae,
        Sexo: row.Sexo,
        Natural: row.Natural,
        Ender: {
          CEP: formatCEP(cleanDocProp(row.CEP)),
          xLgr: preserveTextSpaces(row.xLgr),
          nro: resolveNum(row.nro),
          xBairro: preserveTextSpaces(row.xBairro),
          xCpl: preserveTextSpaces(row.xCpl),
          cMun: resolveCMun(row.cMun),
        },
        nCNH: formatNCNH(row.nCNH),
        nSegCNH: row.nSegCNH,
        catCNH: row.catCNH,
        dtVencCNH: excelDateToISO(row.dtVencCNH),
        dtPrimHabilit: excelDateToISO(row.dtPrimHabilit) ,
        PIS: row.PIS,
        xDocContrat: row.xDocContrat,
        tpFunc: row.tpFunc,
        Email: row.Email,
        Telefone: cleanDocProp(row.Telefone),
        Cartao: {
          tpCartao: row.tpCartao,
          nCartao: row.nCartao,
          tpOpera: row.tpOpera,
        },
        Raca: row.Raca,
      };
    case 'veiculo':
      return {
        idUsuario: row.idUsuario,
        tpVeic: row.tpVeic,
        placa: row.placa,
        RENAVAM: formatRenavam(row.RENAVAM),
        tara: row.tara,
        capKG: row.capKG,
        capM3: row.capM3,
        tpRod: row.tpRod,
        tpCar: row.tpCar,
        UF: getCodigoIbgeUf(row.UF as string | number),
        RNTRC: row.RNTRC,
        xDocProp: cleanDocProp(row.xDocProp),
        nEixos: row.nEixos,
        Cor: row.Cor,
        AnoFabric: row.AnoFabric,
        AnoMod: row.AnoMod,
        Chassi: row.Chassi,
        Marca: row.Marca,
        Modelo: row.Modelo,
        cMunEmplac: resolveCMun(row.cMunEmplac),
        xDocAgreg: row.xDocAgreg,
        TAG: {
          xCNPJEmissor: row.xCNPJEmissor,
          nTAG: row.nTAG,
        },
      };
    case 'transportador': {
      const tipoPessoa = row.tipoPessoa;
      const comuns = {
        idUsuario: row.idUsuario,
        Ender: {
          CEP: formatCEP(cleanDocProp(row.CEP)),
          xLgr: preserveTextSpaces(row.xLgr),
          nro: resolveNum(row.nro),
          xBairro: preserveTextSpaces(row.xBairro),
          xCpl: preserveTextSpaces(row.xCpl),
          cMun: resolveCMun(row.cMun),
        },
        RNTRC: row.RNTRC,
        dtVencRNTRC: excelDateToISO(row.dtVencRNTRC),
        tpProp: row.tpProp,
        Cartao: {
          tpCartao: row.tpCartao,
          nCartao: row.nCartao,
          tpOpera: row.tpOpera,
        },
      };
      if (tipoPessoa === 1 || tipoPessoa === '1') {
        return {
          ...comuns,
          pFisica: {
            CPF: formatCPF(cleanDocProp(row.CPF)),
            RG: row.RG,
            ufRG: getCodigoIbgeUf(row.ufRG as string | number),
            expedRG: row.expedRG,
            dtExpedRG: row.dtExpedRG,
            xNome: preserveTextSpaces(row.xNome),
            dtNascto: row.dtNascto,
            Email: row.Email,
            qtdDepend: row.qtdDepend,
            Telefone: cleanDocProp(row.Telefone),
            Sexo: row.Sexo,
            Natural: row.Natural,
            Raca: row.Raca,
          },
        };
      } else if (tipoPessoa === 2 || tipoPessoa === '2') {
        return {
          ...comuns,
          pJuridica: {
            xCNPJ: cleanDocProp(row.xCNPJEmpresa),
            xIE: row.xIE,
            xIM: row.xIM,
            xRazaoSocial: truncateString(row.xRazaoSocial, 100),
            xNomeFant: truncateString(row.xNomeFant, 100),
            tpPart: row.tpPart,
            Email: row.EmailEmpresa,
            Telefone: cleanDocProp(row.TelefoneEmpresa),
            tpEmpresa: row.tpEmpresa,
          },
        };
      } else {
        // Se não for 1 nem 2, retorna apenas campos comuns
        return comuns;
      }
    }
    case 'pessoa_fisica':
      return {
        idUsuario: row.idUsuario,
        pFisica: {
          CPF: formatCPF(cleanDocProp(row.CPF)),
          RG: row.RG,
          ufRG: getCodigoIbgeUf(row.ufRG as string | number),
          expedRG: row.expedRG,
          dtExpedRG: row.dtExpedRG,
          xNome: preserveTextSpaces(row.xNome),
          dtNascto: row.dtNascto,
          Email: row.Email,
          Telefone: cleanDocProp(row.Telefone),
          Sexo: row.Sexo,
          Natural: row.Natural,
          Raca: row.Raca,
        },
        Ender: {
          CEP: formatCEP(cleanDocProp(row.CEP)),
          xLgr: preserveTextSpaces(row.xLgr),
          nro: resolveNum(row.nro),
          xBairro: preserveTextSpaces(row.xBairro),
          xCpl: preserveTextSpaces(row.xCpl),
          cMun: resolveCMun(row.cMun),
        },
      };
    case 'pessoa_juridica':
      return {
        idUsuario: row.idUsuario,
        pJuridica: {
          xCNPJ: cleanDocProp(row.xCNPJ),
          xIE: row.xIE,
          xIM: row.xIM,
          xRazaoSocial: row.xRazaoSocial,
          xNomeFant: row.xNomeFant,
          tpPart: row.tpPart,
          Email: row.Email,
          Telefone: cleanDocProp(row.Telefone),
          RNTRC: row.RNTRC,
        },
        Ender: {
          CEP: formatCEP(cleanDocProp(row.CEP)),
          xLgr: preserveTextSpaces(row.xLgr),
          nro: resolveNum(row.nro),
          xBairro: preserveTextSpaces(row.xBairro),
          xCpl: preserveTextSpaces(row.xCpl),
          cMun: resolveCMun(row.cMun),
        },
      };
    default:
      return row;
  }
}

function excelDateToISO(value: unknown, format: 'yyyy-mm-dd' | 'dd/mm/yyyy' = 'yyyy-mm-dd'): string {
  let year: string, month: string, day: string;
  if (typeof value === "number") {
    // Excel date serial number to JS Date
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    // Corrige fuso horário
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() + userTimezoneOffset);
    year = String(localDate.getFullYear());
    month = String(localDate.getMonth() + 1).padStart(2, '0');
    day = String(localDate.getDate()).padStart(2, '0');
  } else if (typeof value === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    // dd/mm/yyyy
    [day, month, year] = value.split("/");
  } else if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    // yyyy-mm-dd
    [year, month, day] = value.split("-");
  } else {
    return "";
  }
  if (format === 'yyyy-mm-dd') {
    return `${year}-${month}-${day}`;
  } else {
    return `${day}/${month}/${year}`;
  }
}

function resolveNum(value: unknown): string {
  if (value === "" || value === null || value === undefined) {
    return "SN";
  }
  return String(value);
}

function cleanDocProp(value: unknown): string {
  if (typeof value !== "string") return value ? String(value) : "";
  return value.replace(/[^a-zA-Z0-9]/g, "");
}

function formatRenavam(value: unknown): string {
  if (!value) return "";
  const renavam = String(value).replace(/\D/g, "");
  // Preenche com zeros à esquerda até 11 caracteres, se tiver menos de 11
  if (renavam.length < 11) {
    return renavam.padStart(11, "0");
  }
  return renavam;
}

function truncateString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  const cleaned = value.trim().replace(/\s+/g, ' ');
  return cleaned.length > maxLength ? cleaned.substring(0, maxLength).trim() : cleaned;
}

function preserveTextSpaces(value: unknown, maxLength?: number): string {
  if (typeof value !== "string") return "";
  // Normaliza espaços múltiplos para um único espaço
  // Remove apenas espaços do final com trimEnd(), preservando espaços do início e meio
  const cleaned = value.replace(/\s+/g, ' ').trimEnd();
  return maxLength && cleaned.length > maxLength ? cleaned.substring(0, maxLength) : cleaned;
}

function getCodigoIbgePorNome(nome: string): number | undefined {
  if (!nome) return undefined;
  const mun = (municipios as Array<{ nome: string; codigo_ibge: number }>).find(
    m => m.nome.trim().toLowerCase() === nome.trim().toLowerCase()
  );
  return mun?.codigo_ibge;
}

/**
 * Retorna o código IBGE do estado baseado na sigla ou valida se já é um código
 * @param uf - Sigla do estado (SP) ou código IBGE (35)
 * @returns Código IBGE do estado ou undefined se não encontrado
 */
export function getCodigoIbgeUf(uf: string | number): number | undefined {
  if (!uf) return undefined;
  
  const ufStr = String(uf).trim().toUpperCase();
  const ufNum = parseInt(ufStr, 10);
  
  // Se é um número válido, verifica se existe um estado com esse código
  if (!isNaN(ufNum)) {
    const estado = (estados as Array<{ id: number; sigla: string }>).find(
      e => e.id === ufNum
    );
    return estado?.id;
  }
  
  // Se é uma sigla (SP, MG, RJ, etc.), procura pelo id
  const estado = (estados as Array<{ id: number; sigla: string }>).find(
    e => e.sigla === ufStr
  );
  return estado?.id;
}
