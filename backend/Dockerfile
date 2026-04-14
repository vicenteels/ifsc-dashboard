# Etapa 1: build
FROM node:20-alpine AS builder

#define pasta interna no container
WORKDIR /app

#copia as dependencias e depois instala elas
COPY package*.json ./
RUN npm install

#copia o restante do projeto
COPY . .
RUN npm run build


# Etapa 2: produção, imagem limpa
FROM node:20-alpine

WORKDIR /app

#copia só das dependencias necessárias e a build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

#documenta a porta do backend
EXPOSE 3000

#inicia o servidor nest
CMD ["node", "dist/main.js"]