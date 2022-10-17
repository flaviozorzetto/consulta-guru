FROM danlynn/ember-cli:4.4.0-node_16.15
COPY package.json ./
RUN npm install
COPY . .
RUN npm install -g firebase-tools
RUN ember build --prod
CMD firebase deploy --token ${firebase_token}
EXPOSE 4200	