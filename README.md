# Lista de Mercado Fácil

Aplicativo mobile para criação e organização inteligente de listas de compras de supermercado.

O objetivo do projeto é resolver um problema comum: depois que o usuário adiciona os itens na lista, ainda precisa reorganizá-los manualmente conforme os corredores ou setores do supermercado. O **Lista de Mercado Fácil** propõe uma experiência mais prática, agrupando e ordenando os itens automaticamente por setor, considerando o supermercado escolhido e aprendendo com as correções feitas pelo usuário.

Este projeto nasce de uma necessidade pessoal: ter uma lista de compras mais útil no momento real da compra. A proposta é criar uma solução gratuita, sem anúncios e sem monetização, que possa ser compartilhada com outras pessoas que enfrentam o mesmo problema.

---

## Problema

Muitos aplicativos de lista de compras funcionam apenas como checklists. Eles permitem adicionar itens e marcar como comprados, mas normalmente não ajudam o usuário no momento real da compra.

Na prática, o usuário pode adicionar itens como:

- Arroz
- Banana
- Sabão em pó
- Leite
- Papel higiênico
- Carne
- Café

Mas, dentro do supermercado, precisa reorganizar mentalmente essa lista conforme a disposição dos corredores.

O problema principal é:

> Como transformar uma lista simples de compras em uma lista organizada pelo caminho de compra dentro do supermercado?

---

## Proposta

O **Lista de Mercado Fácil** organiza automaticamente os itens por setores do supermercado, permitindo que o usuário compre de forma mais rápida, clara e eficiente.

Exemplo de organização:

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
- Sabão em pó

Higiene pessoal
- Papel higiênico
```

Cada supermercado poderá ter sua própria ordem de setores, permitindo adaptar a lista à realidade de cada loja.

---

## Princípios do produto

- Gratuito para o usuário.
- Sem anúncios.
- Sem monetização.
- Sem login obrigatório no MVP.
- Funcionamento offline-first.
- Dados armazenados localmente no dispositivo.
- Baixo custo operacional.
- Sem dependência obrigatória de APIs pagas.
- Experiência simples para usuários não técnicos.
- Arquitetura preparada para evolução futura.

---

## Público-alvo

Usuários que fazem compras em supermercados e querem:

- Organizar melhor suas listas.
- Reduzir deslocamento dentro do mercado.
- Separar listas por supermercado.
- Reutilizar listas anteriores.
- Ter uma experiência simples, rápida e sem anúncios.

---

## Nome do aplicativo

**Lista de Mercado Fácil**

Nome técnico do repositório:

```text
lista-mercado-facil
```

O nome foi escolhido por ser direto, em português, fácil de entender e adequado para busca em lojas de aplicativos.

---

## Stack principal

A stack do projeto foi definida com base em tecnologias comuns em desenvolvimento mobile moderno, priorizando produtividade, manutenibilidade, funcionamento offline e evolução futura.

| Área | Tecnologia |
|---|---|
| Mobile | React Native |
| Build e tooling | Expo |
| Linguagem | TypeScript |
| UI | React Native Components |
| Estado global | Redux Toolkit |
| Persistência local | SQLite |
| Preferências simples | Async Storage |
| Navegação | React Navigation |
| Testes unitários | Jest |
| Testes de componentes | React Native Testing Library |
| Versionamento | Git |
| CI | GitHub Actions |
| Deploy futuro | Google Play Console |

---

## Ambiente de desenvolvimento

O projeto será desenvolvido utilizando o **Visual Studio Code** como editor principal, mantendo um fluxo simples e compatível com desenvolvimento React Native usando Expo.

Ferramentas recomendadas:

| Ferramenta | Uso |
|---|---|
| Visual Studio Code | Editor principal do projeto |
| Node.js LTS | Runtime JavaScript para execução das ferramentas do projeto |
| npm | Gerenciador de pacotes inicial |
| Expo | Execução, build e suporte ao desenvolvimento mobile |
| Expo Go | Testes rápidos em dispositivo físico |
| Android Studio | Emulador Android e ferramentas nativas quando necessário |
| Git | Versionamento do código-fonte |
| GitHub | Hospedagem do repositório e integração contínua |

Extensões recomendadas para o Visual Studio Code:

| Extensão | Uso |
|---|---|
| ESLint | Análise estática e padronização de código |
| Prettier | Formatação automática |
| React Native Tools | Apoio ao desenvolvimento React Native |
| GitLens | Apoio à leitura de histórico e alterações no Git |
| SQLite Viewer | Visualização de bancos SQLite locais |
| Jest | Apoio à execução e leitura de testes |
| Error Lens | Exibição de erros e alertas diretamente no editor |

---

## Práticas de engenharia

O projeto seguirá práticas de engenharia aplicáveis a sistemas mobile com foco em manutenibilidade, testabilidade e evolução.

- Clean Code
- Clean Architecture
- SOLID
- Separação de responsabilidades
- Testes unitários
- Testes de componentes
- Documentação técnica
- Versionamento com Git
- Integração contínua
- Organização por camadas
- Baixo acoplamento entre UI, estado, domínio e infraestrutura
- Regras de negócio testáveis fora da interface

---

## Arquitetura proposta

O projeto será organizado com uma adaptação de Clean Architecture para React Native.

```text
src/
  app/
    navigation/
    providers/
    store/

  domain/
    entities/
    repositories/
    services/
    use-cases/
    value-objects/

  application/
    commands/
    dtos/
    mappers/
    queries/

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

## Responsabilidade das camadas

### `app`

Configuração principal da aplicação.

Responsabilidades:

- Configurar providers.
- Configurar navegação.
- Configurar store global.
- Centralizar bootstrap da aplicação.

---

### `domain`

Camada mais importante da aplicação.

Responsabilidades:

- Entidades de negócio.
- Contratos de repositórios.
- Use cases.
- Regras de categorização.
- Regras de ordenação da lista.
- Regras de aprendizado local.

Esta camada não deve depender de React Native, Redux, SQLite ou bibliotecas externas de infraestrutura.

---

### `application`

Camada de orquestração entre domínio, apresentação e infraestrutura.

Responsabilidades:

- DTOs.
- Mappers.
- Commands.
- Queries.
- Serviços de aplicação.

---

### `infrastructure`

Implementações técnicas.

Responsabilidades:

- Banco SQLite.
- Repositórios concretos.
- Migrations.
- Seeds iniciais.
- Serviços locais.
- Integrações futuras com Web Services.

---

### `presentation`

Interface do usuário.

Responsabilidades:

- Telas.
- Componentes visuais.
- Hooks de apresentação.
- View models.
- Integração com navegação e estado global.

---

### `shared`

Recursos compartilhados e utilitários.

Responsabilidades:

- Tipos globais.
- Constantes.
- Helpers.
- Tratamento de erros.
- Utilitários puros.

---

## Funcionalidades do MVP

### Lista de compras

- Criar lista de compras.
- Adicionar item.
- Editar item.
- Remover item.
- Marcar item como comprado.
- Desmarcar item.
- Visualizar itens pendentes.
- Visualizar itens comprados.

---

### Organização por setores

- Identificar categoria do item.
- Associar categoria a setor.
- Agrupar itens por setor.
- Ordenar setores conforme o supermercado selecionado.
- Permitir alteração manual da categoria/setor do item.

---

### Supermercados

- Listar supermercados cadastrados.
- Cadastrar novo supermercado.
- Editar supermercado.
- Remover supermercado.
- Configurar ordem dos setores por supermercado.
- Definir supermercado padrão.

O supermercado **Zaffari Fernandes Vieira** será criado como dado inicial de seed no banco local, mas não será fixo no código de domínio. Ele poderá ser editado ou removido pelo usuário.

---

### Histórico

- Salvar listas concluídas.
- Consultar listas anteriores.
- Reutilizar itens de listas passadas.
- Sugerir itens frequentes com base no histórico local.

---

### Aprendizado local

O aplicativo deverá aprender com correções feitas pelo usuário.

Exemplo:

1. O usuário digita `café`.
2. O app classifica como `Mercearia`.
3. O usuário altera para outro setor específico.
4. O app salva essa preferência local.
5. Nas próximas listas, `café` será classificado conforme a preferência do usuário.

Este aprendizado será local, sem envio obrigatório de dados para servidores externos.

---

## Inteligência do aplicativo

A inteligência inicial será baseada em regras locais.

### Estratégias previstas

- Dicionário local de produtos.
- Sinônimos.
- Normalização de texto.
- Remoção de acentos.
- Associação produto-categoria.
- Associação categoria-setor.
- Histórico de correções do usuário.
- Frequência de compras.
- Preferência por supermercado.

### Exemplo de normalização

Entrada do usuário:

```text
sabao po
```

Possível interpretação:

```text
Produto: sabão em pó
Categoria: limpeza
Setor: produtos de limpeza
```

---

## IA generativa

O app não dependerá de IA generativa no MVP.

Motivos:

- APIs de IA podem ter custo.
- IA generativa normalmente depende de internet.
- Chaves de API não devem ser expostas diretamente em aplicativos mobile.
- O objetivo do app é ser gratuito, sem anúncios e sem custo recorrente.

A arquitetura poderá permitir uma funcionalidade futura opcional de IA generativa, desde que:

- Não seja obrigatória para uso do app.
- Não comprometa o funcionamento offline.
- Não gere custo inesperado.
- Use backend intermediário seguro caso APIs externas sejam necessárias.

Exemplo de recurso futuro:

```text
"Vou fazer churrasco sábado para 6 pessoas"
```

O app poderia sugerir automaticamente:

- Carne
- Pão de alho
- Carvão
- Refrigerante
- Guardanapo
- Sal grosso

---

## Backend

O MVP não terá backend obrigatório.

A aplicação será local-first e offline-first, usando SQLite como persistência principal.

A arquitetura será preparada para futura integração com Web Services, como:

- Sincronização entre dispositivos.
- Backup de listas.
- Catálogo remoto de produtos.
- Sugestões comunitárias.
- Atualização de categorias.
- Integração opcional com IA generativa.

Opções futuras de backend:

- NestJS com TypeScript.
- Supabase.
- Firebase.
- API própria.

Para manter o custo operacional próximo de zero, qualquer backend futuro deverá ser opcional e não essencial para o funcionamento do app.

---

## Modelo conceitual inicial

### `Market`

Representa um supermercado.

Campos previstos:

- `id`
- `name`
- `address`
- `isDefault`
- `createdAt`
- `updatedAt`

---

### `MarketSection`

Representa um setor ou corredor do supermercado.

Campos previstos:

- `id`
- `marketId`
- `name`
- `displayOrder`
- `createdAt`
- `updatedAt`

---

### `ProductCategory`

Representa uma categoria geral de produto.

Campos previstos:

- `id`
- `name`
- `defaultSectionName`
- `createdAt`
- `updatedAt`

---

### `Product`

Representa um produto conhecido pelo app.

Campos previstos:

- `id`
- `name`
- `normalizedName`
- `categoryId`
- `createdAt`
- `updatedAt`

---

### `ShoppingList`

Representa uma lista de compras.

Campos previstos:

- `id`
- `marketId`
- `name`
- `status`
- `createdAt`
- `updatedAt`
- `completedAt`

---

### `ShoppingListItem`

Representa um item dentro de uma lista.

Campos previstos:

- `id`
- `shoppingListId`
- `productName`
- `normalizedProductName`
- `quantity`
- `unit`
- `categoryId`
- `sectionId`
- `isPurchased`
- `createdAt`
- `updatedAt`

---

### `UserProductPreference`

Representa uma preferência aprendida localmente.

Campos previstos:

- `id`
- `marketId`
- `normalizedProductName`
- `categoryId`
- `sectionId`
- `createdAt`
- `updatedAt`

---

## Setores iniciais sugeridos

O app poderá iniciar com os seguintes setores padrão:

1. Hortifruti
2. Padaria
3. Açougue
4. Peixaria
5. Frios e laticínios
6. Congelados
7. Mercearia
8. Massas e grãos
9. Enlatados e conservas
10. Bebidas
11. Higiene pessoal
12. Limpeza
13. Utilidades domésticas
14. Papelaria
15. Pet
16. Farmácia e perfumaria
17. Caixa

A ordem dos setores poderá ser personalizada por supermercado.

---

## Use cases iniciais

- `CreateShoppingListUseCase`
- `AddItemToShoppingListUseCase`
- `EditShoppingListItemUseCase`
- `RemoveShoppingListItemUseCase`
- `MarkItemAsPurchasedUseCase`
- `UnmarkItemAsPurchasedUseCase`
- `CategorizeProductUseCase`
- `SortShoppingListByMarketRouteUseCase`
- `CreateMarketUseCase`
- `UpdateMarketUseCase`
- `UpdateMarketSectionOrderUseCase`
- `SaveUserProductPreferenceUseCase`
- `GetFrequentProductsUseCase`
- `ReuseShoppingListUseCase`

---

## Estratégia de testes

O projeto deverá possuir testes desde o início.

Prioridade inicial:

### Domínio

- Categorização de produtos.
- Normalização de nomes.
- Ordenação por setores.
- Aprendizado local.
- Regras de listas.

### Application

- Use cases.
- Mappers.
- Validação de commands.

### Presentation

- Renderização de componentes principais.
- Interação com lista.
- Marcação de item comprado.
- Comportamento de agrupamento visual.

---

## Critérios de aceite do MVP

O MVP será considerado funcional quando:

- O usuário conseguir criar uma lista.
- O usuário conseguir adicionar itens.
- O app categorizar itens automaticamente.
- A lista for agrupada por setor.
- A ordem dos setores respeitar o supermercado selecionado.
- O usuário conseguir editar o supermercado inicial.
- O usuário conseguir cadastrar outro supermercado.
- O usuário conseguir reordenar setores de um supermercado.
- O usuário conseguir marcar itens como comprados.
- O app funcionar sem internet.
- Os dados persistirem após fechar e abrir o app.
- Os principais use cases tiverem testes unitários.

---

## Roadmap

### Fase 1 — MVP local

- Setup do projeto React Native com Expo.
- TypeScript.
- Estrutura inicial de pastas.
- SQLite.
- Redux Toolkit.
- Navegação.
- Seeds iniciais.
- Lista de compras.
- Organização por setores.
- Cadastro de supermercados.
- Testes unitários.

---

### Fase 2 — Experiência e histórico

- Histórico de listas.
- Sugestão de itens frequentes.
- Reutilização de listas.
- Melhorias de UX.
- Busca e filtros.
- Edição avançada de categorias.

---

### Fase 3 — Sincronização opcional

- Backend opcional.
- Backup de dados.
- Sincronização entre dispositivos.
- Catálogo remoto de produtos.
- Monitoramento básico.

---

### Fase 4 — Inteligência avançada

- Sugestões baseadas em padrões de compra.
- Interpretação de texto livre.
- IA generativa opcional.
- Importação de lista por voz ou texto.
- Leitura de código de barras.

---

## Comandos previstos

Os comandos finais serão definidos após a criação do projeto, mas a estrutura esperada será semelhante a:

```bash
npm install
npm start
npm test
```

---

## Status

Projeto em fase inicial de definição técnica e criação da base arquitetural.

---

## Licença

Projeto gratuito, sem anúncios e sem monetização.

A intenção é disponibilizar o aplicativo para uso geral, sem cobrança do usuário e sem dependência de recursos pagos para o funcionamento principal.

A licença será definida posteriormente.
