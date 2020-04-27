const fs = require("fs");
const request = require("request");
const unzipper = require("unzipper");

exports.getBeatmapFiles = async (title, beatmapSetId) => {
	console.log(title);
	console.log(beatmapSetId);
	const file = fs.createWriteStream(`${beatmapSetId}.osz`);

	await new Promise((resolve, reject) => {
		let stream = request.get(`https://bloodcat.com/osu/s/${beatmapSetId}`);
		stream.pipe(file);
		file
			.on("finish", async () => {
				await fs.createReadStream(`${beatmapSetId}.osz`).pipe(await unzipper.Extract({ path: beatmapSetId }));
				resolve();
			})
			.on("error", (error) => {
				reject(error);
			});
	}).catch((error) => {
		console.log(`Something happened: ${error}`);
	});

	return true;
};
