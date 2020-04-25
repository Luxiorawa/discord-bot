const fetch = require('node-fetch')

exports.getRequest = async (url) => {
    let response = await fetch(url)
    return (await response.json())[0]
}
