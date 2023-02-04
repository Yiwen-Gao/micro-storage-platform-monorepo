### Setup
```
npm install
npx hardhat compile
```

### Testing
```zsh
npx hardhat test
```

### Deploying
- Fund your wallet address with tFIL
- Set your private key as an environment variable
```zsh
export PRIVATE_KEY=123
```
- Use the deployment file
```zsh
npx hardhat run scripts/deploy-<contract>.js --network hyperspace
```