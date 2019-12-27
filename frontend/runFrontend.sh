#!/bin/bash
bash -c "cd $(dirname "$0") && exec -a FrontendModule serve -s build -l 80 > frontend.log &"
echo "Frontend server started"