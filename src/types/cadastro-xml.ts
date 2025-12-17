

export type MotoristaData = {
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

export type ProprietarioData = {
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

export type VeiculoData = {
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

export type ParticipanteData = {
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
