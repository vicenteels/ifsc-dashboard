#igual o backend, mas muda o execução
# Etapa 1: build
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# Etapa 2: produção
FROM node:20

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3001

CMD ["npm", "start"]