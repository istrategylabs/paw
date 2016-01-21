FROM node:4.2.3

RUN mkdir /code
WORKDIR /code

# Install api dependencies
ADD package.json /code/
RUN npm install

# Install client dependencies
ADD client/package.json /code/client/
RUN cd /code/client; npm install

# Add api and client files
ADD . /

# Build client application
RUN cd /code/client; npm run build

EXPOSE 3000

CMD ["node", "index.js"]
