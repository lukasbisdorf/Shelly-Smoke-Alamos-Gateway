# Stage 1: Build the application
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create the production image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/public ./public

# Install only production dependencies
RUN npm install --only=production

# Expose the necessary port (change if needed)
EXPOSE 3000

# Define the environment variable for the config path
ENV CONFIG_PATH=/config/config.json

# Define the command to run the application
CMD ["node", "dist/index.js"]
