const fs = require("fs");
const unzipper = require("unzipper");
const download = require("download");

exports.getBeatmapFiles = async (beatmapSetId) => {
	const file = fs.createWriteStream(`${beatmapSetId}.osz`);
	download(`https://bloodcat.com/osu/s/${beatmapSetId}`).pipe(file);

	await new Promise((resolve, reject) => {
		file
			.on("finish", () => {
				fs.createReadStream(`${beatmapSetId}.osz`).pipe(
					unzipper
						.Extract({ path: beatmapSetId })
						.on("close", () => resolve())
						.on("error", () => resolve())
				);
			})
			.on("error", (error) => reject(error));
	});

	return true;
};
