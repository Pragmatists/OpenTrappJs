# OpenTrapp

## Description
New backend for Open Time Registration Application written in TypeScript using [Nest](https://github.com/nestjs/nest) framework.

## Installation

```bash
$ yarn install
```

## Running the app

Before starting the application you have to set `OPEN_TRAPP_DB_URI` environment variable.
The value should be MongoDB connection URI.

```bash
# development (incremental rebuild with webpack)
$ yarn webpack
$ yarn start

# production mode
$ yarn start:prod
```
Application will be available under `localhost:3000`.

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```
