FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache git
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3333 5005
CMD ["sh", "-c", "npm run build && npm run dev"]
