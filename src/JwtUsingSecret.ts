import * as jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'

// type AlgorithmTypes =
//   | 'HS256'
//   | 'HS384'
//   | 'HS512'
//   | 'RS256'
//   | 'RS384'
//   | 'RS512'
//   | 'PS256'
//   | 'PS384'
//   | 'PS512'
//   | 'ES256'
//   | 'ES384'
//   | 'ES512'

type AlgorithmTypes = 'HS256' | 'HS384' | 'HS512'

type AccessTokenExpiryTimeType = '10m' | '15m' | '30m' | '1h' | '2h' | '4h' | '8h'
type RefreshTokenExpiryTimeType = '12h' | '1d' | '2d' | '5d' | '7d'

class JwtUsingSecret {
  // secret
  private secret: string

  // algorithm
  private alg: AlgorithmTypes = 'HS512'

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
   * @param secret secret key
   * @param issuer issuer domain name
   * @param audience target audience domain name
   * @param algorithm algorithm for jwt DEFAULT RS512
   * @param accessTokenExpTime expiry time of jwt tokens DEFAULT 1 hour
   * @param refreshTokenExpTime expiry time of refresh token DEFAULT 24 hours
   */
  constructor(
    secret: string,
    issuer: string,
    audience: string,
    algorithm?: AlgorithmTypes,
    accessTokenExpTime?: AccessTokenExpiryTimeType,
    refreshTokenExpTime?: RefreshTokenExpiryTimeType
  ) {
    this.secret = secret
    this.iss = issuer
    this.aud = audience

    // assigning optional fields
    if (algorithm) this.alg = algorithm
    if (accessTokenExpTime) this.accessTokenExpTime = accessTokenExpTime
    if (refreshTokenExpTime) this.refreshTokenExpTime = refreshTokenExpTime
  }

  /**
   * generates accessToken and refreshToken for the request
   * @param payload payload to be added to the jwt token
   * @param refreshToken BOOLEAN whether to generate refresh token or not
   */
  public async generateTokens(
    payload: {},
    subjectId: number,
    generateRefreshToken: boolean = false
  ) {
    let accToken: string = ''
    let refToken: string = ''
    /**
     * Generating jwt token
     */
    try {
      accToken = jwt.sign(payload, this.secret.toString(), {
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
        refToken = jwt.sign(payload, this.secret.toString(), {
          algorithm: this.alg,
          audience: this.aud,
          expiresIn: this.refreshTokenExpTime,
          issuer: this.iss,
          jwtid: this.jti,
          subject: subjectId.toString(),
        })
        return Promise.resolve({ accessToken: accToken, refreshToken: refToken, jwtId: this.jti })
      } catch (error: any) {
        console.log(error)
        return Promise.reject(error.message)
      }
    } else {
      return Promise.resolve({ accessToken: accToken, jwtId: this.jti })
    }
  }

  /**
   * verifies the given token
   * @param token token to be validated
   * @returns Promise
   */
  public async verifyToken(token: string) {
    try {
      const decodedToken = jwt.verify(token, this.secret, {
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

export default JwtUsingSecret
