#!/bin/bash -ex

export NODE_OPTIONS="--max-old-space-size=4096"

just check
just lint
just clear-cache
just build

TIME=$(date -u +"%Y%m%d%H%M%S")

DIST="$PWD"/build
FRONTEND="$DIST"/frontend

mkdir -p "$FRONTEND"
cp -r dist/* "$FRONTEND"

ZIP=nublog.dist."$TIME".zip

pushd "$DIST"
    zip -r "$ZIP" frontend
    rm -rf frontend
popd

echo "$ZIP"
