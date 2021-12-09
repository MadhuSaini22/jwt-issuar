import * as fs from 'fs'
import * as jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'

type AlgorithmTypes = 'RS256' | 'RS384' | 'RS512' | 'PS256' | 'PS384' | 'PS512'

type AccessTokenExpiryTimeType = '10m' | '15m' | '30m' | '1h' | '2h'
type RefreshTokenExpiryTimeType = '12h' | '1d' | '2d' | '5d' | '7d'

class JwtUsingKeyPair {
  // private and public key paths
  private privateKeyPath: string
  private publicKeyPath: string

  // algorithm
  private alg: AlgorithmTypes = 'RS512'

  // issuer
  private iss: string

  // audience
  private aud: string

  // JWT id
  private jti: string = uuid()

  // expiry default time
  private accessTokenExpTime: AccessTokenExpiryTimeType = '1h'
  private refreshTokenExpTime: RefreshTokenExpiryTimeType = '1d'

  /**
   *
   * @param privateKeyPath RSA Private key absolute path
   * @param publicKeyPath RSA Public key absolute path
   * @param issuer issuer domain name
   * @param audience target audience domain name
   * @param algorithm algorithm for jwt DEFAULT RS512
   * @param accessTokenExpTime expiry time of access token, DEFAULT 1h
   * @param refreshTokenExpTime expiry time of refresh token, DEFAULT 1d
   */
  constructor(
    privateKeyPath: string,
    publicKeyPath: string,
    issuer: string,
    audience: string,
    algorithm?: AlgorithmTypes,
    accessTokenExpTime?: AccessTokenExpiryTimeType,
    refreshTokenExpTime?: RefreshTokenExpiryTimeType
  ) {
    this.privateKeyPath = privateKeyPath
    this.publicKeyPath = publicKeyPath
    this.iss = issuer
    this.aud = audience

    // assigning optional fields
    if (algorithm) this.alg = algorithm
    if (accessTokenExpTime) this.accessTokenExpTime = accessTokenExpTime
    if (refreshTokenExpTime) this.refreshTokenExpTime = refreshTokenExpTime
  }

  public async generateTokens(
    payload: {},
    subjectId: number,
    generateRefreshToken: boolean = false
  ) {
    let accToken: string = ''
    let refToken: string = ''

    /**
     * Readable stream of the private key
     */
    const privateKey = fs.readFileSync(this.privateKeyPath)

    /**
     * Checking whether the keys are available or not
     */
    try {
      const privateKeyExists = fs.existsSync(this.privateKeyPath)
      const publicKeyExists = fs.existsSync(this.publicKeyPath)

      if (!privateKeyExists) {
        console.error('Private key not found at specified path')
        return Promise.reject('Private key not found at specified path')
      } else if (!publicKeyExists) {
        console.error('Public key not found at specified path')
        return Promise.reject('Public key not found at specified path')
      } else {
        console.log('Both keys found')
      }
    } catch (error: any) {
      console.error(error)
      return Promise.reject(error.message)
    }

    /**
     * Generating jwt token
     */
    try {
      accToken = jwt.sign(payload, privateKey, {
        algorithm: this.alg,
        audience: this.aud,
        expiresIn: this.accessTokenExpTime,
        issuer: this.iss,
        jwtid: this.jti,
        subject: subjectId.toString(),
      })
    } catch (error: any) {
      console.log(error)
      return Promise.reject(error.message)
    }

    if (generateRefreshToken) {
      /**
       * Generating refresh token
       */
      try {
        refToken = jwt.sign(payload, privateKey, {
          algorithm: this.alg,
          audience: this.aud,
          expiresIn: this.refreshTokenExpTime,
          issuer: this.iss,
          jwtid: this.jti,
          subject: subjectId.toString(),
        })
      } catch (error: any) {
        console.log(error)
        return Promise.reject(error.message)
      }

      return Promise.resolve({ accessToken: accToken, refreshToken: refToken, jwtId: this.jti })
    } else {
      return Promise.resolve({ accessToken: accToken, jwtId: this.jti })
    }
  }

  /**
   * verifies the given token
   * @param publicKeyPath public key path
   * @param token token to be validated
   * @returns Promise
   */
  public async verifyToken(token: string) {
    /**
     * Readable stream of the public key
     */
    const publicKey = fs.readFileSync(this.publicKeyPath)

    try {
      const decodedToken = jwt.verify(token, publicKey, {
        algorithms: [this.alg],
        audience: this.aud,
        issuer: this.iss,
      })
      return Promise.resolve(decodedToken)
    } catch (error: any) {
      console.error(error)
      Promise.reject(error.message)
    }
  }
}

export default JwtUsingKeyPair
