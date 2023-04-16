#!/bin/bash -ex

TIME=$(date -u +"%Y%m%d%H%M%S")

DIST="$PWD"/build
FRONTEND="$DIST"/frontend

just clear-cache
just build

mkdir -p "$FRONTEND"
cp -r dist/* "$FRONTEND"

ZIP=nublog.dist."$TIME".zip

pushd "$DIST"
    zip -r "$ZIP" frontend
    rm -rf frontend
popd

echo "$ZIP"
