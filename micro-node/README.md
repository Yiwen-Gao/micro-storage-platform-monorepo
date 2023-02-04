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


