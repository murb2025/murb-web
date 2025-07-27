# Use the official Node.js LTS (Long Term Support) image as the base image
FROM node:18

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

# Build the Application
RUN pnpm run build

# Set the command to start the application
CMD ["pnpm", "start"]
