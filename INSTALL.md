# Instalação e execução local

Este pacote contém a base inicial do projeto **Lista de Mercado Fácil**.

## Forma recomendada

Crie o projeto com a versão atual do Expo e depois copie os arquivos deste pacote para dentro do projeto criado.

```bash
npx create-expo-app@latest lista-mercado-facil --template blank-typescript
cd lista-mercado-facil
```

Depois copie para dentro da pasta criada:

- `src/`
- `App.tsx`
- `jest.config.js`
- `babel.config.js`, se ainda não existir
- `docs/`
- `README.md`

Instale as dependências do projeto:

```bash
npx expo install expo-sqlite @react-native-async-storage/async-storage react-native-screens react-native-safe-area-context
npm install @reduxjs/toolkit react-redux @react-navigation/native @react-navigation/native-stack
npm install -D jest jest-expo @testing-library/react-native @types/jest
```

Execute:

```bash
npx expo start
```

## Observação

Evite fixar versões manualmente no início. O `create-expo-app@latest` e o `expo install` ajudam a selecionar versões compatíveis com a versão atual do Expo.
