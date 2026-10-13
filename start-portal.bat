@echo off
cd /d "%~dp0"

start "Campus Portal Server" cmd /k "npm.cmd start"

timeout /t 5 /nobreak >nul

start "" http://localhost:3000