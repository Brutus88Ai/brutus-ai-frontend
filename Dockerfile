FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
ENV PORT=4173
EXPOSE 4173
CMD ["npx", "serve", "-s", "dist", "-l", "4173"]
