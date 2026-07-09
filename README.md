# Atualização — remoção dos indicadores da Home

## Objetivo

Remove da tela inicial os indicadores:

- Modo principal / Offline
- Experiência / Sem anúncios

Essas informações não são necessárias na Home e deixam a interface mais carregada.

## Arquivo alterado

```text
src/presentation/screens/HomeScreen.tsx
```

## Como aplicar

1. Pare o Expo:

```bash
Ctrl + C
```

2. Copie a pasta `src` desta atualização para a raiz do projeto:

```text
D:\Projects\lista-mercado-facil
```

3. Substitua os arquivos existentes.

4. Reinicie o Expo limpando cache:

```bash
npx expo start -c
```

## Commit sugerido

```bash
git add . && git commit -m "style: remove indicadores informativos da tela inicial" && git push
```
