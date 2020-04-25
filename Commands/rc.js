const fs = require('fs')
const Canvas = require('canvas')
const Discord = require('discord.js')
const OsuService = require('./../Services/osu')
const BloodcatService = require('./../Services/bloodcat')
const usersList = require('./../Config/users.json')

module.exports = {
    name: 'recent',
    description: 'Most recent osu score',
    args: false,
    aliases: ['rc'],
    async execute(message) {
        try {
            const osuUsername = usersList[message.member.user.tag]
            const user = await OsuService.getUserInfo(osuUsername)
            const recent = await OsuService.getUserRecent(osuUsername)
            const beatmap = await OsuService.getBeatmapInfo(recent.beatmap_id)

            await BloodcatService.getBeatmapFiles(
                beatmap.title,
                beatmap.beatmapset_id
            )

            const canvas = Canvas.createCanvas(1920 / 2, 1080 / 2)
            const ctx = canvas.getContext('2d')

            // Background
            const background = await Canvas.loadImage(
                `./${beatmap.beatmapset_id}/bg.png`
            )
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

            // Upper rectangle (beatmap name, player, author, difficulty)
            ctx.globalAlpha = 0.7
            ctx.strokeStyle = '#000000'
            ctx.fillRect(0, 0, canvas.width, 100)
            ctx.fillRect(10, 150, 500, 250)

            // Reset global alpha to default value (1.0)
            ctx.globalAlpha = 1.0

            // Type text
            ctx.font = '24px sans-serif'
            ctx.fillStyle = '#ffffff'
            ctx.fillText(beatmap.title, 0, 32)

            ctx.font = '18px sans-serif'
            ctx.fillText(`Created by ${beatmap.creator}`, 0, 60)
            ctx.fillText(`Played by ${user.username}`, 0, 90)

            const attachment = new Discord.MessageAttachment(
                canvas.toBuffer(),
                `${beatmap.title}.jpg`
            )

            message.channel.send(attachment)

            console.log(`Deleting folder ${beatmap.beatmapset_id}`)
            await fs.rmdir(`./${beatmap.beatmapset_id}`)

            console.log(`Deleting file .osz ${beatmap.beatmapset_id}`)
            await fs.unlink(`./${beatmap.beatmapset_id}.osz`)
        } catch (error) {
            console.log(error)
            message.channel.send('An error occured during $rc command')
        }
    },
}
