const totalHits = recentGlobal.count50 + recentGlobal.count100 + recentGlobal.count300 + recentGlobal.countmiss;
const totalSucessfullHits = recentGlobal.count50 + recentGlobal.count100 + recentGlobal.count300;
let beatmapGlobal
let recentGlobal

exports.ppCalculator = async (beatmap, recent) => {
    beatmapGlobal = beatmap
    recentGlobal = recent

    let totalValue = pow(pow(computeAimValue(), 1.1) + pow(computeSpeedValue(), 1.1) + pow(computeAccValue, 1.1), 1.0 / 1.1)
    return totalValue;
};

function computeAimValue()
{
   
}

function computeSpeedValue()
{

}

function computeAccValue()

/*

recent:
{
  beatmap_id: '84813',
  score: '573123',
  maxcombo: '117',
  count50: '3',
  count100: '19',
  count300: '385',
  countmiss: '4',
  countkatu: '14',
  countgeki: '70',
  perfect: '0',
  enabled_mods: '17',
  user_id: '5125470',
  date: '2020-04-27 06:23:31',
  rank: 'A'
}

beatmap:
{
  beatmapset_id: '24997',
  beatmap_id: '84813',
  approved: '1',
  total_length: '130',
  hit_length: '115',
  version: 'Insane',
  file_md5: 'b2401738e698550ebbc3a5cd88d4c04c',
  diff_size: '4',
  diff_overall: '7',
  diff_approach: '8',
  diff_drain: '7',
  mode: '0',
  count_normal: '246',
  count_slider: '160',
  count_spinner: '5',
  submit_date: '2011-01-19 13:22:58',
  approved_date: '2011-04-03 10:25:06',
  last_update: '2011-03-21 20:53:30',
  artist: 'Harada Hitomi',
  artist_unicode: null,
  title: 'nachu*nachu',
  title_unicode: null,
  creator: 'Thite',
  creator_id: '306700',
  bpm: '192',
  source: '',
  tags: 'gowww abba',
  genre_id: '5',
  language_id: '3',
  favourite_count: '93',
  rating: '9.44279',
  storyboard: '0',
  video: '0',
  download_unavailable: '0',
  audio_unavailable: '0',
  playcount: '229955',
  passcount: '37034',
  packs: 'S178',
  max_combo: '617',
  diff_aim: '2.18877',
  diff_speed: '1.94454',
  difficultyrating: '4.25542'
}

*/
