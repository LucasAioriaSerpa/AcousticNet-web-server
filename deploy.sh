#!/bin/bash

echo "Parando & removendo containers antigos..."
docker rm -f frontend backend || true

echo "Removendo volume antigo..."
docker volume rm sqlite_data || true

echo "Criando novo volume..."
docker volume create sqlite_data

echo "Reconstruindo a imagem do backend"
docker build --no-cache -t acousticnet-backend ./backend

echo "Criando e inicializando o container do backend"
docker run -d \
	--name backend \
	--network acousticnet \
	-v sqlite_data:/app/data \
	acousticnet-backend

echo "Espera 3 segundos para que o backend seja inicializado"
sleep 3

echo "Criando e inicializando o container do frontend"
docker run -d \
	--name frontend \
	--network acousticnet \
	-p 80:80 \
	-v ~/acousticnet/frontend:/usr/share/nginx/html \
	-v ~/acousticnet/nginx.conf:/etc/nginx/conf.d/default.conf \
	i386/nginx:alpine

echo "Deploy realizado!"
docker ps
