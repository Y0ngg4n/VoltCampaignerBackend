# VoltCampaignerBackend
This is the Rest API for [https://github.com/Y0ngg4n/volt_campaigner]

# Installation
```bash
git clone https://github.com/Y0ngg4n/VoltCampaignerBackend.git
cd VoltCampaignerBackend
npm install
npm run
```

# Docker
```
docker pull yonggan/volt_campaigner_backend
```
Usage with Docker Swarm.
To setup Cockroachdb you can use this tutorial: https://www.cockroachlabs.com/docs/stable/orchestrate-cockroachdb-with-docker-swarm.html
You can use this docker-compose.yml:

```
version: '3.1'

services:
  backend:
    image: yonggan/volt_campaigner_backend
    env_file: ./backend.env
    ports:
      - "32340:3000"
    networks:
      - volt_cockroachdb
    depends_on:
      - "volt_cockroachdb-1"
      - "volt_cockroachdb-2"
      - "volt_cockroachdb-3"
    deploy:
      replicas: 3
    secrets:
      - source: user_cockroachdb_ca-crt
        target: ca.crt
      - source: user_cockroachdb_client_db-crt
        target: client.user.crt
      - source: user_cockroachdb_client_db-key
        target: client.db.key
        mode: 0600
        
        ...
```
