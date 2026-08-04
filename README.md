# AcousticNet - Web Service Part

Aqui tem como objetivos obter e mostrar o nível de som em decibeis no "estudio"

Além de ter acesso ao NAS

---

## Servidor Web

O computador desktop que está servindo como servidor web tem as seguintes configurações:

- SO: Ubuntu Xenial
- CPU: Amd
- Memoria Ram: 4 GB
- Disco: ~250 SSD

---

## Técnologias sendo utilizadas no servidor web

- Flask v0.12.2
- nginx v1.18 - alpine
- Docker v3.8

## Setup/Reset/Update Docker

```bash
#? Parar e remover containers + volumes
docker rm -f frontend backend
docker volume rm sqlite_data

#? Recriar volume e subir novamente
docker volume create sqlite_data

#? Refaz a imagem do backend
docker build --no-cache -t acousticnet-backend ./backend

#? criar e rodar os containers
docker run -d \
  --name backend \
  --network acousticnet \
  -v sqlite_data:/app/data \
  acousticnet-backend

sleep 3

docker run -d \
  --name frontend \
  --network acousticnet \
  -p 80:80 \
  -v ~/acousticnet/frontend:/usr/share/nginx/html \
  -v ~/acousticnet/nginx.conf:/etc/nginx/conf.d/default.conf \
  i386/nginx:alpine
```
