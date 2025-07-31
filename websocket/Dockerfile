# Use the official Node.js LTS (Long Term Support) image as the base image
FROM node:18 AS builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Install pnpm in the container
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY .npmrc .

# Enable pnpm store and install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Start a new stage for production
FROM node:18

WORKDIR /usr/src/app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files and dependencies
COPY package.json pnpm-lock.yaml* ./
COPY .npmrc .
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/server.js ./server.js

# Set environment variables
ENV NODE_ENV=production

EXPOSE 4000

# Set the command to start the application (without nodemon in production)
CMD ["node", "server.js"]
