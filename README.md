# SM Vistoria

Aplicativo PWA para vistoria de veículos.

## Pré-requisitos

- Node.js (versão 18 ou superior)
- npm (geralmente vem com o Node.js)

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd sm-vistoria
```

2. Instale as dependências:
```bash
npm install
```

## Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

## Build

Para criar uma versão de produção:

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist`

## Servir versão de produção

Para servir a versão de produção localmente:

```bash
npm run serve
```

## Funcionalidades

- Checklist de vistoria com status (Válido/Inválido)
- Captura de fotos
- Interface responsiva
- Funciona offline (PWA)
- Armazenamento local dos dados 