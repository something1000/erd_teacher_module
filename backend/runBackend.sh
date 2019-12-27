#!/bin/bash
bash -c "cd $(dirname "$0") && exec -a BackendModule node ./index.js > backend.log &"
echo "Backend server started"