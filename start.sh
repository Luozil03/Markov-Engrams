#!/bin/bash
echo "[1/4] Avvio di MongoDB tramite Docker"
docker compose up -d
sleep 2

echo "[2/4] Installazione dipendenze"
pnpm install >/dev/null 2>&1

echo "[3/4] Avvio dei Microservizi Backend in background"
# Salvo output nei file .log invece di sporcare terminale
pnpm --filter @mvgc/service-training run dev >training.log 2>&1 &
TRAIN_PID=$!

pnpm --filter @mvgc/service-generation run dev >generation.log 2>&1 &
GEN_PID=$!

echo "[4/4] Avvio del Frontend React in background..."
pnpm --filter @mvgc/frontend run dev >frontend.log 2>&1 &
FRONT_PID=$!

echo "L'interfaccia pronta su: http://localhost:5173"
echo "Log salvati in: training.log, generation.log, frontend.log"
echo "Premi CTRL+C per spegnere i server."

# Spegnimento controllato
trap "echo -e '\nSpegnimento in corso'; kill $TRAIN_PID $GEN_PID $FRONT_PID; rm *.log; exit" SIGINT

wait
