import * as fs from 'fs'
// import getPort, { portNumbers } from 'get-port'
import { getPortPromise } from 'portfinder'
import * as util from 'util'
const exec = util.promisify(require('child_process').exec)

class ServeStatic {
  /**
   * path to be served by the server
   */
  private static path: string

  /**
   * @description using constructor for passing the path
   * @param path path to be served
   * @param startPort start looking from this port
   * @param stopPort stop looking when reached this port
   */
  constructor(path: string) {
    ServeStatic.path = path
  }

  /**
   * @description checks whether the path exists or not
   * @returns String
   */
  private static async pathExists() {
    // checking for empty path
    if (!this.path) {
      return Promise.reject('Empty path provided')
    }

    // checking whether the path exists or not
    let exists = fs.existsSync(ServeStatic.path)

    if (!exists) {
      return Promise.reject(ServeStatic.path + ' does not exist')
    } else {
      return Promise.resolve('Path exists')
    }
  }

  public async start() {
    await getPortPromise()
      .then(async (port: any) => {
        console.log(port)
        console.log(ServeStatic.path)
        //
        // `port` is guaranteed to be a free port
        // in this scope.
        //
        await exec(
          `npx http-server -a localhost -p ${port} ${ServeStatic.path}`,
          (error: any, stdOut: any, stdErr: any) => {
            if (error) {
              console.error(`Error: ${error}`)
              return Promise.reject(`Error: ${error}`)
            }
            if (stdErr) {
              console.error(stdErr)
              return Promise.reject(`Error: ${stdErr}`)
            }
            console.log(`stdout: ${stdOut}`)
            return Promise.resolve('Static Server Successfully Started')
          }
        )
      })
      .catch((err: any) => {
        //
        // Could not get a free port, `err` contains the reason.
        //
        console.log(err)
        return Promise.reject(err)
      })
  }

  // /**
  //  * @description starts http-server at given port
  //  * @param port port to start the server
  //  */
  // private static async startServer(port: number) {
  //   // checking for path exists or not
  //   try {
  //     await this.pathExists()
  //   } catch (error) {
  //     console.log(error)
  //     return Promise.reject(error)
  //   }

  //   // checking for port is finite or not
  //   if (!isFinite(port)) {
  //     return Promise.reject('Invalid port number')
  //   }

  //   await exec(
  //     `npx http-server -a localhost -p ${port} ${this.path}`,
  //     (error: any, stdOut: any, stdErr: any) => {
  //       if (error) {
  //         console.error(`Error: ${error}`)
  //         return Promise.reject(`Error: ${error}`)
  //       }

  //       if (stdErr) {
  //         console.error(stdErr)
  //         return Promise.reject(`Error: ${stdErr}`)
  //       }

  //       console.log(`stdout: ${stdOut}`)
  //       return Promise.resolve('Static Server Successfully Started')
  //     }
  //   )

  //   return Promise.resolve('Server started at port: ' + port)
  // }

  // /**
  //  * @description starts http-server at the random port
  //  * @returns Promise
  //  */
  // public async serveAtRandomPort() {
  //   // checking for path exists or not
  //   try {
  //     await ServeStatic.pathExists()
  //   } catch (error) {
  //     console.log(error)
  //     return Promise.reject(error)
  //   }

  //   // finding random port
  //   let port = await getPort()

  //   // starting http server
  //   try {
  //     let result = await ServeStatic.startServer(port)
  //     return Promise.resolve(result)
  //   } catch (error) {
  //     return Promise.reject(error)
  //   }
  // }

  // /**
  //  *
  //  * @param port serve port
  //  * @param randomStart if specified port not found, then an option to start server
  //  * at random port. True for starting the server at random port. 'DEFAULT' true
  //  * @returns Promise
  //  */
  // public async serveAtSpecificPort(port: number, randomStart: boolean = true) {
  //   // checking the port availability
  //   try {
  //     let resultedPort = await getPort({ port })
  //     if (resultedPort === port) {
  //       // starting http server
  //       try {
  //         let result = await ServeStatic.startServer(port)
  //         return Promise.resolve(result)
  //       } catch (error) {
  //         return Promise.reject(error)
  //       }
  //     } else if (randomStart === true) {
  //       // if the specified port is not available then starting server at random port enabled
  //       try {
  //         let result = await this.serveAtRandomPort()
  //         return Promise.resolve(result)
  //       } catch (error) {
  //         return Promise.reject(error)
  //       }
  //     } else {
  //       // error throw on no action performed
  //       return Promise.reject('Static Server Initialization Failed')
  //     }
  //   } catch (error: any) {
  //     console.error(error)
  //     return Promise.reject(error.message)
  //   }
  // }

  // /**
  //  * @description range based static server initialization method
  //  * @param startPort start looking from this port
  //  * @param stopPort stop looking when this port reached
  //  * @returns Promise
  //  */
  // public async serverInSpecificRange(startPort: number, stopPort: number) {
  //   // port in between given range
  //   let resultedPort: number
  //   try {
  //     resultedPort = await getPort({ port: portNumbers(startPort, stopPort) })
  //   } catch (error: any) {
  //     console.log(error.message)
  //     return Promise.reject(error.message)
  //   }

  //   // start the server
  //   try {
  //     let result = await ServeStatic.startServer(resultedPort)
  //     return Promise.resolve(result)
  //   } catch (error) {
  //     return Promise.reject(error)
  //   }
  // }
}

export default ServeStatic
