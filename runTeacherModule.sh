#!/bin/bash
pkill -f node
pkill -f FrontendModule
pkill -f BackendModule

sleep 2

bash -c "exec -a TeacherModuleFrontend ./frontend/runFrontend.sh"
bash -c "exec -a TeacherModuleBackend ./backend/runBackend.sh"
echo "Teacher module has started"