const Canvas = require('canvas')
const Discord = require('discord.js')
const jimp = require('jimp')

module.exports = {
    name: 'tr',
    description: 'tr',
    args: false,
    async execute(message) {
        const canvas = Canvas.createCanvas(1920 / 4, 1080 / 4)
        const ctx = canvas.getContext('2d')

        const image = await jimp.read(
            `https://htmlcolorcodes.com/assets/images/html-color-codes-color-tutorials-hero-00e10b1f.jpg`
        )
        await image.resize(200, jimp.AUTO)
        await image.quality(90)
        await image.writeAsync(`./bg.png`)

        let background = await Canvas.loadImage(
            `https://htmlcolorcodes.com/assets/images/html-color-codes-color-tutorials-hero-00e10b1f.jpg`
        )

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
        const attachment = new Discord.MessageAttachment(
            canvas.toBuffer(),
            `test.png`
        )

        message.channel.send(attachment)
    },
}
