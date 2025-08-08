# Railway Proxy + Static Files Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (all of them for building)
RUN npm install --legacy-peer-deps

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Copy server.js to working directory (not dist)
COPY server.js ./

# Install only production dependencies for runtime (use install, not ci)
RUN npm install --only=production --legacy-peer-deps && npm cache clean --force

# Expose port
EXPOSE 3000

# Start the Express proxy server explicitly
CMD ["node", "server.js"]
