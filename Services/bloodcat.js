const fs = require('fs')
const request = require('request')
const unzipper = require('unzipper')

exports.getBeatmapFiles = async (title, beatmapId) => {
    console.log(title)
    console.log(beatmapId)
    const file = fs.createWriteStream(`${beatmapId}.osz`)

    await new Promise((resolve, reject) => {
        let stream = request.get(`https://bloodcat.com/osu/s/${beatmapId}`)
        stream.pipe(file)
        file.on('finish', async () => {
            await fs
                .createReadStream(`${beatmapId}.osz`)
                .pipe(unzipper.Extract({ path: beatmapId }))
            resolve()
        }).on('error', (error) => {
            reject(error)
        })
    }).catch((error) => {
        console.log(`Something happened: ${error}`)
    })

    return true
}
