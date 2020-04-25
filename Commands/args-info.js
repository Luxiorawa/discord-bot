module.exports = {
    name: 'args-info',
    description: 'Information about the arguments provided.',
    args: true,
    usage: '$args-info my arguments are spaced',
    aliases: ['args'],
    execute(message, args) {
        if (!args.length) {
            return message.channel.send(
                `You didn't provide any arguments, ${message.author}!`
            )
        } else if (args[0] === 'foo') {
            return message.channel.send('bar')
        }

        message.channel.send(
            `Arguments: ${args}\nArguments length: ${args.length}`
        )
    },
}
