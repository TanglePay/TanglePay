# Verify your TanglePay Download
You can verify the authenticity of the TanglePay installation package by checking its SHA256 hash now. 

## Windows Operating System

### Verify the SHA256 Hash

1. Open a command-line interface.

2. Create a SHA256 hash of the TanglePay `.zip` or `.apk` file. Replace the path with the path to your package.

```
certUtil -hashfile path\to\TanglePay-Mobile-version.exe SHA256
```

For example, if the file is in the `C:\Users\yourname\Downloads` directory, do the following:

```
certUtil -hashfile C:\Users\yourname\Downloads\TanglePay-Mobile-V1.2.0.apk
```

3. Compare your SHA256 hash with the one in the [release notes](https://github.com/TanglePay/TanglePay-Mobile/releases) and make sure that they match.

## MacOS Operating System

### Verify the SHA256 Hash

1. Open the Terminal (in `/Applications/Utilities/Terminal`).

2. Create a SHA256 hash of the TanglePay Extension `.zip` file. Replace the path with the path to your TanglePay `.zip` file.

  ```bash
  shasum -a 256 /path/to/TanglePay-Extension-V1.2.0.zip
  ```

  For example, if the file is in `~/Downloads`, do the following:

  ```bash
  shasum -a 256 ~/Downloads/TanglePay-Extension-V1.2.0.zip
  ```

3. Compare your SHA256 hash with the one in the [release notes](https://github.com/TanglePay/TanglePay-Extension/releases) and make sure that they match.
    
## Linux Operating System
### Verify the SHA256 Hash

#### Prerequisites

You will need the `sha256sum` package, which is included with most Linux distributions.

1. Open the Terminal.

2. Create a SHA256 hash of the TanglePay Extension zip file. Replace the path with the path to your TanglePay Extension zip file.

  ```bash
  sha256sum path/to/TanglePay-Extension-V1.2.0.zip
  ```

  For example, if the file is in `~/Downloads`, do the following:

  ```bash
  sha256sum ~/Downloads/TanglePay-Extension-V1.2.0.zip
  ```

3. Compare your SHA256 hash with the one in the [release notes](https://github.com/TanglePay/TanglePay-Extension/releases) and make sure that they match.
