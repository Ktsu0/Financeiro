@echo off
echo Iniciando o Backend (Servidor)...
start "Backend Financeiro" cmd /k "cd backend && python server.py"

echo Aguardando o Backend iniciar...
timeout /t 5

echo Iniciando o Frontend (Interface)...
start "Frontend Financeiro" cmd /k "cd frontend && npm start"

echo.
echo Tudo pronto! O projeto esta sendo executado em duas janelas separadas.
echo - Backend: http://127.0.0.1:8000
echo - Frontend: http://localhost:3000
pause
