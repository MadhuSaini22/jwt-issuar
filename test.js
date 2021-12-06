const serveStatic = require('./lib/index').default

const find = () => {
  try {
    let result = serveStatic('')
  } catch (error) {}
}

find()
