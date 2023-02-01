### Setup
```
npm install
```

### Testing
```zsh
npx hardhat test
```

### Deployment
- Fund your wallet address with tFIL
- Set your private key as an environment variable
```zsh
export PRIVATE_KEY=123
```
- Use the deployment file
```zsh
npx hardhat run scripts/deploy.js --network hyperspace
```