[![Build Status](https://travis-ci.org/Pragmatists/OpenTrappJs.svg?branch=master)](https://travis-ci.org/Pragmatists/OpenTrappJs)
[![Coverage Status](https://coveralls.io/repos/github/Pragmatists/OpenTrappJs/badge.svg?branch=master)](https://coveralls.io/github/Pragmatists/OpenTrappJs?branch=master)

# OpenTrapp

## Description
New backend for Open Time Registration Application written in TypeScript using [Nest](https://github.com/nestjs/nest) framework.

## Development

### Installation

```bash
$ yarn install
```

### Running the app

Before starting the application you have to set:
 * `OPEN_TRAPP_DB_URI` environment variable. The value should be MongoDB connection URI.
 * `OPEN_TRAPP_OAUTH_CLIENT_ID` OpenID Connect client ID (see [Google Docs](https://developers.google.com/identity/protocols/OpenIDConnect)).
 * `OPEN_TRAPP_OAUTH_CLIENT_SECRET` OpenID Connect client secret
 * `OPEN_TRAPP_SERVER_URL` Where server is running e.g. http://localhost:3000

```bash
# development (incremental rebuild with webpack)
$ yarn webpack
$ yarn start

# production mode
$ yarn start:prod
```
Application will be available under `localhost:3000`.

### Tests

```bash
# unit tests with coverage
$ yarn test
```

### Mock security
To mock security in controller test you should import `MockAuthModule`
and then add `Authorization` header with value `Bearer test-token` to each request to protected endpoint.

### In-memory Mongo database
To use in-memory Mongo in test you should `testModuleWithInMemoryDb` function from `utils/test-utils.ts` to build your test module.

## Production environment

Application is deployed to AWS Elastic Beanstalk and available under following URL:
[opentrapp.eu-central-1.elasticbeanstalk.com](opentrapp.eu-central-1.elasticbeanstalk.com)

Automatic deployment is enabled and is triggered by each push to master branch.

### Swagger
Swagger is available under `/swagger` path, e.g. [PROD Swagger](opentrapp.eu-central-1.elasticbeanstalk.com/swagger)

### SSL
Certificate files are stored on S3.

NGINX is configured in `.ebextensions/https-instange.config` file.

Port 443 on EB EC2 instance is enabled by `.ebextensions/https-instance-single.config`.