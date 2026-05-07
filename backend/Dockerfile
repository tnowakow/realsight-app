# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application's code
COPY . .

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Define the command to run the app
CMD ["npm", "start", "--", "--port", "8080"]
