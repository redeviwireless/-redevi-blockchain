FROM node:20-alpine

WORKDIR /app

RUN npm install -g ganache@7.9.2

HEALTHCHECK --interval=30s --timeout=10s \
  CMD wget -qO- http://localhost:8545 || exit 1

EXPOSE 8545

CMD ["ganache", \
  "--host", "0.0.0.0", \
  "--port", "8545", \
  "--chain.chainId", "9983", \
  "--wallet.deterministic", \
  "--wallet.totalAccounts", "10", \
  "--wallet.mnemonic", "redevi wireless solution blockchain network"]
