@echo off
echo =======================================
echo Compilando Frontend (React/Vite)...
echo =======================================
if exist package-lock.json del package-lock.json
if exist node_modules rmdir /s /q node_modules
call npm install
call npm run build

echo =======================================
echo Instalando dependencias de Backend...
echo =======================================
cd backend
python -m pip install -r requirements.txt
python -m pip install pywebview pyinstaller
cd ..

echo =======================================
echo Empaquetando Aplicacion con PyInstaller...
echo =======================================
pyinstaller Fornax.spec --clean

echo =======================================
echo Finalizado. La aplicacion estara en la carpeta dist/Fornax_CRM/
echo =======================================
