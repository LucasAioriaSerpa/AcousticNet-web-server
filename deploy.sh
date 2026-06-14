#!/bin/bash

NC="\033[0m"        #? No color
GREEN="\033[0;32m"  #? Color Green

echo -e "${GREEN}Criando a rede 'acousticnet' (se não existir)...${NC}"
docker network create acousticnet || true

echo -e "${GREEN}Parando & removendo containers antigos...${NC}"
docker rm -f frontend backend || true

echo -e "${GREEN}Parar todos os containers que não estão rodando...${NC}"
docker container prune -f

echo -e "${GREEN}Para todas as imagens "órfãs"...${NC}"
docker image prune -f

echo -e "${GREEN}Removendo volume antigo...${NC}"
docker volume rm sqlite_data || true

echo -e "${GREEN}Criando novo volume...${NC}"
docker volume create sqlite_data

echo -e "${GREEN}Reconstruindo a imagem do backend...${NC}"
docker build --no-cache -t acousticnet-backend ./backend

echo -e "${GREEN}Criando e inicializando o container do backend...${NC}"
docker run -d \
    --name backend \
    --network acousticnet \
    -v sqlite_data:/app/data \
    acousticnet-backend

echo -e "${GREEN}Espera 3 segundos para que o backend seja inicializado...${NC}"
sleep 3

echo -e "${GREEN}Criando e inicializando o container do frontend...${NC}"
docker run -d \
    --name frontend \
    --network acousticnet \
    -p 80:80 \
    -v "$PWD/frontend:/usr/share/nginx/html" \
    -v "$PWD/nginx.conf:/etc/nginx/conf.d/default.conf" \
    i386/nginx:alpine

echo -e "${GREEN}Deploy realizado com sucesso!${NC}"
docker ps
