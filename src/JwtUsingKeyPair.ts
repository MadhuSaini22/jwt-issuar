import * as fs from 'fs'
class JwtUsingKeyPair {
  privateKeyPath: string
  publicKeyPath: string

  constructor(privateKeyPath: string, publicKeyPath: string) {
    this.privateKeyPath = privateKeyPath
    this.publicKeyPath = publicKeyPath
  }
}

export default JwtUsingKeyPair
