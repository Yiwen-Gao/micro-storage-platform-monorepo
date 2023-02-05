### Setup
```zsh
cd lotus
make clean ; FFI_BUILD_FROM_SOURCE=1 make
make lotus-bench
```

### Generating Proofs
This currently supports files of size <= 512MiB.
```zsh
./lotus-bench sealData /your/path/file
./lotus-bench windowPost 1
```

### Submitting Proofs on Chain
```zsh
node submit-posts.js --contract-address=<address> --private-key=<key> --proof-paths=<p1>,<p2>,<p3>
```
