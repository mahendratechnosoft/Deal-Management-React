# Stage 1: Build React app with Vite
FROM node:22 AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
#RUN npm ci  # safer, faster, uses package-lock.json

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

# Copy built files from previous stage
COPY --from=build /app/dist .

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
