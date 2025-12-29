# Excel to XML Magic

## Sobre o projeto

Este projeto converte dados de planilhas Excel para XML e envia para a API do Controle Embarque.

Tecnologias utilizadas:
- Vite
- React + TypeScript
- Tailwind CSS
- shadcn-ui

---

## Como rodar o projeto localmente

### 1. Pré-requisitos

- Node.js (recomendado: versão 18 ou superior)
- npm (geralmente já vem com o Node.js)

### 2. Clonar o repositório

```sh
git clone <URL_DO_SEU_REPOSITORIO>
cd excel-to-xml-magic
```

### 3. Instalar as dependências

```sh
npm install
```

### 4. Rodar o servidor de desenvolvimento

```sh
npm run dev
```

O projeto estará disponível em [http://localhost:3010](http://localhost:3010) (ou na porta exibida no terminal).

---

## Passo a passo de uso

1. **Selecione o tipo de cadastro**  
   Escolha entre Motorista, Veículo, Transportador, Pessoa Física ou Pessoa Jurídica.

2. **Faça upload da planilha Excel**  
   Envie o arquivo conforme o tipo selecionado.

3. **Informe CNPJ e Token**  
   Preencha os dados de autenticação.

4. **Revise o XML gerado**  
   Confira e edite os XMLs antes de enviar.

5. **Envie os XMLs para a API**  
   Clique em "Enviar XML" para processar os dados.

6. **Selecione o ambiente (Homologação ou Produção)**  
   Use o seletor no canto inferior direito para alternar entre os ambientes de envio.

---

## Dúvidas ou problemas?

Abra uma issue ou entre em contato com o responsável pelo projeto.
