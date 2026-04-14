#FROM imagem_existente:versao da imagem
#cria uma imagem intermediaria para o build
FROM node:20-alpine as builder

#Define o diretório de trabalho dentro do container
#tudo que vier depois vai rodar dentro de /app
WORKDIR /app

#copia todo o projeto da máquina pra dentro de /app
COPY . .

#instala todas as dependencias do projeto
RUN npm install

#Executa o build
#No nest cria o /dist código pronto para a execução
#No next cria o .next
RUN npm run build

#criação de ambiente limpo apenas para rodar o projeto
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app ./

#roda o caontainer de fato
CMD ["npm", "start"]