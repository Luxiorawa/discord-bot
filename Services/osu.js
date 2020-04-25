const token = process.env.osuToken
const osuApi = `https://osu.ppy.sh/api/`
const { getRequest } = require('./../Wrapper/request')

exports.getUserInfo = async (osuUsername) => {
    try {
        const getUserInfo = `${osuApi}get_user?k=${token}&u=${osuUsername}&m=0&type=string`
        return await getRequest(getUserInfo)
    } catch (error) {
        console.log(
            `An error occured during getUserInfo service function`,
            error
        )
    }
}

exports.getUserRecent = async (osuUsername) => {
    try {
        const getUserRecent = `${osuApi}get_user_recent?k=${token}&u=${osuUsername}&m=0&limit=1&type=string`
        return await getRequest(getUserRecent)
    } catch (error) {
        console.log(
            'An error occured during getUserRecent service function',
            error
        )
    }
}

exports.getBeatmapInfo = async (beatmapId) => {
    try {
        const getBeatmapInfo = `${osuApi}get_beatmaps?k=${process.env.osuToken}&b=${beatmapId}&limit=1`
        return await getRequest(getBeatmapInfo)
    } catch (error) {
        console.log(
            'An error occured during getBeatmapInfo service function',
            error
        )
    }
}
