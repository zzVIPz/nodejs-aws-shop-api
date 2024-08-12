# Setup base environment & install dependencies
FROM node:20-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Compile the application code
FROM base AS build
WORKDIR /usr/src/app
COPY . .
RUN npm run build

# Create a minimal final image with only the dependencies and compiled code needed to run the application
FROM node:20-alpine AS dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
EXPOSE 4000
CMD  ["node", "dist/main.js"]