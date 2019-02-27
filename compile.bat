@echo off
cls
echo Compiling...
tsc ts/canvas.ts ts/interface.ts ts/helpers.ts
echo.
echo Moving...
move /Y .\ts\*.js .\js
echo.
echo Deleting remaining .map and .js files...
del .\ts\*.map
del .\ts\*.js