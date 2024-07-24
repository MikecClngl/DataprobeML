# Dockerfile - Frontend
# Node.js image
FROM node:latest as node

#Working directory
WORKDIR /app

# Copy folder
COPY . .

# Copile angular app
RUN npm install
RUN npm run build --prod

#Server NGINX for app
FROM nginx:alpine
COPY --from=0 /app/www /usr/share/nginx/html


# NGINX configuration to handle SPA routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
