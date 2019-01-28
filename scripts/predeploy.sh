#!/usr/bin/env bash
# If the directory, `dist`, doesn't exist, create `dist`
stat dist || mkdir dist
# Archive artifacts
cd dist
zip -r ../opentrapp.zip ./*
cd ..
