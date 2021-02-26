#!/bin/bash -x

# Instructions - 
# 1. Checkout https://github.com/bcgov/von-network
# 2. Checkout https://github.com/hyperledger/aries-cloudagent-python

# These are the folders for #1 and #2
ROOT=~/Projects/Sovrin
VON_FOLDER=${ROOT}/von-network
AGENT_FOLDER=${ROOT}/aries-cloudagent-python

# Start VON Ledger
cd ${VON_FOLDER}
./manage start

# Start test wallet agent
cd ${AGENT_FOLDER}
DOCKERHOST=`docker run --rm --net=host eclipse/che-ip`
AGENT_PORT=8060
ADMIN_PORT=8061
GENESIS=`curl http://127.0.0.1:9000/genesis`
./scripts/run_docker start \
  --endpoint http://${DOCKERHOST}:${AGENT_PORT} \
  --inbound-transport http 0.0.0.0 ${AGENT_PORT} \
  --outbound-transport http \
  --admin 0.0.0.0 ${ADMIN_PORT} \
  --admin-insecure-mode \
  --label Afoo.cloudwallet.dev \
  --genesis-transactions "${GENESIS}"  \
  --wallet-type indy \
  --wallet-name Afoo.cloudwallet.dev761033 \
  --wallet-key Afoo.cloudwallet.dev761033 \
  --preserve-exchange-records \
  --auto-provision \
  --multitenant \
  --jwt-secret Afoo.cloudwallet.dev330167 \
  --multitenant-admin \
  --log-level info
