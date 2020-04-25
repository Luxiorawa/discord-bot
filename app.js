const fs = require('fs')
const Discord = require('discord.js')
const { prefix } = require('./Config/bot.json')
const dotenv = require('dotenv')
const client = new Discord.Client()
client.commands = new Discord.Collection()

// Read .env file and parse all the content to process.env
dotenv.config()

// Read files ending with .js in the /Commands folder, and assume that each file = one command for the bot.
const commandFiles = fs
    .readdirSync('./Commands')
    .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command)
}

client.on('ready', () => {
    // Event occurred when the bot is ready to go
    console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', (message) => {
    // Event occurred when the bot is receiving a message

    if (!message.content.startsWith(prefix) || message.author.bot) return

    const args = message.content.slice(prefix.length).split(/ +/)
    const commandName = args.shift().toLowerCase()

    const command =
        client.commands.get(commandName) ||
        client.commands.find(
            (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
        )

    if (!command) return

    if (command.args && !args.length) {
        let reply = message.channel.send(
            `You didn't provide any arguments, ${message.author}!`
        )

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``
        }

        return message.channel.send(reply)
    }

    try {
        command.execute(message, args)
    } catch (error) {
        console.error(error)
        message.reply('there was an error trying to execute that command!')
    }
})

client.login(process.env.token)
