# Step 1: Build the React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Set up Backend Server
FROM node:20-alpine
WORKDIR /app
COPY --from=frontend-builder /app/dist ./dist
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ .

# Expose Hugging Face Space default port
EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production

# Start Express Backend
CMD ["node", "server.js"]
