FROM node:20-alpine as build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy source
COPY . ./

# Environment variable can be injected at build time, but we fallback gracefully in code
RUN npm run build

# Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
