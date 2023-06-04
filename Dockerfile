FROM node:lts-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source

COPY . .

# Expose port
EXPOSE 5173

# Run app
CMD [ "npm", "run", "dev" ]

