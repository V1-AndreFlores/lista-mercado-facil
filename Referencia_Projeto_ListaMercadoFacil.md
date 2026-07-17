# Referência do Projeto — Lista de Mercado Fácil

Última atualização: 16/07/2026  
Versão da referência: 0.1.1

## 1. Identidade

- Nome: Lista de Mercado Fácil
- Pasta: `lista-mercado-facil`
- Slug Expo: `lista-mercado-facil`
- Versão pública atual: `0.1.1`
- Android package: `com.andre.alves.listamercadofacil`
- Projeto EAS: `4c4ca9bc-ec07-4190-896b-cbcac2a91b73`
- Idioma: Português do Brasil
- Moeda: Real brasileiro
- Funcionamento: gratuito, sem anúncios, sem login e offline-first
- Repositório: `https://github.com/V1-AndreFlores/lista-mercado-facil`
- Política de privacidade: `https://v1-andreflores.github.io/politica-de-privacidade/lista-de-mercado-facil/`

O package Android identifica o aplicativo no Google Play e não deve ser alterado após a primeira publicação. Uma troca desse identificador representa um aplicativo diferente para a loja.

## 2. Stack

- Expo SDK 57
- React Native 0.86
- React 19.2
- TypeScript 6
- Redux Toolkit
- React Redux
- React Navigation Native Stack
- Expo SQLite
- AsyncStorage
- Expo Linear Gradient
- Expo Build Properties
- Expo System UI
- Jest
- Jest Expo
- React Native Testing Library

## 3. Arquitetura

Clean Architecture adaptada ao React Native:

- `src/domain`: entidades, contratos de repositório, regras, serviços e casos de uso.
- `src/application`: DTOs, mapeadores, estado de tema e rotinas de inicialização.
- `src/infrastructure`: SQLite, AsyncStorage, repositórios concretos, seeds e integridade do banco.
- `src/presentation`: telas, componentes reutilizáveis, temas e splash.
- `src/app`: providers, Redux store e navegação.
- `src/shared`: constantes e utilitários de moeda, IDs e corredores.
- `src/__tests__`: testes unitários das regras principais.

Pontos de composição:

- Entrada: `App.tsx`.
- Providers: `src/app/providers/AppProviders.tsx`.
- Navegação: `src/app/navigation/AppNavigator.tsx`.
- Store: `src/app/store/store.ts`.

## 4. Navegação

Fluxo principal:

1. Splash
2. Início
3. Lista
4. Mercados
5. Ajustes

A navegação usa `createNativeStackNavigator`, sem cabeçalho nativo. A navegação inferior é customizada por `AppBottomNavigation`.

Rotas:

```text
Splash
Home
ShoppingList
Markets
Settings
```

## 5. Inicialização e splash

- A splash visual permanece por no mínimo 3 segundos.
- A imagem usada pela tela é `src/presentation/assets/splash/splash-lista-mercado-facil.png`.
- Três pontos animados são renderizados sobre a imagem.
- A navegação para Início usa `navigation.replace('Home')`.
- O tema persistido é carregado em `AppProviders`.
- As tarefas de abertura são coordenadas por `runAppStartupTasks`.

Atenção técnica:

- `AppStartupService.ts` possui atualmente pontos de integração para limpeza do histórico e integridade dos corredores padrão.
- A limpeza efetiva por retenção é executada ao carregar a tela Início, por meio de `pruneCompletedLists`.
- Uma evolução futura pode centralizar essa limpeza diretamente na rotina da splash, eliminando a duplicidade conceitual.

## 6. Persistência por plataforma

### Android e iOS

Os factories nativos utilizam SQLite:

- `SQLiteMarketRepository`
- `SQLiteShoppingListRepository`
- `SQLiteUserProductPreferenceRepository`

Banco:

```text
lista_mercado_facil.db
```

### Web

Os arquivos terminados em `.web.ts` selecionam implementações com AsyncStorage:

- `WebMarketRepository`
- `WebShoppingListRepository`
- `WebUserProductPreferenceRepository`

### Preferências simples

AsyncStorage também é usado para:

- tema claro/escuro;
- retenção do histórico;
- corredores padrão;
- identificadores ativos no ambiente Web.

## 7. Banco SQLite

Tabelas atuais:

- `app_metadata`
- `markets`
- `market_sections`
- `product_categories`
- `shopping_lists`
- `shopping_list_items`
- `user_product_preferences`

Índice atual:

```sql
idx_user_product_preferences_lookup
```

Integridade referencial:

- `PRAGMA foreign_keys = ON`.
- Corredores são removidos em cascata quando o mercado correspondente é removido.
- Itens são removidos em cascata quando a lista correspondente é removida.

## 8. Seed e integridade do banco

Seed atual:

```text
2026-07-11-sqlite-seed-v2
```

Versão de integridade SQLite:

```text
2026-07-11-sqlite-integrity-v1
```

A inicialização:

1. abre o banco;
2. habilita chaves estrangeiras;
3. cria o schema quando necessário;
4. executa o seed;
5. aplica verificações de integridade e migrações locais.

Migrações defensivas atuais adicionam, quando necessário:

- `market_sections.aisle_number`;
- `shopping_list_items.unit_price_cents`;
- `shopping_lists.status`;
- `shopping_lists.completed_at`;
- `shopping_list_items.unit`.

## 9. Mercado inicial

Mercado inicial:

```text
Zaffari Fernandes Vieira
```

Identificador:

```text
market-zaffari-fernandes-vieira
```

Regras de integridade:

- o endereço é mantido como `NULL`;
- o mercado é identificado pelo ID ou pelo nome normalizado;
- os corredores do seed são reaplicados nas atualizações de integridade atuais;
- um mercado válido é selecionado caso o mercado ativo armazenado não exista mais.

A lista atual possui corredores numerados de 01 a 13 e áreas sem número, exibidas como `--`.

## 10. Corredores padrão

Implementação:

```text
src/infrastructure/repositories/DefaultMarketSectionRepository.ts
```

Chaves AsyncStorage:

```text
@lista-mercado-facil:default-market-sections
@lista-mercado-facil:default-market-sections-version
```

Versão atual:

```text
2026-07-11-sqlite-integrity-v1
```

Regras:

- deve existir pelo menos um corredor padrão;
- a ordem é normalizada sequencialmente;
- nomes vazios são removidos;
- espaços repetidos são normalizados;
- número do corredor é opcional e sanitizado;
- novos mercados recebem uma cópia dos corredores padrão;
- alterações nos corredores padrão não devem alterar mercados já criados.

## 11. Mercados

Funcionalidades atuais:

- criar mercado;
- editar nome;
- excluir mercado com confirmação;
- impedir exclusão do último mercado;
- selecionar mercado ativo;
- criar mercado com os corredores padrão;
- editar corredores do mercado;
- incluir, editar e excluir corredor;
- reordenar corredores;
- aceitar números repetidos;
- limitar e normalizar o número do corredor;
- exibir número com dois dígitos ou `--`;
- bloquear nomes duplicados;
- sugerir correções de nomes de corredores.

A exclusão de um corredor não remove itens ou históricos existentes. Os registros preservam o nome do corredor já associado.

## 12. Listas de compras

Estados:

```text
active
completed
```

Regras principais:

- uma lista pode ser criada e selecionada como ativa;
- o nome é opcional;
- nome padrão: `Compra do dia`;
- listas concluídas não podem voltar a ser ativas diretamente;
- uma lista concluída pode ser reutilizada, gerando uma nova lista ativa;
- a reutilização redefine todos os itens para não comprados;
- listas e itens podem ser excluídos fisicamente;
- limpar lista remove todos os itens da lista ativa;
- concluir compra cria automaticamente uma nova lista vazia para o mercado atual.

Atenção técnica:

- a implementação atual marca a lista inteira como concluída sem remover itens que não foram marcados como comprados;
- o total financeiro do histórico considera somente os itens comprados.

## 13. Itens da lista

Dados principais:

- nome original;
- nome normalizado;
- quantidade;
- unidade;
- preço unitário opcional em centavos;
- corredor;
- categoria opcional;
- situação comprado/não comprado;
- datas de criação e alteração.

Regras:

- quantidade inválida, vazia ou menor que 1 é normalizada para 1;
- o campo de quantidade aceita somente números inteiros na interface atual;
- produtos repetidos são bloqueados por nome normalizado;
- preço unitário é opcional;
- preços são armazenados em centavos;
- preço é digitado e exibido no padrão `pt-BR`;
- alteração manual do corredor gera preferência local;
- os itens podem ser editados, removidos e marcados como comprados.

## 14. Categorização e preferências locais

Serviços de domínio:

- `ProductCategorizer`
- `ShoppingListDuplicateGuard`
- `ShoppingListSorter`
- `suggestMarketSectionName`

A categorização considera:

- categorias padrão;
- palavras-chave;
- normalização de acentos e caixa;
- preferências locais por produto;
- preferência específica por mercado quando disponível.

Tabela SQLite:

```text
user_product_preferences
```

A chave de consulta combina o nome normalizado do produto e o mercado opcional.

## 15. Ordenação da lista

A lista é agrupada e ordenada conforme a rota de corredores do mercado ativo.

Regras adicionais:

- corredores seguem `routeOrder`;
- itens comprados permanecem identificados;
- grupos totalmente comprados são deslocados para o final da rota;
- corredores não encontrados usam tratamento de fallback.

## 16. Valores e totais

Utilitário:

```text
src/shared/utils/money.ts
```

Regras:

- valores são persistidos em centavos;
- o preço unitário é opcional;
- `Total previsto` soma todos os itens com preço informado;
- `Total no carrinho` soma somente itens marcados como comprados;
- os totais são exibidos quando há ao menos um preço informado;
- cada item pode exibir preço unitário e total calculado pela quantidade;
- ao cadastrar novamente um produto, o sistema pode sugerir o preço mais recente do histórico;
- ao reutilizar uma lista, o preço mais recente conhecido tem prioridade.

## 17. Histórico

A tela Início apresenta listas concluídas com:

- nome da lista;
- data;
- hora e minuto;
- nome do supermercado;
- quantidade de itens;
- total dos itens comprados quando houver preços;
- visualização detalhada da compra;
- reutilização da lista;
- exclusão individual com confirmação.

O histórico é ordenado pela data de conclusão ou última atualização, da mais recente para a mais antiga.

## 18. Retenção do histórico

Opções:

- Sempre;
- Últimos 30 dias;
- Últimos 60 dias;
- Últimos 90 dias.

Chave:

```text
@lista-mercado-facil:app-settings
```

A limpeza remove listas concluídas anteriores ao limite configurado e preserva listas ativas.

Implementações:

- SQLite: consulta os IDs antigos e remove listas e itens.
- Web: filtra e persiste novamente o conjunto válido no AsyncStorage.

## 19. Aparência

Temas:

```text
light
dark
```

- a preferência é persistida localmente;
- a navegação recebe as cores do tema atual;
- o tema escuro usa identidade azul escura;
- o switch de tema é customizado;
- headers, cards, botões e navegação inferior usam componentes reutilizáveis.

Componentes principais:

- `AppActionCard`
- `AppBottomNavigation`
- `AppButton`
- `AppCard`
- `AppGradientHeader`
- `AppHeroCard`
- `AppScreen`
- `AppText`
- `AppThemeSwitch`

## 20. Testes automatizados

Suites atuais:

- `ProductCategorizer.test.ts`
- `SQLiteShoppingListMapper.test.ts`
- `ShoppingListDuplicateGuard.test.ts`
- `ShoppingListSorter.purchased.test.ts`
- `ShoppingListSorter.test.ts`
- `createMarketWithDefaultSections.test.ts`
- `reorderMarketSections.test.ts`
- `shoppingListSlice.test.ts`
- `themeSlice.test.ts`

Comandos:

```bash
npm test
npm run typecheck
```

Validação da versão 0.1.1: 9 suites e 22 testes aprovados, além do TypeScript sem erros. Antes de cada publicação, repetir as validações após uma instalação limpa das dependências.

## 21. Configuração Android e EAS

Arquivo Expo:

```text
app.json
```

Configuração dinâmica:

```text
app.config.js
```

Arquivo EAS:

```text
eas.json
```

Configurações principais:

- `cli.appVersionSource: remote`;
- `build.production.autoIncrement: true`;
- `build.production.android.buildType: app-bundle`;
- `ENABLE_ANDROID_RELEASE_OPTIMIZATION=true` apenas em produção;
- `expo-system-ui` configurado para aplicar `userInterfaceStyle: automatic` no Android;
- perfis `development` e `preview` continuam sem R8;
- o `versionCode` Android é controlado remotamente pelo EAS.

## 22. Otimização do build Android — versão 0.1.1

A compilação Android de produção utiliza otimização e ofuscação nativas:

- dependência `expo-build-properties ~57.0.3`;
- dependência `expo-system-ui ~57.0.0`, eliminando o aviso de configuração do estilo nativo no Android;
- `enableMinifyInReleaseBuilds: true`, ativando o R8 nos builds Android de release;
- `enableShrinkResourcesInReleaseBuilds: true`, removendo recursos Android não utilizados;
- remoção de código Java/Kotlin não utilizado durante a otimização;
- geração do arquivo de desofuscação `mapping.txt`;
- inclusão automática do arquivo de mapeamento no Android App Bundle;
- configuração aplicada somente quando `ENABLE_ANDROID_RELEASE_OPTIMIZATION=true`.

A seleção por perfil é feita por configuração dinâmica:

- `app.config.js` remove configurações duplicadas do plugin;
- o plugin é adicionado somente quando o sinalizador de produção está ativo;
- `eas.json` define o sinalizador somente no perfil `production`;
- `development` e `preview` permanecem sem minificação e sem redução de recursos.

A alteração é nativa e exige um novo build EAS.

Comando de produção:

```bash
eas build -p android --profile production
```

Consultar o `versionCode` remoto:

```bash
eas build:version:get -p android -e production
```

Definir ou sincronizar o último `versionCode`, quando necessário:

```bash
eas build:version:set -p android -e production
```

## 23. Validação do build otimizado

Antes do envio ao Google Play, testar o build de produção em dispositivo físico, com foco em:

- abertura e splash;
- inicialização do SQLite;
- seed e integridade do Zaffari;
- criação, edição e exclusão de mercados;
- corredores padrão;
- criação e troca de listas;
- inclusão e edição de produtos;
- categorização e alteração de corredor;
- preços e totais;
- conclusão e reutilização de compras;
- retenção e exclusão do histórico;
- tema claro e escuro;
- inicialização sem conexão com a internet.

Se uma biblioteca nativa usar reflexão ou carregamento dinâmico incompatível com o R8, poderão ser necessárias regras adicionais em `extraProguardRules`. Não adicionar regras preventivamente sem evidência de falha no build ou em execução.

## 24. Checklist para Google Play

### Build

- gerar `.aab` com perfil `production`;
- confirmar `versionCode` único;
- confirmar versão pública `0.1.1`;
- testar o artefato otimizado;
- verificar o relatório de pré-lançamento;
- confirmar ausência de crashes e ANRs bloqueantes.

### Identidade visual

- ícone geral: `assets/icon.png`, 1024 × 1024;
- ícone Android: `assets/icon-android.png`, 1024 × 1024;
- foreground adaptativo: `assets/adaptive-icon-android.png`, 1024 × 1024;
- ícone iOS: `assets/icon-ios.png`, 1024 × 1024;
- cor do ícone adaptativo: `#063B8F`;
- splash interna: `src/presentation/assets/splash/splash-lista-mercado-facil.png`.

### Ficha da loja

- nome: Lista de Mercado Fácil;
- descrição curta;
- descrição completa;
- ícone de alta resolução;
- imagem de destaque;
- capturas de tela de celular;
- categoria do app;
- e-mail de suporte;
- política de privacidade.

### Conteúdo do app

- declarar que não há anúncios;
- declarar que não há login obrigatório;
- preencher segurança dos dados conforme o armazenamento local real;
- preencher classificação indicativa;
- definir público-alvo e conteúdo;
- informar acesso ao app sem credenciais;
- selecionar países e regiões de distribuição.

## 25. Arquivos alterados na versão 0.1.1

- `app.json`
- `app.config.js`
- `eas.json`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `jest.config.js`
- `src/presentation/components/AppBottomNavigation.tsx`
- `src/presentation/screens/HomeScreen.tsx`
- `src/__tests__/ProductCategorizer.test.ts`
- `Referencia_Projeto_ListaMercadoFacil.md`

Além da otimização de produção, esta versão corrige a referência de tipo da navegação, habilita os tipos globais do Jest no TypeScript, ajusta a transformação de `@reduxjs/toolkit` e `immer` nos testes e atualiza uma expectativa de categorização que estava desatualizada em relação ao seed atual.

## 26. Próximos itens técnicos recomendados

- conectar a limpeza do histórico diretamente ao fluxo da splash;
- revisar se listas concluídas devem manter ou remover itens não comprados;
- revisar acessibilidade e tamanhos mínimos de toque;
- ampliar testes dos repositórios SQLite;
- testar migrações com bancos de versões anteriores;
- adicionar testes de integração do fluxo de conclusão e reutilização;
- avaliar backup e restauração local;
- avaliar exportação ou compartilhamento de lista;
- manter monitoramento dos relatórios de falhas e ANRs do Google Play.

## 27. Regra permanente de entrega

1. Trabalhar sobre a versão mais recente do projeto.
2. Preservar funcionalidades existentes.
3. Atualizar esta referência quando houver mudança funcional, estrutural ou nativa.
4. Entregar arquivos completos, não apenas trechos.
5. Gerar um único ZIP contendo somente arquivos modificados.
6. Preservar a estrutura relativa `lista-mercado-facil/...`.
7. Informar os comandos do Expo, EAS e GitHub.
8. Validar TypeScript e testes antes do pacote.
9. Testar builds com R8 em dispositivo físico antes da publicação.
10. Nunca alterar o package Android de um app já cadastrado no Google Play.

## 28. Portabilidade do registro npm — correção de instalação

O `package-lock.json` deve conter URLs públicas e portáveis do registro npm:

```text
https://registry.npmjs.org/
```

Não podem permanecer URLs de registries internos usados por ambientes de geração ou CI, pois essas URLs não são acessíveis no computador de desenvolvimento e provocam falhas `ETIMEDOUT` durante `npm install`.

O arquivo `.npmrc` do projeto define:

```ini
registry=https://registry.npmjs.org/
replace-registry-host=always
```

Essa configuração mantém as instalações do projeto no registro público oficial e substitui hosts de registry encontrados no lockfile pelo registro configurado.

Após aplicar esta correção, reinstalar as dependências:

```bash
rm -rf node_modules
npm cache verify
npm install
```

Depois validar:

```bash
npm ls expo-system-ui expo-build-properties
ENABLE_ANDROID_RELEASE_OPTIMIZATION=true npx expo config --json
```
