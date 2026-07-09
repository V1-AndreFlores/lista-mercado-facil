# Decisões técnicas

## 1. Aplicação offline-first

O aplicativo deve funcionar sem internet. A lista de compras, os supermercados, os setores, o histórico e as preferências aprendidas serão armazenados localmente no dispositivo.

## 2. SQLite como banco local principal

O SQLite será usado para dados estruturados e persistentes:

- supermercados;
- setores;
- ordem dos setores por supermercado;
- listas;
- itens;
- histórico;
- preferências aprendidas pelo usuário.

## 3. Sem login no MVP

O MVP não terá login para reduzir fricção de uso, complexidade técnica e dependência de backend.

## 4. Sem backend obrigatório no MVP

O domínio será preparado com interfaces de repositório para permitir sincronização futura, mas a primeira versão não dependerá de API externa.

## 5. Inteligência por regras locais

A primeira versão usará um motor local de categorização baseado em:

- palavras-chave;
- sinônimos;
- dicionário local;
- setor padrão;
- preferências aprendidas pelo usuário.

IA generativa poderá ser avaliada no futuro, mas não será obrigatória para o funcionamento do app.

## 6. Supermercado inicial como seed editável

O supermercado `Zaffari Fernandes Vieira` será inserido como dado inicial no banco local. Ele não será uma constante fixa de código e poderá ser editado ou removido pelo usuário.

## 7. Redux Toolkit para estado de interface

Redux Toolkit será usado para estado global de tela e fluxo de uso, como lista ativa, supermercado selecionado, carregamento e filtros. Regras de negócio permanecerão fora do Redux.

## 8. Clean Architecture adaptada ao React Native

A aplicação será separada por camadas:

- `domain`: entidades, contratos, regras e casos de uso;
- `application`: DTOs, mappers, comandos e queries;
- `infrastructure`: banco, repositórios concretos, seed e serviços externos;
- `presentation`: telas, componentes, hooks e view-models;
- `app`: bootstrap, providers, store e navegação.
