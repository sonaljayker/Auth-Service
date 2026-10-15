#!/bin/sh
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -d "C:/Program Files/Java/jdk-25.0.3" ]; then
  export JAVA_HOME="C:/Program Files/Java/jdk-25.0.3"
fi
cd "$SCRIPT_DIR/backend" || exit 1
./mvnw "$@"
