# Lista de Mercado Fácil

Aplicativo mobile para criação e organização inteligente de listas de compras de supermercado.

A proposta do projeto é resolver um problema comum: depois de montar uma lista de compras, ainda é necessário reorganizar mentalmente os itens conforme os setores do supermercado. O **Lista de Mercado Fácil** busca reduzir esse atrito agrupando e ordenando os produtos por setores, permitindo que a compra siga uma rota mais prática, simples e eficiente.

O aplicativo é uma iniciativa pessoal, gratuita, sem anúncios, sem login obrigatório e sem dependência de serviços pagos para sua função principal. A ideia é criar algo útil para uso próprio e também compartilhar com outras pessoas.

---

## Objetivo do projeto

Criar um aplicativo mobile offline-first que permita:

- montar listas de compras rapidamente;
- organizar os itens por setor do supermercado;
- manter supermercados cadastrados com ordem própria de setores;
- permitir que o usuário personalize a organização conforme sua realidade;
- funcionar sem internet para as funcionalidades principais;
- evoluir com aprendizado local a partir das correções feitas pelo usuário;
- manter uma experiência simples, bonita, moderna e user friendly.

---

## Problema que o app resolve

Em muitos aplicativos de lista de compras, o usuário adiciona os produtos em qualquer ordem e depois precisa reorganizar a compra durante o percurso no mercado.

Exemplo de lista comum:

```text
Arroz
Banana
Detergente
Leite
Carne
Papel higiênico
Café
```

O aplicativo deve transformar essa lista em algo mais útil:

```text
Hortifruti
- Banana

Açougue
- Carne

Mercearia
- Arroz
- Café

Frios e Laticínios
- Leite

Limpeza
- Detergente

Higiene
- Papel higiênico
```

Com isso, o usuário evita ficar indo e voltando pelos corredores do supermercado.

---

## Princípios do projeto

- Uso gratuito.
- Sem anúncios.
- Sem monetização obrigatória.
- Sem login obrigatório no MVP.
- Funcionamento offline-first.
- Baixa dependência de serviços externos.
- Interface simples e agradável.
- Código limpo e organizado.
- Arquitetura preparada para evolução.
- Testes desde as primeiras funcionalidades.
- Persistência local dos dados principais.

---

## Status atual

Projeto em desenvolvimento inicial.

### Já definido

- Nome do app: **Lista de Mercado Fácil**.
- Nome do repositório: `lista-mercado-facil`.
- Stack principal: React Native, Expo e TypeScript.
- Banco local: SQLite.
- Preferências simples: AsyncStorage.
- Estado global: Redux Toolkit.
- Arquitetura: Clean Architecture adaptada para mobile.
- Tema claro e escuro.
- Tema salvo localmente.
- Interface mobile-first.
- Navegação inferior.
- Supermercado inicial via seed editável: **Zaffari Fernandes Vieira**.

### Em implementação

- Primeira versão funcional da lista de compras.
- Adição de itens.
- Categorização local por regras.
- Agrupamento por setores.
- Marcar item como comprado.
- Remover item da lista.

---

## Stack técnica

### Mobile

- React Native
- Expo
- TypeScript
- React
- Redux Toolkit
- React Redux
- React Navigation
- Expo SQLite
- AsyncStorage
- Expo Linear Gradient

### Testes

- Jest
- Jest Expo
- React Native Testing Library

### Desenvolvimento

- Visual Studio Code
- Node.js LTS
- Git
- GitHub
- Android Studio, quando necessário para emulador Android
- Expo Go, para testes em dispositivo físico

---

## Ambiente de desenvolvimento

Este projeto foi pensado para ser desenvolvido no **Visual Studio Code**, usando o terminal integrado.

Ferramentas recomendadas:

- Visual Studio Code
- Node.js LTS
- Git
- Expo
- Android Studio
- Expo Go
- GitHub

Extensões recomendadas para o VS Code:

| Extensão | Finalidade |
|---|---|
| ESLint | Análise estática e padronização |
| Prettier | Formatação automática |
| React Native Tools | Apoio ao desenvolvimento React Native |
| GitLens | Apoio ao versionamento Git |
| SQLite Viewer | Visualização de banco SQLite |
| Jest | Apoio aos testes unitários |
| Error Lens | Visualização rápida de erros |

---

## Decisões técnicas

### React Native com Expo

O Expo foi escolhido para acelerar o desenvolvimento, facilitar testes em dispositivo físico e simplificar o processo de build inicial.

### TypeScript

O TypeScript será usado como linguagem principal para melhorar previsibilidade, segurança de tipos e manutenção do código.

### SQLite

O SQLite será usado para armazenar dados principais do aplicativo, como:

- supermercados;
- setores;
- listas;
- itens;
- histórico;
- preferências aprendidas pelo app.

### AsyncStorage

O AsyncStorage será usado apenas para preferências simples, como:

- tema selecionado;
- último supermercado selecionado;
- flags simples de configuração.

### Redux Toolkit

O Redux Toolkit será usado para estado global previsível e testável, principalmente em:

- tema atual;
- lista em edição;
- supermercado selecionado;
- estado visual de telas;
- futuras sincronizações.

### Clean Architecture

A arquitetura será separada em camadas para evitar acoplamento entre regra de negócio, interface e infraestrutura.

---

## Arquitetura proposta

```text
src/
  app/
    navigation/
    providers/
    store/
    theme/

  domain/
    entities/
    repositories/
    services/
    use-cases/
    value-objects/

  application/
    dtos/
    mappers/
    state/

  infrastructure/
    database/
    repositories/
    seed/
    services/

  presentation/
    components/
    hooks/
    screens/
    view-models/

  shared/
    constants/
    errors/
    types/
    utils/
```

---

## Camadas da aplicação

### app

Responsável pela configuração da aplicação:

- providers globais;
- store Redux;
- navegação;
- tema;
- inicialização.

### domain

Camada de regra de negócio pura.

Deve conter:

- entidades;
- contratos de repositórios;
- serviços de domínio;
- casos de uso;
- regras de categorização e ordenação.

Essa camada não deve depender de React Native, SQLite, Redux ou navegação.

### application

Camada de orquestração entre domínio e interface.

Pode conter:

- DTOs;
- mappers;
- slices Redux;
- comandos;
- queries;
- adaptação de dados para tela.

### infrastructure

Camada de detalhes técnicos.

Deve conter:

- acesso ao SQLite;
- implementação dos repositórios;
- seeds iniciais;
- serviços locais;
- futura integração com APIs.

### presentation

Camada de interface.

Deve conter:

- telas;
- componentes reutilizáveis;
- hooks de tela;
- view models;
- estilos conectados ao tema.

---

## Entidades principais previstas

```text
Market
MarketSection
ShoppingList
ShoppingListItem
ProductCategory
ProductSuggestion
UserProductPreference
PurchaseHistory
```

### Market

Representa um supermercado cadastrado pelo usuário.

Exemplos:

- Zaffari Fernandes Vieira
- Outro supermercado cadastrado manualmente

### MarketSection

Representa um setor/corredor de um supermercado.

Exemplos:

- Hortifruti
- Padaria
- Açougue
- Frios e Laticínios
- Mercearia
- Bebidas
- Limpeza
- Higiene
- Pet
- Utilidades
- Outros

### ShoppingList

Representa uma lista de compras.

### ShoppingListItem

Representa um item dentro de uma lista.

### UserProductPreference

Representa uma correção ou preferência do usuário.

Exemplo:

Se o app classificar “queijo” como Mercearia, mas o usuário corrigir para Frios e Laticínios, essa preferência poderá ser salva localmente para melhorar futuras classificações.

---

## Supermercado inicial

O projeto terá um supermercado inicial cadastrado por seed:

```text
Zaffari Fernandes Vieira
```

Importante: essa informação não deve ser fixa no código da interface. Ela deve existir como dado inicial no banco local e poderá ser editada pelo usuário futuramente.

---

## Setores iniciais sugeridos

```text
Hortifruti
Padaria
Açougue
Peixaria
Frios e Laticínios
Congelados
Mercearia
Massas e Grãos
Enlatados e Conservas
Bebidas
Higiene
Limpeza
Pet
Utilidades
Outros
Caixa
```

A ordem dos setores deve ser configurável por supermercado.

---

## Inteligência local

A primeira versão não depende de IA generativa.

A organização inteligente será baseada em:

- dicionário local de produtos;
- palavras-chave;
- sinônimos;
- regras simples;
- setor padrão;
- preferências corrigidas pelo usuário;
- ordem dos setores do supermercado selecionado.

### Exemplo de categorização

```text
banana -> Hortifruti
arroz -> Mercearia
leite -> Frios e Laticínios
detergente -> Limpeza
sabonete -> Higiene
ração -> Pet
```

Quando o produto não for reconhecido, ele será classificado como:

```text
Outros
```

---

## IA generativa

A IA generativa pode ser avaliada em uma fase futura, mas não será obrigatória para o funcionamento principal.

Possíveis usos futuros:

- interpretar listas em texto livre;
- sugerir produtos para ocasiões específicas;
- transformar frases em listas estruturadas;
- sugerir categorias para itens não reconhecidos.

Exemplo futuro:

```text
Preciso comprar coisas para um churrasco no sábado.
```

O app poderia sugerir:

```text
Carne
Pão de alho
Carvão
Refrigerante
Guardanapo
Sal grosso
```

Porém, por decisão de projeto, o app deve continuar funcionando sem internet, sem IA e sem serviços pagos.

---

## Tema e experiência visual

O aplicativo possui suporte a tema claro e tema escuro.

### Tema claro

Direção visual:

- azul;
- branco;
- cinza claro;
- cards limpos;
- aparência moderna;
- foco em legibilidade.

### Tema escuro

Direção visual:

- azul escuro;
- ciano;
- cards escuros;
- alto contraste;
- visual moderno sem excesso de brilho.

### Persistência do tema

O tema selecionado pelo usuário deve ser salvo localmente com AsyncStorage.

Ao fechar e abrir o app novamente, o tema escolhido deve ser mantido.

---

## Funcionalidades do MVP

### Tela inicial

- Apresentar o aplicativo.
- Permitir acesso rápido à lista.
- Permitir acesso aos supermercados.
- Permitir acesso às configurações.

### Tela de lista

- Adicionar item.
- Classificar item por setor.
- Agrupar itens por setor.
- Marcar item como comprado.
- Remover item.
- Exibir itens comprados de forma visualmente diferente.

### Tela de supermercados

- Exibir supermercados cadastrados.
- Exibir supermercado inicial vindo do seed.
- Preparar edição futura de ordem dos setores.

### Tela de configurações

- Alternar tema claro/escuro.
- Persistir preferência localmente.

---

## Roadmap

### Fase 1: Base do app

- Criar projeto React Native com Expo.
- Configurar TypeScript.
- Configurar navegação.
- Configurar Redux Toolkit.
- Configurar tema claro/escuro.
- Criar layout mobile-first.
- Criar README inicial.

### Fase 2: Lista funcional

- Adicionar itens à lista.
- Classificar itens por regras locais.
- Agrupar itens por setor.
- Marcar item como comprado.
- Remover item.
- Melhorar experiência da tela de lista.

### Fase 3: Persistência com SQLite

- Criar tabelas locais.
- Persistir supermercados.
- Persistir setores.
- Persistir listas.
- Persistir itens.
- Criar seed inicial.
- Carregar dados ao abrir o app.

### Fase 4: Supermercados personalizados

- Criar supermercado.
- Editar supermercado.
- Reordenar setores.
- Definir supermercado padrão.
- Criar lista associada a supermercado.

### Fase 5: Aprendizado local

- Salvar correções de categoria feitas pelo usuário.
- Priorizar preferências do usuário na categorização.
- Sugerir categoria com base no histórico.
- Sugerir itens frequentes.

### Fase 6: Histórico

- Salvar listas anteriores.
- Reutilizar listas.
- Recomprar itens frequentes.
- Criar listas recorrentes.

### Fase 7: Preparação para publicação

- Criar ícone do app.
- Criar splash screen.
- Revisar acessibilidade.
- Revisar textos.
- Gerar build Android.
- Preparar screenshots para Google Play.

### Fase 8: Recursos futuros

- Compartilhamento de lista.
- Importação por texto.
- Leitura de código de barras.
- Backup opcional.
- Sincronização opcional.
- IA generativa opcional.

---

## Instalação

Clone o repositório:

```bash
git clone https://github.com/V1-AndreFlores/lista-mercado-facil.git
```

Entre na pasta:

```bash
cd lista-mercado-facil
```

Instale as dependências:

```bash
npm install
```

Caso o projeto precise da dependência de gradiente:

```bash
npx expo install expo-linear-gradient
```

Caso precise instalar dependências Expo específicas:

```bash
npx expo install expo-sqlite @react-native-async-storage/async-storage react-native-screens react-native-safe-area-context
```

---

## Execução

Iniciar o Expo:

```bash
npx expo start
```

Iniciar limpando cache:

```bash
npx expo start -c
```

Executar no navegador:

```text
Pressione w no terminal do Expo.
```

Executar no Android:

```text
Pressione a no terminal do Expo, se o emulador Android estiver configurado.
```

Executar no celular físico:

```text
Abra o Expo Go e escaneie o QR Code exibido no terminal.
```

---

## Scripts previstos

```json
{
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "test": "jest",
  "test:watch": "jest --watch"
}
```

---

## Testes

O projeto deve ter testes unitários desde as primeiras regras de negócio.

Prioridades de teste:

- categorização de produtos;
- agrupamento por setor;
- ordenação conforme supermercado;
- marcação de item como comprado;
- preferências de usuário;
- reducers Redux;
- use cases de domínio.

Exemplo de regras a testar:

```text
banana deve ser classificada como Hortifruti
leite deve ser classificado como Frios e Laticínios
produto desconhecido deve ser classificado como Outros
itens comprados devem ser exibidos após os pendentes
```

Executar testes:

```bash
npm test
```

---

## Padrões de código

O projeto deve seguir:

- Clean Code;
- SOLID;
- separação de responsabilidades;
- nomes claros;
- funções pequenas;
- componentes reutilizáveis;
- regras de domínio fora da interface;
- baixa dependência entre camadas;
- testes para regras relevantes.

---

## Convenção de commits

Sugestão de padrão:

```text
feat: nova funcionalidade
fix: correção de bug
style: ajuste visual
refactor: refatoração sem mudança funcional
test: testes
chore: configuração ou manutenção
docs: documentação
```

Exemplos:

```bash
git add . && git commit -m "feat: adiciona tela de lista de compras" && git push
```

```bash
git add . && git commit -m "style: ajusta identidade visual mobile-first" && git push
```

```bash
git add . && git commit -m "docs: restaura README completo do projeto" && git push
```

---

## GitHub

Fluxo básico:

```bash
git status
git add .
git commit -m "mensagem do commit"
git push
```

Antes de alterações grandes, recomenda-se commitar o estado atual para facilitar rollback.

---

## Build futuro

Para publicação futura, o projeto poderá usar EAS Build.

Instalação do EAS CLI:

```bash
npm install -g eas-cli
```

Login:

```bash
eas login
```

Configuração inicial:

```bash
eas build:configure
```

Build Android:

```bash
eas build --platform android
```

---

## Publicação

A publicação futura na Google Play deve considerar:

- nome do app;
- descrição curta;
- descrição completa;
- screenshots;
- ícone;
- política de privacidade;
- classificação indicativa;
- ausência de anúncios;
- ausência de coleta desnecessária de dados;
- funcionamento offline.

---

## Privacidade

Diretrizes iniciais:

- não exigir login no MVP;
- não coletar dados pessoais sem necessidade;
- manter dados principais localmente no dispositivo;
- evitar dependência de analytics externo no início;
- deixar claro que o app funciona offline.

---

## Monetização

O projeto não tem objetivo de monetização.

Diretrizes:

- sem anúncios;
- sem cobrança obrigatória;
- sem paywall;
- sem recursos bloqueados por assinatura;
- sem dependência de serviços pagos para a função principal.

---

## Licença

Licença ainda não definida.

Sugestão futura: avaliar uma licença open source permissiva, como MIT, caso o objetivo seja permitir estudo, uso e contribuição por outras pessoas.

---

## Autor

Projeto criado por André Flores como iniciativa pessoal para resolver uma necessidade prática no dia a dia e compartilhar uma solução gratuita, simples e útil com outras pessoas.

