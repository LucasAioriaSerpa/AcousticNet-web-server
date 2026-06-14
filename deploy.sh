#!/bin/bash

NC="\033[0m]"		#? No color
GREEN="\033[0;32m"	#? Color Green

echo "${GREEN}Parando & removendo containers antigos...${NC}"
docker rm -f frontend backend || true

echo "${GREEN}Removendo volume antigo...${NC}"
docker volume rm sqlite_data || true

echo "${GREEN}Criando novo volume...${NC}"
docker volume create sqlite_data

echo "${GREEN}Reconstruindo a imagem do backend${NC}"
docker build --no-cache -t acousticnet-backend ./backend

echo "${GREEN}Criando e inicializando o container do backend${NC}"
docker run -d \
	--name backend \
	--network acousticnet \
	-v sqlite_data:/app/data \
	acousticnet-backend

echo "${GREEN}Espera 3 segundos para que o backend seja inicializado${NC}"
sleep 3

echo "${GREEN}Criando e inicializando o container do frontend${NC}"
docker run -d \
	--name frontend \
	--network acousticnet \
	-p 80:80 \
	-v ~/acousticnet/frontend:/usr/share/nginx/html \
	-v ~/acousticnet/nginx.conf:/etc/nginx/conf.d/default.conf \
	i386/nginx:alpine

echo "${GREEN}Deploy realizado!${NC}"
docker ps
