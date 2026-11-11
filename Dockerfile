# Stage 1: Build Angular application
FROM node:22-alpine AS build
WORKDIR /app

# Copy package files để cài đặt dependency trước
COPY package*.json ./
RUN npm ci

# Copy toàn bộ source code frontend và tiến hành build
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve bằng Nginx
FROM nginx:alpine

# Xóa các file tĩnh mặc định của nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy kết quả build từ Stage 1 sang thư mục html của Nginx
COPY --from=build /app/dist/NexusOS_Angular/browser /usr/share/nginx/html

# Copy file cấu hình Nginx reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

