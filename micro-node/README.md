### Setup
```zsh
cd lotus
make lotus-bench
```

### Generating Proofs
This currently supports files of size <= 512MiB.
```zsh
./lotus-bench sealData /your/path/file
./lotus-bench windowPost 1
```


