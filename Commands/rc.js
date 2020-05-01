const fs = require("fs");
const moment = require("moment");
const Canvas = require("canvas");
const readline = require("readline");
const Discord = require("discord.js");
const OsuService = require("./../Services/osu");
const BloodcatService = require("./../Services/bloodcat");
const usersList = require("./../Config/users.json");
const { promisify } = require("util");
const path = require("path");
const osu = require("ojsama");
const readdir = promisify(fs.readdir);
const exists = promisify(fs.exists);
const unlink = promisify(fs.unlink);
const sleep = promisify(setTimeout);
require("http").globalAgent.maxSockets = 1000;

module.exports = {
	name: "recent",
	description: "Most recent osu score",
	args: false,
	aliases: ["rc"],
	async execute(message) {
		try {
			console.log("***");
			console.time("Request recent");

			let msg;
			const osuUsername = usersList[message.member.user.tag];
			const recent = await OsuService.getUserRecent(osuUsername);

			console.timeEnd("Request recent");

			if (!recent) {
				message.channel.send("No recent score");
			} else {
				const beatmap = await getBeatmapInfoAndDownloadBeatmap(recent.beatmap_id);

				const canvas = Canvas.createCanvas(640, 360);
				const ctx = canvas.getContext("2d");

				console.time("Find background");
				// Will check all files ending with .png or .jpg (assume the only img in the directory is the background)
				const backgroundNameToFilter = await findBackgroundImageForCurrentDiff(beatmap.beatmapset_id, beatmap.version);
				console.timeEnd("Find background");

				if (backgroundNameToFilter) {
					// Regex to delete outer "" from the background diff
					let backgroundForCurrentDiff = backgroundNameToFilter.replace(/"([^"]+(?="))"/g, "$1");

					const background = await Canvas.loadImage(`./${beatmap.beatmapset_id}/${backgroundForCurrentDiff}`);

					ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
				} else {
					msg = "No background found for this play <@165503887103623168>";
				}

				console.time("Generate Header");
				await generateHeader(ctx, canvas.width, canvas.height, beatmap, recent, osuUsername);
				console.timeEnd("Generate Header");

				console.time("Generate Body");
				await generateBody(ctx, beatmap, recent);
				console.timeEnd("Generate Body");

				console.time("Canvas toBuffer()");
				const attachment = new Discord.MessageAttachment(canvas.toBuffer(), `${beatmap.title}.jpg`);
				console.timeEnd("Canvas toBuffer()");

				console.time("Message Sending");
				if (msg) {
					message.channel.send(msg, attachment);
				} else {
					message.channel.send(attachment);
				}
				console.timeEnd("Message Sending");
				console.log("***");
			}
		} catch (error) {
			console.log(error);
			message.channel.send("An error occured during $rc command");
		}
	}
};

async function getBeatmapInfoAndDownloadBeatmap(beatmapId) {
	console.time("Request beatmap");
	const beatmap = await OsuService.getBeatmapInfo(beatmapId);
	console.timeEnd("Request beatmap");

	const alreadyDownloaded = await exists(beatmap.beatmapset_id);

	if (!alreadyDownloaded) {
		await BloodcatService.getBeatmapFiles(beatmap.beatmapset_id);

		// Workaround, to fix
		await sleep(500);
		await unlink(`./${beatmap.beatmapset_id}.osz`);
	}
	return beatmap;
}

async function findBackgroundImageForCurrentDiff(beatmapset_id, diffPlayed) {
	let dirContent = await readdir(beatmapset_id);

	let targetFileCurrentDiff = dirContent.filter((file) => {
		return path.basename(file).match(diffPlayed);
	})[0];

	const readStream = fs.createReadStream(`./${beatmapset_id}/${targetFileCurrentDiff}`);
	const readInterface = readline.createInterface({
		input: readStream,
		console: false
	});

	let backgroundNameToFilter;
	let format = null;

	for await (const line of readInterface) {
		line.includes(".png") || line.includes(".PNG") ? (format = ".png") : null;
		line.includes(".jpg") || line.includes(".JPG") ? (format = ".jpg") : null;

		if (format) {
			const lineArgsArray = line.split(",");
			backgroundNameToFilter = lineArgsArray.find((el) => el.match(format));
			break;
		}
	}
	readInterface.close();
	readInterface.removeAllListeners();
	readStream.destroy();
	return backgroundNameToFilter;
}

async function generateHeader(ctx, canvasWidth, canvasHeight, beatmap, recent, osuUsername) {
	await new Promise((resolve) => {
		// Upper rectangle (beatmap name, player, author, difficulty)
		ctx.globalAlpha = 0.7;
		ctx.strokeStyle = "#000000";
		ctx.fillRect(0, 0, canvasWidth, 90);

		// Middle rectangle (play stats, score)
		ctx.fillRect(0, 90, 400, canvasHeight);

		// Reset global alpha to default value (1.0)
		ctx.globalAlpha = 1.0;

		// Header left part
		ctx.font = "22px sans-serif";
		ctx.fillStyle = "#ffffff";
		ctx.fillText(beatmap.title, 10, 25);

		ctx.font = "18px sans-serif";
		ctx.fillText(`Created by ${beatmap.creator}`, 10, 50);
		let dateFr = moment(recent.date).add(2, "hours").format("YYYY-MM-DD HH:mm:ss");
		ctx.fillText(`Played by ${osuUsername} on ${dateFr}`, 10, 75);

		ctx.font = "16px sans-serif";
		ctx.textAlign = "right";
		ctx.fillText(
			`CS: ${beatmap.diff_size}  AR: ${beatmap.diff_approach}  OD: ${beatmap.diff_overall}  HP: ${beatmap.diff_drain}  Difficulty: ${parseFloat(
				beatmap.difficultyrating
			).toFixed(2)}`,
			canvasWidth - 10,
			20
		);

		ctx.fillText(`Durée: ${beatmap.hit_length}  BPM: ${beatmap.bpm}`, canvasWidth - 10, 40);

		ctx.textAlign = "left";
		resolve();
	});
}

async function generateBody(ctx, beatmap, recent) {
	let baseWidth = 80;

	const hit300 = await Canvas.loadImage(`./Assets/img/hit300.png`);
	ctx.drawImage(hit300, 10, 100, 33, 15);
	var individualDigits300 = recent.count300.split("").map(Number);

	let lastDigitWidth = 0;

	for (let digit of individualDigits300) {
		let digitLoaded = await Canvas.loadImage(`./Assets/img/${digit}.png`);
		if (digit != 1) {
			ctx.drawImage(digitLoaded, baseWidth + lastDigitWidth, 102, 10, 12);
			lastDigitWidth += 10;
		} else {
			ctx.drawImage(digitLoaded, baseWidth + lastDigitWidth, 102, 3, 12);
			lastDigitWidth += 6;
		}
	}

	let comboX = await Canvas.loadImage(`./Assets/img/combo-x.png`);
	ctx.drawImage(comboX, baseWidth + lastDigitWidth, 107, 7, 8);
	lastDigitWidth = 0;

	const hit100 = await Canvas.loadImage(`./Assets/img/hit100.png`);
	ctx.drawImage(hit100, 10, 150, 26, 15);
	var individualDigits100 = recent.count100.split("").map(Number);

	for (let digit of individualDigits100) {
		let digitLoaded = await Canvas.loadImage(`./Assets/img/${digit}.png`);

		if (digit != 1) {
			ctx.drawImage(digitLoaded, baseWidth + lastDigitWidth, 152, 10, 12);
			lastDigitWidth += 10;
		} else {
			ctx.drawImage(digitLoaded, baseWidth + lastDigitWidth, 152, 3, 12);
			lastDigitWidth += 6;
		}
	}
	comboX = await Canvas.loadImage(`./Assets/img/combo-x.png`);
	ctx.drawImage(comboX, baseWidth + lastDigitWidth, 157, 7, 8);
	lastDigitWidth = 0;

	const hit50 = await Canvas.loadImage(`./Assets/img/hit50.png`);
	ctx.drawImage(hit50, 10, 200, 22, 15);
	var individualDigits50 = recent.count50.split("").map(Number);

	for (let digit of individualDigits50) {
		let digitLoaded = await Canvas.loadImage(`./Assets/img/${digit}.png`);

		if (digit != 1) {
			ctx.drawImage(digitLoaded, baseWidth + lastDigitWidth, 202, 10, 12);
			lastDigitWidth += 10;
		} else {
			ctx.drawImage(digitLoaded, baseWidth + lastDigitWidth, 202, 3, 12);
			lastDigitWidth += 6;
		}
	}
	comboX = await Canvas.loadImage(`./Assets/img/combo-x.png`);
	ctx.drawImage(comboX, baseWidth + lastDigitWidth, 207, 7, 8);
	lastDigitWidth = 0;

	const hit0 = await Canvas.loadImage(`./Assets/img/hit0.png`);
	ctx.drawImage(hit0, 10, 250, 15, 16);
	var individualDigits0 = recent.countmiss.split("").map(Number);

	for (let digit of individualDigits0) {
		let digitLoaded = await Canvas.loadImage(`./Assets/img/${digit}.png`);

		if (digit != 1) {
			ctx.drawImage(digitLoaded, baseWidth + lastDigitWidth, 252, 10, 12);
			lastDigitWidth += 10;
		} else {
			ctx.drawImage(digitLoaded, baseWidth + lastDigitWidth, 252, 3, 12);
			lastDigitWidth += 6;
		}
	}
	comboX = await Canvas.loadImage(`./Assets/img/combo-x.png`);
	ctx.drawImage(comboX, baseWidth + lastDigitWidth, 257, 7, 8);
	lastDigitWidth = 0;

	let combo = recent.maxcombo;
	let maxCombo = beatmap.max_combo;

	ctx.font = "18px sans-serif";
	ctx.fillText("Combo / Max combo", 10, 310);

	let individualDigitsCombo = combo.split("").map(Number);
	let individualDigitsMaxCombo = maxCombo.split("").map(Number);

	for (let digit of individualDigitsCombo) {
		let digitLoaded = await Canvas.loadImage(`./Assets/img/${digit}.png`);

		if (digit != 1) {
			ctx.drawImage(digitLoaded, 10 + lastDigitWidth, 320, 10, 12);
			lastDigitWidth += 10;
		} else {
			ctx.drawImage(digitLoaded, 10 + lastDigitWidth, 320, 3, 12);
			lastDigitWidth += 6;
		}
	}

	ctx.font = "15px sans-serif";
	ctx.fillText("/", 15 + lastDigitWidth, 330);
	lastDigitWidth += 15;

	for (let digit of individualDigitsMaxCombo) {
		let digitLoaded = await Canvas.loadImage(`./Assets/img/${digit}.png`);

		if (digit != 1) {
			ctx.drawImage(digitLoaded, 10 + lastDigitWidth, 320, 10, 12);
			lastDigitWidth += 10;
		} else {
			ctx.drawImage(digitLoaded, 10 + lastDigitWidth, 320, 3, 12);
			lastDigitWidth += 6;
		}
	}
	lastDigitWidth = 0;

	let upper = 50 * parseInt(recent.count50) + 100 * parseInt(recent.count100) + 300 * parseInt(recent.count300);
	let down = 300 * (parseInt(recent.countmiss) + parseInt(recent.count50) + parseInt(recent.count100) + parseInt(recent.count300));

	let accuracy = parseFloat((upper / down) * 100).toFixed(2);

	ctx.font = "18px sans-serif";
	ctx.fillText("Accuracy", 285, 310);

	let individualCharAccuracy = accuracy.toString().split("").map(String);

	for (let char of individualCharAccuracy) {
		let charLoaded = char !== "." ? await Canvas.loadImage(`./Assets/img/${char}.png`) : await Canvas.loadImage(`./Assets/img/point.png`);
		if (char === "1") {
			ctx.drawImage(charLoaded, 300 + lastDigitWidth, 320, 3, 12);
			lastDigitWidth += 3;
		} else if (char === ".") {
			ctx.drawImage(charLoaded, 300 + lastDigitWidth, 327, 6, 6);
			lastDigitWidth += 6;
		} else {
			ctx.drawImage(charLoaded, 300 + lastDigitWidth, 320, 10, 12);
			lastDigitWidth += 10;
		}
	}
	let percent = await Canvas.loadImage(`./Assets/img/score-percent.png`);
	ctx.drawImage(percent, 300 + 7 + lastDigitWidth, 318, 10, 16);

	await generatePpValues(ctx, beatmap, recent);
}

async function generatePpValues(ctx, beatmap, recent) {
	let ppArray = [];
	let mods = osu.modbits.none;

	// Play pp value
	let dirContent = await readdir(beatmap.beatmapset_id);

	let targetFileCurrentDiff = dirContent.filter((file) => {
		return path.basename(file).match(beatmap.version);
	})[0];

	await new Promise((resolve, reject) => {
		var parser = new osu.parser();
		let readStream = fs.createReadStream(`${beatmap.beatmapset_id}/${targetFileCurrentDiff}`);

		readline
			.createInterface({
				input: readStream,
				terminal: false
			})
			.on("line", parser.feed_line.bind(parser))
			.on("close", function () {
				var map = parser.map;

				var stars = new osu.diff().calc({ map: map, mods: mods });

				var pp = osu.ppv2({
					stars: stars,
					combo: parseInt(recent.maxcombo),
					n300: parseInt(recent.count300),
					n100: parseInt(recent.count100),
					n50: parseInt(recent.count50),
					nmiss: parseInt(recent.countmiss)
				});

				ppArray.push(pp.toString());

				// SS
				ppArray.push(osu.ppv2({ map: map, mods: mods }).toString());

				// 99
				ppArray.push(osu.ppv2({ stars: stars, combo: map.max_combo(), acc_percent: 99.0 }).toString());

				// 98
				ppArray.push(osu.ppv2({ stars: stars, combo: map.max_combo(), acc_percent: 98.0 }).toString());

				// 97
				ppArray.push(osu.ppv2({ stars: stars, combo: map.max_combo(), acc_percent: 97.0 }).toString());

				// 95
				ppArray.push(osu.ppv2({ stars: stars, combo: map.max_combo(), acc_percent: 95.0 }).toString());

				resolve();
			});
	});

	return ppArray;
}

async function deleteUnnecessaryFiles(beatmapsetId) {}
