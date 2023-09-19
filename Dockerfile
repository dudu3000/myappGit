# ----BASE-----
FROM node:16-alpine as base

RUN apk --no-cache add \
      bash \
      g++ \
      ca-certificates \
      lz4-dev \
      musl-dev \
      cyrus-sasl-dev \
      openssl-dev \
      make \
      python3

RUN apk add --no-cache --virtual .build-deps gcc zlib-dev libc-dev bsd-compat-headers py-setuptools bash

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=secret,id=npmrc,dst=/app/.npmrc \
      yarn install --frozen-lockfile --prod --ignore-optional


# ----PROD-----
FROM node:16-alpine as production

RUN apk --no-cache add \
      lz4 \
      lz4-libs \
      cyrus-sasl

RUN adduser -S -s /sbin/nologin -u 9000 app

WORKDIR /app
COPY --from=base /app/package.json ./
COPY --from=base /app/build ./build
COPY --from=base /app/node_modules ./node_modules

USER 9000

EXPOSE 8080

ENV NODE_ENV=production

CMD ["yarn", "prod:start"]
