# Lista de Mercado Fácil

Aplicativo mobile para criação e organização inteligente de listas de compras de supermercado.

A proposta do projeto é resolver um problema comum: depois de montar uma lista de compras, ainda é necessário reorganizar mentalmente os itens conforme os corredores do supermercado. O **Lista de Mercado Fácil** reduz esse atrito agrupando os produtos por corredores e ordenando a lista conforme a rota configurada para cada mercado.

O aplicativo é uma iniciativa pessoal, gratuita, sem anúncios, sem login obrigatório e sem dependência de serviços pagos para sua função principal. A ideia é criar algo útil para uso próprio e também compartilhar com outras pessoas.

---

## Objetivo do projeto

Criar um aplicativo mobile offline-first que permita:

- montar listas de compras rapidamente;
- organizar os itens por corredor do supermercado;
- permitir informar preço unitário opcional por produto;
- mostrar o total parcial da compra com base nos itens já marcados como comprados;
- manter supermercados cadastrados com ordem própria de corredores;
- manter uma lista de **Corredores padrão** usada como base para novos supermercados;
- permitir que o usuário personalize a organização conforme a realidade de cada mercado;
- funcionar sem internet para as funcionalidades principais;
- evoluir com aprendizado local a partir das correções feitas pelo usuário;
- manter uma experiência simples, moderna, profissional e mobile-first.

---

## Problema que o app resolve

Em muitos aplicativos de lista de compras, o usuário adiciona os produtos em qualquer ordem e precisa reorganizar mentalmente a compra durante o percurso no mercado.

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

O aplicativo transforma essa lista em uma rota mais útil:

```text
Hortifruti
- Banana

Açougue
- Carne

Mercearia
- Arroz
- Café

Frios e laticínios
- Leite

Limpeza
- Detergente

Higiene pessoal
- Papel higiênico
```

Com isso, o usuário evita ir e voltar pelos corredores do supermercado.

---

## Princípios do projeto

- Uso gratuito.
- Sem anúncios.
- Sem monetização obrigatória.
- Sem login obrigatório no MVP.
- Funcionamento offline-first.
- Baixa dependência de serviços externos.
- Interface simples, moderna e agradável.
- Código limpo e organizado.
- Arquitetura preparada para evolução.
- Persistência local dos dados principais.
- Respeito à privacidade do usuário.

---

## Status atual

Projeto em desenvolvimento ativo.

### Já implementado

- Projeto rodando com Expo.
- TypeScript configurado.
- Tema claro e tema escuro.
- Tema salvo localmente.
- Interface mobile-first.
- Navegação principal com telas:
  - Início;
  - Lista;
  - Mercados;
  - Ajustes.
- Splash screen personalizada com identidade azul/ciano.
- Splash screen exibida ao abrir o app.
- Splash com imagem de fundo, nome do app, texto de carregamento e loading animado.
- Tempo mínimo de splash configurado para 3 segundos.
- Fluxo inicial preparado para executar rotinas de abertura do app.
- Tela Lista com:
  - criação de lista;
  - troca de lista;
  - edição do nome da lista;
  - nome padrão "Compra do dia" quando o usuário não informa nome;
  - conclusão de compra;
  - adição de produtos;
  - quantidade simples com entrada apenas de números inteiros;
  - normalização automática de quantidade vazia ou zero para 1;
  - preço unitário opcional por produto;
  - máscara automática de preço no padrão pt-BR;
  - cálculo do total da compra com base nos itens comprados;
  - bloqueio de produto repetido;
  - marcação de produto como comprado;
  - remoção de produto com confirmação;
  - limpeza da lista com confirmação;
  - alteração do corredor do produto;
  - exibição apenas do status do item na lista, sem repetir o corredor na linha de status;
  - exibição do preço unitário e total do item em linhas separadas;
  - movimentação automática de corredores totalmente comprados para o final da rota;
  - aprendizado local de preferência de corredor.
- Tela Mercados com:
  - cadastro de supermercado;
  - edição de nome;
  - exclusão de supermercado com confirmação;
  - bloqueio para não excluir o último supermercado cadastrado;
  - seleção automática de outro supermercado quando o mercado ativo é excluído;
  - seleção de mercado ativo;
  - reordenação de corredores do mercado;
  - edição, inclusão e exclusão de corredores do mercado;
  - edição, inclusão, exclusão e reordenação de Corredores padrão;
  - numeração opcional dos corredores com exibição em dois dígitos;
  - permissão de números repetidos para corredores;
  - exibição de "--" quando o corredor não possui número;
  - cópia dos Corredores padrão ao criar novo supermercado.
- Histórico na tela Início com:
  - listas concluídas;
  - reutilização de lista;
  - exclusão de histórico;
  - exibição de data;
  - exibição de hora e minuto;
  - exibição do nome do supermercado;
  - preservação dos preços informados;
  - exibição do total da compra quando houver preços;
  - opção de ver a lista concluída como extrato da compra.
- Tela Ajustes com:
  - alternância entre tema claro e escuro;
  - switch customizado com padrão visual azul/ciano;
  - configuração de retenção do histórico:
    - Sempre;
    - Últimos 30 dias;
    - Últimos 60 dias;
    - Últimos 90 dias.
- Limpeza do histórico preparada para execução durante a abertura do app, conforme configuração de retenção.

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

O TypeScript é usado como linguagem principal para melhorar previsibilidade, segurança de tipos e manutenção do código.

### Persistência local

O projeto trabalha com abordagem offline-first.

Direção da persistência:

- AsyncStorage para Web/local e preferências simples;
- SQLite para Android/iOS na evolução da camada de infraestrutura;
- repositórios isolados para reduzir acoplamento entre interface e persistência.

Dados locais principais:

- supermercados;
- corredores do mercado;
- Corredores padrão;
- listas;
- itens;
- histórico;
- preferências aprendidas pelo app;
- configurações;
- preços unitários opcionais dos produtos;
- numeração opcional de corredores;
- versões/migrações locais para atualização de seeds e dados padrão.

### AsyncStorage

O AsyncStorage é usado para preferências simples e persistência local no ambiente Web/local, como:

- tema selecionado;
- mercado ativo;
- listas locais;
- configurações;
- retenção de histórico;
- Corredores padrão;
- versão local dos Corredores padrão.

### Redux Toolkit

O Redux Toolkit é usado para estado global previsível e testável, principalmente em:

- tema atual;
- lista ativa;
- supermercado selecionado;
- estado compartilhado entre telas;
- futuras sincronizações.

### Clean Architecture

A arquitetura é separada em camadas para evitar acoplamento entre regra de negócio, interface e infraestrutura.

---

## Arquitetura do projeto

```text
src/
  app/
    navigation/
    providers/
    store/
    theme/

  domain/
    constants/
    entities/
    repositories/
    services/
    use-cases/

  application/
    services/
    state/

  infrastructure/
    repositories/
    seed/

  presentation/
    assets/
    components/
    screens/

  shared/
    constants/
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

Contém:

- entidades;
- contratos de repositórios;
- serviços de domínio;
- casos de uso;
- regras de categorização;
- regras de ordenação;
- regras de criação de mercados;
- normalização de texto.

Essa camada não deve depender de React Native, SQLite, Redux ou navegação.

### application

Camada de orquestração entre domínio e interface.

Pode conter:

- serviços de inicialização;
- comandos;
- queries;
- slices Redux;
- adaptação de dados para tela.

### infrastructure

Camada de detalhes técnicos.

Contém:

- implementação dos repositórios;
- persistência local;
- seeds iniciais;
- futura integração com SQLite nativo;
- futura integração com APIs, se necessário.

### presentation

Camada de interface.

Contém:

- telas;
- componentes reutilizáveis;
- assets visuais;
- estilos conectados ao tema;
- componentes mobile-first.

---

## Entidades principais

```text
Market
MarketSection
ShoppingList
ShoppingListItem
ProductCategory
UserProductPreference
PurchaseHistory
AppSettings
```

### Market

Representa um supermercado cadastrado pelo usuário.

Exemplos:

- Zaffari Fernandes Vieira
- Mercado do bairro
- Supermercado cadastrado manualmente

### MarketSection

Representa um corredor de um supermercado.

Exemplos:

- Hortifruti
- Padaria
- Açougue
- Peixaria
- Frios e laticínios
- Congelados
- Mercearia
- Bebidas
- Higiene pessoal
- Limpeza
- Pet
- Utilidades
- Outros

Cada corredor pode possuir:

- nome;
- ordem de rota;
- número opcional do corredor;
- status interno de ativo;
- vínculo com o supermercado.

A numeração do corredor:

- aceita somente números inteiros;
- é limitada a dois dígitos;
- é exibida com zero à esquerda quando necessário;
- permite repetição, pois o mesmo corredor físico pode atender dois lados;
- exibe `--` quando não há número informado.

### ShoppingList

Representa uma lista de compras.

Cada lista pertence a um supermercado.

### ShoppingListItem

Representa um item dentro de uma lista.

Cada item possui:

- nome;
- nome normalizado;
- quantidade;
- unidade;
- corredor;
- status de comprado;
- preço unitário opcional em centavos;
- datas de criação e atualização.

### UserProductPreference

Representa uma correção ou preferência local do usuário.

Exemplo:

Se o app classificar “queijo” como Mercearia, mas o usuário corrigir para Frios e laticínios, essa preferência pode ser salva localmente para melhorar futuras classificações.

### AppSettings

Representa configurações locais do app.

Exemplos:

- tema;
- retenção do histórico;
- futuras preferências de comportamento.

---

## Splash screen e inicialização

O app possui uma splash screen personalizada em tons de azul/ciano.

A splash apresenta:

- fundo visual alinhado à identidade do app;
- carrinho de compras branco;
- nome **Lista de Mercado Fácil**;
- texto **Preparando sua lista...**;
- três bolinhas animadas de carregamento.

Regras atuais:

- a splash aparece sempre ao abrir o app;
- o tempo mínimo de exibição é de 3 segundos;
- a tela é implementada como uma screen React Native;
- a splash também serve como ponto para rotinas de inicialização;
- se uma rotina de inicialização falhar, o app segue para a tela principal e tenta novamente na próxima abertura.

Rotinas previstas ou preparadas para a inicialização:

- carregar configurações;
- carregar tema;
- aplicar retenção de histórico;
- garantir dados padrão;
- validar integridade dos Corredores padrão.

---

## Identidade do app instalado

O aplicativo possui configuração de identidade para instalação em dispositivo físico.

Regras atuais:

- nome exibido no dispositivo: **Lista de Mercado Fácil**;
- ícones separados para iOS e Android;
- ícone Android com carrinho em escala reduzida para melhor leitura no launcher;
- ícone iOS mantendo a identidade visual do app;
- assets preparados em `assets/` para uso pelo Expo.

---

## Supermercados e corredores

O app trabalha com dois níveis de corredores.

### Corredores padrão

São a lista base usada quando um novo supermercado é criado.

Regras:

- ficam disponíveis na tela Mercados;
- podem ser incluídos;
- podem ser editados;
- podem ser excluídos;
- podem ser reordenados;
- possuem número opcional de corredor;
- exibem o número como `01`, `02`, `13` ou `--` quando vazio;
- permitem números repetidos;
- não permitem nomes duplicados;
- não permitem excluir o último corredor;
- a exclusão exige confirmação;
- alterações nos Corredores padrão não alteram supermercados já existentes.

### Corredores do mercado

São os corredores específicos de um supermercado cadastrado.

Regras:

- cada supermercado possui sua própria lista;
- podem ser incluídos;
- podem ser editados;
- podem ser excluídos;
- podem ser reordenados;
- possuem número opcional de corredor;
- exibem o número como `01`, `02`, `13` ou `--` quando vazio;
- permitem números repetidos;
- não permitem nomes duplicados;
- não permitem excluir o último corredor;
- a exclusão exige confirmação;
- alterações afetam somente o supermercado editado.

### Criação de novo supermercado

Ao criar um novo supermercado:

- o app copia os Corredores padrão atuais;
- a cópia fica independente;
- alterações futuras nos Corredores padrão não afetam esse supermercado;
- alterações futuras no supermercado não afetam os Corredores padrão.

### Exclusão de supermercado

A tela Mercados permite excluir supermercados cadastrados.

Regras:

- a exclusão exige confirmação;
- o app não permite excluir o último supermercado cadastrado;
- se o supermercado excluído estiver ativo, outro supermercado é selecionado automaticamente;
- listas e históricos devem continuar preservados conforme a estratégia de persistência atual.

### Normalização e sugestão de nomes

O app bloqueia duplicidade de corredores ignorando:

- letras maiúsculas/minúsculas;
- acentuação;
- espaços extras.

Exemplos considerados equivalentes:

```text
Açougue
acougue
AÇOUGUE
 açougue 
```

Quando o usuário digita um nome sem acento ou com grafia diferente de um corredor conhecido, o app pode sugerir o nome mais adequado.

Exemplos:

```text
acougue -> Açougue
frios e laticinios -> Frios e laticínios
higiene pessoal -> Higiene pessoal
```

A sugestão deve ser apresentada para o usuário confirmar, sem correção automática obrigatória.

---

## Supermercado inicial

O projeto possui um supermercado inicial cadastrado por seed:

```text
Zaffari Fernandes Vieira
```

Esse mercado existe como dado inicial local e pode ser editado pelo usuário.

Regras atuais do seed:

- o mercado não deve exibir endereço fixo;
- a lista de corredores do Zaffari segue a rota real informada pelo usuário;
- migrações locais podem atualizar o Zaffari salvo quando houver alteração relevante no seed.

---

## Corredores iniciais

A lista inicial de corredores do Zaffari Fernandes Vieira usada pelo app é:

```text
01. Óleos, Conservas e Molhos
01. Dietéticos, Condimentos e Sopas
02. Achocolatados e Leites
02. Café, Chá e Erva-mate
03. Massas, Geléias e Compotas
03. Gelatinas, Margarinas e Massas Frescas
04. Salgadinhos e Bomboniére
04. Laticínios
05. Biscoitos e Cereais Matinais
06. Farinhas, Açúcar e Arroz
06. Congelados
07. Shampoos, Sabonetes e Desodorantes
08. Perfumaria Infantil e Higiene
09. Detergentes, Sabão e Desinfetantes
10. Vassouras, Rações e Inseticidas
11. Utilidades, Material Elétrico e Automotivos
12. Plásticos, Festas e Escolar
13. Refrigerantes e Águas
--. Hortifruti
--. Açougue
--. Peixaria
--. Padaria
--. Rotisseria
--. Fiambreria
--. Frios, Queijos e Embutidos
--. Outros
```

A ordem dos corredores pode ser configurada nos Corredores padrão e também em cada supermercado.

Os corredores sem número são armazenados com o campo de número vazio e exibidos como `--`.

---

## Lista de compras

A tela Lista permite:

- criar nova lista;
- usar nome padrão quando o nome não for informado;
- editar nome da lista;
- trocar entre listas abertas;
- adicionar produtos;
- informar quantidade simples;
- aceitar somente quantidade inteira maior ou igual a 1;
- normalizar quantidade vazia ou zero para 1;
- informar preço unitário opcional;
- formatar preço automaticamente no padrão pt-BR;
- bloquear produtos repetidos;
- classificar produto por corredor;
- agrupar itens por corredor;
- ordenar os grupos conforme a rota do supermercado ativo;
- mover para o final os corredores que estiverem com todos os itens comprados;
- marcar item como comprado;
- editar quantidade;
- editar preço unitário;
- recalcular totais quando a quantidade ou o preço mudam;
- trocar o corredor do item;
- exibir apenas o status do item na linha de status;
- remover item com confirmação;
- limpar a lista com confirmação;
- concluir a compra;
- acompanhar o total parcial dos itens já comprados.

### Ordenação dinâmica durante a compra

Durante a compra, os corredores são reordenados conforme o andamento dos itens.

Regra:

- corredores com itens pendentes continuam priorizados na rota;
- quando todos os itens de um corredor são marcados como comprados, esse corredor vai para o final;
- o próximo corredor com pendências assume a posição principal da rota;
- corredores parcialmente comprados permanecem na ordem configurada.

Essa regra ajuda o usuário a seguir a rota real sem voltar para corredores já concluídos.

---

## Preços e total da compra

O app permite informar preço unitário opcional para cada produto durante a compra.

Regras:

- o preço não é obrigatório;
- o campo usa máscara automática no padrão pt-BR;
- a entrada é tratada em centavos;
- o valor é armazenado internamente como inteiro em centavos;
- a exibição usa formato monetário brasileiro;
- o preço informado representa o preço unitário do produto;
- o total do item é calculado por quantidade x preço unitário;
- o total da compra considera somente itens marcados como comprados;
- se nenhum item comprado tiver preço, o total da compra não é exibido;
- ao alterar quantidade ou preço, os totais são recalculados.

Exemplo:

```text
Leite
Quantidade: 3
Preço unitário: R$ 5,89
Total do item: R$ 17,67
```

### Reaproveitamento de preços

Os preços informados são preservados nas compras concluídas.

Quando um produto aparecer novamente em uma nova compra, o app pode usar o preço unitário mais recente encontrado no histórico para preencher ou sugerir o valor.

Regras:

- o preço mais recente vem de compras concluídas;
- alterações feitas durante uma compra ativa passam a ser referência futura somente após a compra ser concluída;
- o preço continua opcional e pode ser removido ou alterado pelo usuário.


---

## Histórico

O histórico é formado por listas concluídas.

A tela Início exibe:

- nome da lista;
- data de conclusão;
- hora e minuto de conclusão;
- nome do supermercado;
- quantidade de itens;
- total da compra quando houver preços informados;
- preços preservados nos itens da lista concluída;
- opção de reutilizar uma lista;
- opção de ver lista concluída como extrato;
- opção de apagar histórico.

### Extrato da compra

A opção **Ver lista** permite consultar os detalhes de uma compra concluída.

O extrato apresenta:

- produtos comprados;
- quantidade;
- preço unitário, quando informado;
- total do item, quando houver preço;
- total geral da compra, quando houver preços informados.

### Retenção do histórico

O app possui configuração de retenção:

```text
Sempre
Últimos 30 dias
Últimos 60 dias
Últimos 90 dias
```

Regras:

- **Sempre** mantém todo o histórico;
- **Últimos 30 dias** remove históricos anteriores a 30 dias;
- **Últimos 60 dias** remove históricos anteriores a 60 dias;
- **Últimos 90 dias** remove históricos anteriores a 90 dias;
- a limpeza é aplicada na próxima abertura do app;
- se a limpeza falhar, o app não bloqueia o usuário e tenta novamente na próxima abertura.

---

## Inteligência local

A primeira versão não depende de IA generativa.

A organização inteligente é baseada em:

- dicionário local de produtos;
- palavras-chave;
- sinônimos;
- corredor padrão;
- preferência local corrigida pelo usuário;
- ordem dos corredores do supermercado ativo.

### Exemplo de categorização

```text
banana -> Hortifruti
arroz -> Mercearia
leite -> Frios e laticínios
detergente -> Limpeza
sabonete -> Higiene pessoal
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

Por decisão de projeto, o app deve continuar funcionando sem internet, sem IA e sem serviços pagos.

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

O tema selecionado pelo usuário é salvo localmente.

Ao fechar e abrir o app novamente, o tema escolhido é mantido.

### Switch de tema

O switch de tema escuro usa componente customizado `AppThemeSwitch`, seguindo o padrão visual azul/ciano do app.

### Modais e teclado

Os modais com campos de digitação devem ser preparados para uso em celular físico.

Diretrizes:

- usar comportamento compatível com teclado virtual;
- permitir rolagem quando o teclado estiver aberto;
- evitar que campos e botões de ação fiquem escondidos;
- aplicar esse cuidado em edição de produto, edição de corredor, criação de lista e edição de mercado.

---

## Navegação

O app usa navegação com telas principais:

```text
Splash
Início
Lista
Mercados
Ajustes
```

A interface principal usa navegação inferior customizada.

A splash é a tela inicial do fluxo e redireciona para a tela Início após concluir o carregamento mínimo e executar as rotinas de inicialização.

---

## Funcionalidades do MVP

### Splash

- Exibir identidade visual do app.
- Executar rotinas de abertura.
- Preparar o app antes da tela principal.
- Manter loading animado.

### Tela Início

- Exibir resumo do app.
- Exibir histórico de compras concluídas.
- Reutilizar lista concluída.
- Apagar histórico.
- Mostrar nome do mercado, data e hora da compra.

### Tela Lista

- Criar lista.
- Editar nome da lista.
- Trocar lista ativa.
- Adicionar item.
- Classificar item por corredor.
- Agrupar itens por corredor.
- Ordenar grupos conforme o mercado ativo.
- Informar quantidade inteira.
- Informar preço unitário opcional.
- Exibir total parcial dos itens comprados.
- Marcar item como comprado.
- Editar quantidade.
- Editar preço unitário.
- Alterar corredor de um item.
- Remover item.
- Limpar lista.
- Concluir compra.

### Tela Mercados

- Exibir supermercados cadastrados.
- Criar novo supermercado.
- Editar nome do supermercado.
- Excluir supermercado com confirmação.
- Impedir exclusão do último supermercado.
- Selecionar mercado ativo.
- Editar Corredores padrão.
- Editar Corredores do mercado.
- Incluir corredor.
- Editar corredor.
- Excluir corredor com confirmação.
- Informar número opcional do corredor.
- Exibir número do corredor com dois dígitos ou `--`.
- Permitir números repetidos de corredor.
- Reordenar corredores.
- Bloquear duplicidade de nomes.
- Sugerir nome corrigido quando aplicável.

### Tela Ajustes

- Alternar tema claro/escuro.
- Configurar retenção do histórico.
- Informar que a retenção será aplicada na próxima abertura do app.

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

Status: concluído.

### Fase 2: Lista funcional

- Adicionar itens à lista.
- Classificar itens por regras locais.
- Agrupar itens por corredor.
- Marcar item como comprado.
- Remover item.
- Limpar lista.
- Concluir compra.
- Editar nome da lista.
- Trocar lista ativa.
- Informar preço unitário opcional.
- Exibir total parcial da compra.
- Reaproveitar preço mais recente a partir do histórico.

Status: implementado em evolução.

### Fase 3: Supermercados personalizados

- Criar supermercado.
- Editar supermercado.
- Excluir supermercado.
- Selecionar supermercado ativo.
- Reordenar corredores.
- Editar Corredores padrão.
- Editar Corredores do mercado.
- Adicionar numeração opcional de corredor.
- Criar lista associada a supermercado.

Status: implementado em evolução.

### Fase 4: Histórico e retenção

- Salvar listas concluídas.
- Exibir histórico.
- Reutilizar lista.
- Apagar histórico.
- Configurar retenção.
- Aplicar limpeza na abertura do app.
- Preservar preços informados nas compras concluídas.
- Exibir total da compra no histórico quando houver preços.

Status: implementado em evolução.

### Fase 5: Persistência com SQLite

- Consolidar camada SQLite para Android/iOS.
- Manter compatibilidade com Web/local.
- Criar migrações locais.
- Criar estratégia de evolução de schema.

Status: planejado/em evolução.

### Fase 6: Aprendizado local

- Salvar correções de corredor feitas pelo usuário.
- Priorizar preferências do usuário na categorização.
- Sugerir corredor com base no histórico.
- Sugerir itens frequentes.

Status: parcialmente implementado.

### Fase 7: Preparação para publicação

- Criar ícone final do app.
- Consolidar splash nativa do Expo.
- Revisar acessibilidade.
- Revisar textos.
- Gerar build Android.
- Preparar screenshots para Google Play.
- Preparar política de privacidade.

Status: futuro.

### Fase 8: Recursos futuros

- Compartilhamento de lista.
- Importação por texto.
- Leitura de código de barras.
- Backup opcional.
- Sincronização opcional.
- IA generativa opcional.

Status: futuro.

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

Caso precise instalar dependências Expo específicas:

```bash
npx expo install expo-linear-gradient expo-sqlite @react-native-async-storage/async-storage react-native-screens react-native-safe-area-context
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

## Scripts

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

O projeto deve ter testes unitários para as principais regras de negócio.

Prioridades de teste:

- categorização de produtos;
- agrupamento por corredor;
- ordenação conforme supermercado;
- marcação de item como comprado;
- preferências de usuário;
- retenção do histórico;
- quantidade inteira maior ou igual a 1;
- máscara de preço no padrão pt-BR;
- cálculo de total por item;
- cálculo de total da compra somente com itens comprados;
- preservação de preços no histórico;
- reaproveitamento do preço unitário mais recente;
- criação de novo supermercado com Corredores padrão;
- exclusão de supermercado;
- bloqueio de exclusão do último supermercado;
- seleção automática de novo mercado ativo após exclusão;
- edição de Corredores padrão;
- edição de Corredores do mercado;
- bloqueio de nomes duplicados;
- sugestão de nomes com acentuação;
- formatação de número de corredor;
- exibição de `--` para corredor sem número;
- ordenação dinâmica que move corredores concluídos para o final;
- reducers Redux;
- use cases de domínio.

Exemplo de regras a testar:

```text
banana deve ser classificada como Hortifruti
leite deve ser classificado como Frios e laticínios
produto desconhecido deve ser classificado como Outros
itens comprados devem ser exibidos após os pendentes
novo supermercado deve copiar os Corredores padrão atuais
não deve permitir corredor duplicado ignorando acentuação
não deve permitir excluir o último corredor
não deve permitir excluir o último supermercado
corredor sem número deve exibir --
corredor 1 deve exibir 01
corredores totalmente comprados devem ir para o final da rota
quantidade vazia ou zero deve ser normalizada para 1
preço 1290 deve ser exibido como R$ 12,90
total da compra deve considerar somente itens comprados
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
- testes para regras relevantes;
- componentes visuais reutilizáveis;
- estilos consistentes com o tema.

---

## Convenção de commits

Sugestão de padrão:

```text
feat: nova funcionalidade
fix: correção de bug
style: ajuste visual
refactor: refatoração sem mudança funcional
test: testes
docs: documentação
chore: configuração ou manutenção
```

Exemplos:

```bash
git add . && git commit -m "feat: adiciona tela de lista de compras" && git push
```

```bash
git add . && git commit -m "style: ajusta identidade visual mobile-first" && git push
```

```bash
git add . && git commit -m "docs: atualiza README do projeto" && git push
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

Linha sugerida para esta atualização de documentação:

```bash
git add README.md && git commit -m "docs: atualiza README com ultimas alteracoes" && git push
```

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
- splash screen;
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
