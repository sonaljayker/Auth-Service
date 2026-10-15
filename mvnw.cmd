@echo off
if exist "C:\Program Files\Java\jdk-25.0.3" set "JAVA_HOME=C:\Program Files\Java\jdk-25.0.3"
pushd "%~dp0backend"
call .\mvnw.cmd %*
set "EXIT_CODE=%ERRORLEVEL%"
popd
exit /b %EXIT_CODE%
