const MysqlMiddleware = require("./../Middlewares/Mysql");

module.exports = {
	name: "setosuusername",
	description: "This command is useful for setting your osu username if you are not registered yet",
	args: true,
	aliases: ["setOsuUsername"],
	async execute(message, args) {
		try {
			let usernameEntered = args.join(" ");
			let value = await isUserIdInDatabase(message.member.user.id);

			if (value && value != usernameEntered) {
				let updatedId = await MysqlMiddleware.update(`UPDATE users SET osu_username = ? WHERE user_discord_id = ?`, [
					usernameEntered,
					message.member.user.id
				]);
				if (updatedId) {
					message.channel.send(`Your osu username have been updated to : ${usernameEntered}`);
				}
			} else if (value) {
				message.channel.send(`Your osu username is already set : ${value}`);
			} else {
				let userObject = {
					user_discord_id: message.member.user.id,
					osu_username: usernameEntered
				};

				let insertedId = await MysqlMiddleware.insert(`INSERT INTO users SET ?`, [userObject]);
				if (insertedId) {
					message.channel.send(`Your osu username is now set to : ${usernameEntered}`);
				} else {
					throw new Error("Error during insert");
				}
			}
		} catch (error) {
			message.channel.send("An error occured during $setOsuUsername command");
		}
	}
};

async function isUserIdInDatabase(discordId) {
	let user = await MysqlMiddleware.select(`SELECT osu_username FROM users WHERE user_discord_id = ?`, [discordId]);
	if (user && user.osu_username) {
		return user.osu_username;
	} else {
		return false;
	}
}
