import * as jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'

type AlgorithmTypes =
  | 'HS256'
  | 'HS384'
  | 'HS512'
  | 'RS256'
  | 'RS384'
  | 'RS512'
  | 'PS256'
  | 'PS384'
  | 'PS512'
  | 'ES256'
  | 'ES384'
  | 'ES512'

class JwtUsingSecret {
  // secret
  private secret: string

  // jwt type
  private typ: string = 'JWT'

  // algorithm
  private alg: AlgorithmTypes = 'HS512'

  // issuer
  private iss: string

  // audience
  private aud: string

  // JWT id
  private jti: string = uuid()

  // expiry time
  private exp: string = '1h'

  // refresh token expiry time
  private refExp: string = '24h'

  /**
   *
   * @param secret secret key
   * @param issuer issuer domain name
   * @param audience target audience domain name
   * @param expiryTime expiry time of jwt tokens DEFAULT 1 hour
   * @param algorithm algorithm for jwt DEFAULT RS512
   * @param refreshTokenExpTime expiry time of refresh token DEFAULT 24 hours
   */
  constructor(
    secret: string,
    issuer: string,
    audience: string,
    expiryTime?: string,
    algorithm?: AlgorithmTypes,
    refreshTokenExpTime?: string
  ) {
    this.secret = secret
    this.iss = issuer
    this.aud = audience
    this.exp = expiryTime ? expiryTime : this.exp
    this.alg = algorithm ? algorithm : this.alg
    this.refExp = refreshTokenExpTime ? refreshTokenExpTime : this.refExp
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
        expiresIn: this.exp,
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
          expiresIn: this.refExp,
          issuer: this.iss,
          jwtid: this.jti,
          subject: subjectId.toString(),
        })
      } catch (error: any) {
        console.log(error)
        return Promise.reject(error.message)
      }

      return Promise.resolve({ accessToken: accToken, refreshToken: refToken })
    } else {
      return Promise.resolve({ accessToken: accToken })
    }
  }

  /**
   * verifies the given token
   * @param token token to be validated
   */
  public async verifyToken(token: string) {
    let decodedToken: any
    jwt.verify(
      token,
      this.secret,
      {
        algorithms: [this.alg],
        audience: this.aud,
        issuer: this.iss,
      },
      (error, decoded) => {
        if (error) return Promise.reject(error.message)

        if (!token) {
          return Promise.reject('Error in token decoding')
        }

        decodedToken = decoded
      }
    )

    return Promise.resolve(decodedToken)
  }
}

export default JwtUsingSecret
