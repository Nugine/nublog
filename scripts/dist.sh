#!/bin/bash -ex

TIME=$(date -u +"%Y%m%d%H%M%S")

DIST="$PWD"/build
FRONTEND="$DIST"/frontend

just build

mkdir -p "$FRONTEND"
cp -r dist/* "$FRONTEND"

pushd "$DIST"
    zip -r nublog.dist."$TIME".zip frontend
    rm -rf frontend
popd

echo "done"
