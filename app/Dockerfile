# Dockerfile para el frontend Next.js
FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Compilar la aplicación
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]
