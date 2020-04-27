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
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const sleep = promisify(setTimeout);
const imgFolder = "./Assets/img/";

module.exports = {
	name: "recent",
	description: "Most recent osu score",
	args: false,
	aliases: ["rc"],
	async execute(message) {
		try {
			const osuUsername = usersList[message.member.user.tag];
			const user = await OsuService.getUserInfo(osuUsername);
			const recent = await OsuService.getUserRecent(osuUsername);
			const beatmap = await OsuService.getBeatmapInfo(recent.beatmap_id);

			// await BloodcatService.getBeatmapFiles(beatmap.title, beatmap.beatmapset_id);

			// // // Workaround, to fix
			// await sleep(500);

			const canvas = Canvas.createCanvas(640, 360);
			const ctx = canvas.getContext("2d");

			// Will check all files ending with .png or .jpg (assume the only img in the directory is the background)
			let dest = `./${beatmap.beatmapset_id}/`;

			let dirContent = await readdir(dest);

			let targetFileCurrentDiff = dirContent.filter((file) => {
				return path.basename(file).match(beatmap.version);
			})[0];
			console.log(targetFileCurrentDiff);

			const readInterface = readline.createInterface({
				input: fs.createReadStream(`${dest}${targetFileCurrentDiff}`),
				console: false,
				crlfDelay: Infinity
			});

			let backgroundNameToFilter;

			for await (const line of readInterface) {
				if (line.includes(".png")) {
					let lineArray = line.split(",");
					backgroundNameToFilter = lineArray.find((el) => el.match(".png"));
					readInterface.close();
					readInterface.removeAllListeners();
					break;
				} else if (line.includes(".jpg")) {
					let lineArray = line.split(",");
					backgroundNameToFilter = lineArray.find((el) => el.match(".jpg"));
					readInterface.close();
					readInterface.removeAllListeners();
					break;
				}
			}

			// Regex to delete outer "" from the background diff
			let backgroundForCurrentDiff = backgroundNameToFilter.replace(/"([^"]+(?="))"/g, "$1");

			// Background
			const background = await Canvas.loadImage(`${dest}${backgroundForCurrentDiff}`);

			ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

			// Upper rectangle (beatmap name, player, author, difficulty)
			ctx.globalAlpha = 0.7;
			ctx.strokeStyle = "#000000";
			ctx.fillRect(0, 0, canvas.width, 90);

			// Middle rectangle
			ctx.fillRect(0, 90, 400, canvas.height);

			// Reset global alpha to default value (1.0)
			ctx.globalAlpha = 1.0;

			// Header left part
			ctx.font = "22px sans-serif";
			ctx.fillStyle = "#ffffff";
			ctx.fillText(beatmap.title, 10, 25);

			ctx.font = "18px sans-serif";
			ctx.fillText(`Created by ${beatmap.creator}`, 10, 50);
			let dateFr = moment(recent.date).add(2, "hours").format("YYYY-MM-DD HH:mm:ss");
			ctx.fillText(`Played by ${user.username} on ${dateFr}`, 10, 75);

			// Header right part
			ctx.font = "16px sans-serif";
			ctx.textAlign = "right";
			ctx.fillText(
				`CS: ${beatmap.diff_size}  AR: ${beatmap.diff_approach}  OD: ${beatmap.diff_overall}  HP: ${beatmap.diff_drain}  Difficulty: ${parseFloat(
					beatmap.difficultyrating
				).toFixed(2)}`,
				canvas.width - 10,
				20
			);

			ctx.fillText(`Durée: ${beatmap.hit_length}  BPM: ${beatmap.bpm}`);

			ctx.textAlign = "left";
			// Body text
			let baseWidth = 80;
			let index = 0;
			let totalWidth = 0;

			const hit300 = await Canvas.loadImage(`${imgFolder}hit300.png`);
			ctx.drawImage(hit300, 10, 100, 33, 15);
			var individualDigits300 = recent.count300.split("").map(Number);

			for (let digit of individualDigits300) {
				let digitLoaded = await Canvas.loadImage(`${imgFolder}${digit}.png`);

				if (digit != 1) {
					ctx.drawImage(digitLoaded, baseWidth + 10 * index, 105, 10, 12);
					totalWidth += 10;
				} else {
					ctx.drawImage(digitLoaded, baseWidth + 10 * index, 105, 3, 12);
					totalWidth += 3;
				}

				index++;
			}

			let comboX = await Canvas.loadImage(`${imgFolder}combo-x.png`);
			ctx.drawImage(comboX, baseWidth + 2 + totalWidth, 110, 7, 8);
			index = 0;
			totalWidth = 0;

			const hit100 = await Canvas.loadImage(`${imgFolder}hit100.png`);
			ctx.drawImage(hit100, 10, 150, 26, 15);
			var individualDigits100 = recent.count100.split("").map(Number);

			for (let digit of individualDigits100) {
				let digitLoaded = await Canvas.loadImage(`${imgFolder}${digit}.png`);

				if (digit != 1) {
					ctx.drawImage(digitLoaded, baseWidth + 10 * index, 155, 10, 12);
					totalWidth += 10;
				} else {
					ctx.drawImage(digitLoaded, baseWidth + 10 * index, 155, 3, 12);
					totalWidth += 3;
				}

				index++;
			}
			comboX = await Canvas.loadImage(`${imgFolder}combo-x.png`);
			ctx.drawImage(comboX, baseWidth + 2 + totalWidth, 160, 7, 8);
			index = 0;
			totalWidth = 0;

			const hit50 = await Canvas.loadImage(`${imgFolder}hit50.png`);
			ctx.drawImage(hit50, 10, 200, 22, 15);
			var individualDigits50 = recent.count50.split("").map(Number);

			for (let digit of individualDigits50) {
				let digitLoaded = await Canvas.loadImage(`${imgFolder}${digit}.png`);

				if (digit != 1) {
					ctx.drawImage(digitLoaded, baseWidth + 10 * index, 205, 10, 12);
					totalWidth += 10;
				} else {
					ctx.drawImage(digitLoaded, baseWidth + 10 * index, 205, 3, 12);
					totalWidth += 3;
				}
				index++;
			}
			comboX = await Canvas.loadImage(`${imgFolder}combo-x.png`);
			ctx.drawImage(comboX, baseWidth + 2 + totalWidth, 210, 7, 8);
			index = 0;
			totalWidth = 0;

			const hit0 = await Canvas.loadImage(`${imgFolder}hit0.png`);
			ctx.drawImage(hit0, 10, 250, 20, 21);
			var individualDigits0 = recent.countmiss.split("").map(Number);

			for (let digit of individualDigits0) {
				let digitLoaded = await Canvas.loadImage(`${imgFolder}${digit}.png`);

				if (digit != 1) {
					ctx.drawImage(digitLoaded, baseWidth + 10 * index, 255, 10, 12);
					totalWidth += 10;
				} else {
					ctx.drawImage(digitLoaded, baseWidth + 10 * index, 255, 3, 12);
					totalWidth += 3;
				}
				index++;
			}
			comboX = await Canvas.loadImage(`${imgFolder}combo-x.png`);
			ctx.drawImage(comboX, baseWidth + 2 + totalWidth, 260, 7, 8);
			index = 0;
			totalWidth = 0;

			let combo = recent.maxcombo;
			let maxCombo = beatmap.max_combo;

			ctx.font = "18px sans-serif";
			ctx.fillText("Combo / Max combo", 10, 310);

			let individualDigitsCombo = combo.split("").map(Number);
			let individualDigitsMaxCombo = maxCombo.split("").map(Number);

			for (let digit of individualDigitsCombo) {
				let digitLoaded = await Canvas.loadImage(`${imgFolder}${digit}.png`);

				if (digit != 1) {
					ctx.drawImage(digitLoaded, 10 + 10 * index, 320, 10, 12);
					totalWidth += 10;
				} else {
					ctx.drawImage(digitLoaded, 10 + 10 * index, 320, 3, 12);
					totalWidth += 3;
				}
				index++;
			}

			ctx.font = "15px sans-serif";
			ctx.fillText("/", 25 + totalWidth, 330);

			index += 2;
			for (let digit of individualDigitsMaxCombo) {
				let digitLoaded = await Canvas.loadImage(`${imgFolder}${digit}.png`);

				if (digit != 1) {
					ctx.drawImage(digitLoaded, 10 + 10 * index, 320, 10, 12);
					totalWidth += 10;
				} else {
					ctx.drawImage(digitLoaded, 10 + 10 * index, 320, 3, 12);
					totalWidth += 3;
				}
				index++;
			}
			index = 0;
			totalWidth = 0;

			let upper = 50 * parseInt(recent.count50) + 100 * parseInt(recent.count100) + 300 * parseInt(recent.count300);
			let down = 300 * (parseInt(recent.countmiss) + parseInt(recent.count50) + parseInt(recent.count100) + parseInt(recent.count300));

			let accuracy = parseFloat(upper / down).toFixed(4) * 100;

			ctx.font = "18px sans-serif";
			ctx.fillText("Accuracy", 285, 310);

			let individualCharAccuracy = accuracy.toString().split("").map(String);

			for (let char of individualCharAccuracy) {
				let charLoaded = char !== "." ? await Canvas.loadImage(`${imgFolder}${char}.png`) : await Canvas.loadImage(`${imgFolder}point.png`);
				if (char === "1") {
					ctx.drawImage(charLoaded, 300 + 10 * index, 320, 3, 12);
					totalWidth += 3;
				} else if (char === ".") {
					ctx.drawImage(charLoaded, 300 + 10 * index, 327, 6, 6);
					totalWidth += 6;
				} else {
					ctx.drawImage(charLoaded, 300 + 10 * index, 320, 10, 12);
					totalWidth += 10;
				}
				index++;
			}
			let percent = await Canvas.loadImage(`${imgFolder}score-percent.png`);
			ctx.drawImage(percent, 300 + 7 + totalWidth, 318, 10, 16);

			const attachment = new Discord.MessageAttachment(canvas.toBuffer(), `${beatmap.title}.jpg`);

			message.channel.send(attachment);

			// console.log(`Deleting folder ${beatmap.beatmapset_id}`)
			// deleteFolderRecursive(`./${beatmap.beatmapset_id}`)

			// console.log(`Deleting file .osz ${beatmap.beatmapset_id}`);
			// await unlink(`./${beatmap.beatmapset_id}.osz`);
		} catch (error) {
			console.log(error);
			message.channel.send("An error occured during $rc command");
		}
	}
};

var deleteFolderRecursive = function (path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function (file) {
			var curPath = path + "/" + file;
			if (fs.lstatSync(curPath).isDirectory()) {
				// recurse
				deleteFolderRecursive(curPath);
			} else {
				// delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
};
