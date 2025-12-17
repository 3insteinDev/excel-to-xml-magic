import type { MotoristaData, ProprietarioData, VeiculoData, ParticipanteData } from "@/types/cadastro-xml";

export type CadastroType = 'motorista' | 'veiculo' | 'transportador' | 'pessoa_fisica' | 'pessoa_juridica';

function escapeXml(value: string | undefined | null): string {
  if (!value) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function objectToXml(obj: Record<string, unknown>, indent: string = ''): string {
  let xml = '';
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined || value === '') continue;
    
    if (typeof value === 'object' && !Array.isArray(value)) {
      xml += `${indent}<${key}>\n`;
      xml += objectToXml(value as Record<string, unknown>, indent + '  ');
      xml += `${indent}</${key}>\n`;
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
  const rootTag = getRootTag(type);
  const itemTag = getItemTag(type);
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<${rootTag}>\n`;
  
  for (const item of data) {
    xml += `  <${itemTag}>\n`;
    xml += `    <Autentic>\n`;
    xml += `      <xCNPJ>${escapeXml(cnpj)}</xCNPJ>\n`;
    xml += `      <xToken>${escapeXml(token)}</xToken>\n`;
    xml += `    </Autentic>\n`;
    xml += objectToXml(item, '    ');
    xml += `  </${itemTag}>\n`;
  }
  
  xml += `</${rootTag}>`;
  
  return xml;
}

function getRootTag(type: CadastroType): string {
  const tags: Record<CadastroType, string> = {
    motorista: 'Motoristas',
    veiculo: 'Veiculos',
    transportador: 'Transportadores',
    pessoa_fisica: 'PessoasFisicas',
    pessoa_juridica: 'PessoasJuridicas',
  };
  return tags[type];
}

function getItemTag(type: CadastroType): string {
  const tags: Record<CadastroType, string> = {
    motorista: 'Motorista',
    veiculo: 'Veiculo',
    transportador: 'Transportador',
    pessoa_fisica: 'PessoaFisica',
    pessoa_juridica: 'PessoaJuridica',
  };
  return tags[type];
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
        dtNascto: row.dtNascto,
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
          cMun: row.cMun,
        },
        nCNH: row.nCNH,
        nSegCNH: row.nSegCNH,
        catCNH: row.catCNH,
        dtVencCNH: row.dtVencCNH,
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
        xDocProp: row.xDocProp,
        nEixos: row.nEixos,
        Cor: row.Cor,
        AnoFabric: row.AnoFabric,
        AnoMod: row.AnoMod,
        Chassi: row.Chassi,
        Marca: row.Marca,
        Modelo: row.Modelo,
        cMunEmplac: row.cMunEmplac,
        xDocAgreg: row.xDocAgreg,
        TAG: {
          xCNPJEmissor: row.xCNPJEmissor,
          nTAG: row.nTAG,
        },
      };
    case 'transportador':
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
          qtdDepend: row.qtdDepend,
          Telefone: row.Telefone,
          Sexo: row.Sexo,
          Natural: row.Natural,
          Raca: row.Raca,
        },
        pJuridica: {
          xCNPJ: row.xCNPJEmpresa,
          xIE: row.xIE,
          xIM: row.xIM,
          xRazaoSocial: row.xRazaoSocial,
          xNomeFant: row.xNomeFant,
          tpPart: row.tpPart,
          Email: row.EmailEmpresa,
          Telefone: row.TelefoneEmpresa,
          tpEmpresa: row.tpEmpresa,
        },
        Ender: {
          CEP: row.CEP,
          xLgr: row.xLgr,
          nro: row.nro,
          xBairro: row.xBairro,
          xCpl: row.xCpl,
          cMun: row.cMun,
        },
        RNTRC: row.RNTRC,
        dtVencRNTRC: row.dtVencRNTRC,
        tpProp: row.tpProp,
        Cartao: {
          tpCartao: row.tpCartao,
          nCartao: row.nCartao,
          tpOpera: row.tpOpera,
        },
      };
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
          Telefone: row.Telefone,
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
          cMun: row.cMun,
        },
      };
    case 'pessoa_juridica':
      return {
        idUsuario: row.idUsuario,
        pJuridica: {
          xCNPJ: row.xCNPJ,
          xIE: row.xIE,
          xIM: row.xIM,
          xRazaoSocial: row.xRazaoSocial,
          xNomeFant: row.xNomeFant,
          tpPart: row.tpPart,
          Email: row.Email,
          Telefone: row.Telefone,
        },
        Ender: {
          CEP: row.CEP,
          xLgr: row.xLgr,
          nro: row.nro,
          xBairro: row.xBairro,
          xCpl: row.xCpl,
          cMun: row.cMun,
        },
      };
    default:
      return row;
  }
}
