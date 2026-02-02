@echo off
echo Removendo arquivos Zone Identifier (versao simples)...
echo.

REM Navega pela estrutura de pastas e remove arquivos Zone.Identifier
echo Processando pasta atual...
dir /s /b "*Zone.Identifier" 2>nul > temp_zone_files.txt

if exist temp_zone_files.txt (
    for /f "delims=" %%i in (temp_zone_files.txt) do (
        if exist "%%i" (
            echo Removendo: %%i
            attrib -s -h "%%i" 2>nul
            del /f /q "%%i" 2>nul
        )
    )
    del temp_zone_files.txt 2>nul
) else (
    echo Nenhum arquivo Zone.Identifier encontrado.
)

echo.
echo Tentando remover streams alternativos...
REM Remove streams NTFS alternativos (método alternativo)
for /r . %%f in (*.*) do (
    if exist "%%f" (
        streams -s -d "%%f" 2>nul >nul
    )
)

echo.
echo Limpeza concluida!
echo.