#
# BUILD CONTAINER
#
FROM node:20 as base
USER node
ENV NODE_ENV production
WORKDIR /app
COPY --chown=node:node package.json yarn.lock .yarnrc.yml tsconfig*.json migrate-mongo-config.js ./
COPY --chown=node:node .yarn/releases ./.yarn/releases
COPY --chown=node:node migrations ./migrations
RUN yarn install --immutable 
COPY --chown=node:node . .
RUN yarn run build

#
# PRODUCTION CONTAINER
#
FROM node:20-alpine as production
RUN touch /var/log/fa.log && chown node:node /var/log/fa.log
USER node
ARG GITHUB_RUN_NUMBER
COPY --chown=node:node --from=base /app/package.json ./package.json
COPY --chown=node:node --from=base /app/migrate-mongo-config.js ./migrate-mongo-config.js
COPY --chown=node:node --from=base /app/node_modules ./node_modules
COPY --chown=node:node --from=base /app/migrations ./migrations
COPY --chown=node:node --from=base /app/dist ./dist
CMD [ "node", "dist/main.js" ]
