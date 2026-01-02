import type { MotoristaData, ProprietarioData, VeiculoData, ParticipanteData } from "@/types/cadastro-xml";
import municipios from "@/municipios.json"; // ajuste o caminho se necessário

export type CadastroType = 
  'motorista' | 
  'veiculo' | 
  'transportador' | 
  'pessoa_fisica' | 
  'pessoa_juridica';

function escapeXml(value: string | undefined | null): string {
  if (!value) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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
      value === '' ||
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
        CPF: row.CPF,
        RG: row.RG,
        ufRG: row.ufRG,
        expedRG: row.expedRG,
        dtExpedRG: row.dtExpedRG,
        xNome: row.xNome,
        dtNascto: excelDateToISO(row.dtNascto),
        nomeMae: row.nomeMae,
        Sexo: row.Sexo,
        Natural: row.Natural,
        dtPrimHabilit: row.dtPrimHabilit,
        Ender: {
          CEP: row.CEP,
          xLgr: row.xLgr,
          nro: row.nro,
          xBairro: row.xBairro,
          xCpl: row.xCpl,
          cMun: resolveCMun(row.cMun),
        },
        nCNH: row.nCNH,
        nSegCNH: row.nSegCNH,
        catCNH: row.catCNH,
        dtVencCNH: excelDateToISO(row.dtVencCNH),
        PIS: row.PIS,
        xDocContrat: row.xDocContrat,
        tpFunc: row.tpFunc,
        Email: row.Email,
        Telefone: row.Telefone,
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
        RENAVAM: row.RENAVAM,
        tara: row.tara,
        capKG: row.capKG,
        capM3: row.capM3,
        tpRod: row.tpRod,
        tpCar: row.tpCar,
        UF: row.UF,
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
          CEP: row.CEP,
          xLgr: row.xLgr,
          nro: row.nro,
          xBairro: row.xBairro,
          xCpl: row.xCpl,
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
            CPF: row.CPF,
            RG: row.RG,
            ufRG: row.ufRG,
            expedRG: row.expedRG,
            dtExpedRG: row.dtExpedRG,
            xNome: row.xNome,
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
            xRazaoSocial: row.xRazaoSocial,
            xNomeFant: row.xNomeFant,
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
          CPF: row.CPF,
          RG: row.RG,
          ufRG: row.ufRG,
          expedRG: row.expedRG,
          dtExpedRG: row.dtExpedRG,
          xNome: row.xNome,
          dtNascto: row.dtNascto,
          Email: row.Email,
          Telefone: cleanDocProp(row.Telefone),
          Sexo: row.Sexo,
          Natural: row.Natural,
          Raca: row.Raca,
        },
        Ender: {
          CEP: row.CEP,
          xLgr: row.xLgr,
          nro: row.nro,
          xBairro: row.xBairro,
          xCpl: row.xCpl,
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
          CEP: row.CEP,
          xLgr: row.xLgr,
          nro: row.nro,
          xBairro: row.xBairro,
          xCpl: row.xCpl,
          cMun: resolveCMun(row.cMun),
        },
      };
    default:
      return row;
  }
}

function excelDateToISO(value: unknown): string {
  if (typeof value === "number") {
    // Excel date serial number to JS Date
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    // Corrige fuso horário
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() + userTimezoneOffset);
    return localDate.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    // dd/mm/yyyy para yyyy-mm-dd
    const [d, m, y] = value.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  return "";
}

function cleanDocProp(value: unknown): string {
  if (typeof value !== "string") return "";
  // Remove espaços e caracteres especiais, mantendo apenas letras e números
  return value.replace(/[^a-zA-Z0-9]/g, "");
}

function getCodigoIbgePorNome(nome: string): number | undefined {
  if (!nome) return undefined;
  const mun = (municipios as Array<{ nome: string; codigo_ibge: number }>).find(
    m => m.nome.trim().toLowerCase() === nome.trim().toLowerCase()
  );
  return mun?.codigo_ibge;
}
