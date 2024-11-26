FROM node:alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Ensure the dist folder is copied
RUN ls -la /app/dist

EXPOSE 5000
CMD ["npm", "run", "serve"]