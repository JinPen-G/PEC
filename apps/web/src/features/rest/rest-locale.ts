import { useCallback } from 'react';
import { usePlatformLocale } from '@/features/locale/platform-locale';

const messages = {
  rest: ['休息', '休息', 'Take a break'],
  takeBreak: ['休息一下', '休息一下', 'Take a break'],
  relax: ['让音乐陪你放松片刻。', '讓音樂陪你放鬆片刻。', 'Take a moment to unwind with music.'],
  editionNote: [
    '十分钟版 · 10:13；休息到时自动停止',
    '十分鐘版 · 10:13；休息到時自動停止',
    '10-minute version · 10:13. Stops when your break is over.',
  ],
  playDefault: ['播放默认曲目', '播放預設曲目', 'Play default track'],
  choose: ['选择休息时长', '選擇休息時長', 'Choose a break'],
  short: ['休息 10 分钟', '休息 10 分鐘', '10-minute break'],
  long: ['休息 30 分钟', '休息 30 分鐘', '30-minute break'],
  player: ['休息播放器', '休息播放器', 'Break player'],
  resting: ['休息中', '休息中', 'Taking a break'],
  preparing: ['准备休息', '準備休息', 'Ready for a break'],
  finished: ['休息结束', '休息結束', 'Break complete'],
  remaining: ['休息剩余时间', '休息剩餘時間', 'Break time remaining'],
  expand: ['展开休息播放器', '展開休息播放器', 'Open break player'],
  minimize: ['缩小播放器', '縮小播放器', 'Minimize player'],
  close: ['结束休息', '結束休息', 'End break'],
  back: ['回到工作', '回到工作', 'Back to work'],
  play: ['播放音乐', '播放音樂', 'Play music'],
  pause: ['暂停音乐', '暫停音樂', 'Pause music'],
  previous: ['从头播放', '從頭播放', 'Restart track'],
  next: ['重新播放本曲', '重新播放本曲', 'Play this track again'],
  position: ['歌曲进度', '歌曲進度', 'Track position'],
  volume: ['音乐音量', '音樂音量', 'Music volume'],
  mute: ['静音', '靜音', 'Mute'],
  unmute: ['取消静音', '取消靜音', 'Unmute'],
  loading: ['正在加载音乐', '正在載入音樂', 'Loading music'],
  buffering: ['音乐缓冲中', '音樂緩衝中', 'Buffering music'],
  paused: ['已暂停', '已暫停', 'Paused'],
  playing: ['正在播放', '正在播放', 'Playing'],
  of: ['共', '共', 'of'],
  ended: [
    '休息时间到了，音乐已停止。',
    '休息時間到了，音樂已停止。',
    'Your break is over. Music has stopped.',
  ],
  fileNeeded: [
    '选择 MP3 后开始播放和计时。',
    '選擇 MP3 後開始播放與計時。',
    'Choose an MP3 to start the music and timer.',
  ],
  chooseAudio: ['选择 MP3', '選擇 MP3', 'Choose MP3'],
  changeAudio: ['更换音频', '更換音訊', 'Change audio'],
  filePrivate: [
    '文件仅在当前浏览器播放，不上传。',
    '檔案僅在目前瀏覽器播放，不上傳。',
    'Your file plays in this browser and is not uploaded.',
  ],
  localAudio: ['本地音频', '本機音訊', 'Local audio'],
  loop: ['单曲循环 · 到时停止', '單曲循環 · 到時停止', 'Repeat track · Stops when time is up'],
  stopAtEnd: ['到时自动停止', '到時自動停止', 'Stops when time is up'],
  blocked: [
    '点击播放开始音乐，休息计时继续。',
    '點擊播放開始音樂，休息計時繼續。',
    'Press play to start the music. Your break timer continues.',
  ],
  error: [
    '此音频暂时无法播放，请重试或更换文件。',
    '此音訊暫時無法播放，請重試或更換檔案。',
    'This audio could not play. Retry or choose another file.',
  ],
  fileError: [
    '请选择不超过 200 MB 的音频文件。',
    '請選擇不超過 200 MB 的音訊檔案。',
    'Choose an audio file up to 200 MB.',
  ],
  retry: ['重试播放', '重試播放', 'Retry playback'],
  fullScreen: ['进入浏览器全屏', '進入瀏覽器全螢幕', 'Enter full screen'],
  exitFullScreen: ['退出浏览器全屏', '離開瀏覽器全螢幕', 'Exit full screen'],
  fullScreenError: [
    '浏览器暂不支持全屏，仍可在当前页面休息。',
    '瀏覽器暫不支援全螢幕，仍可在目前頁面休息。',
    'Full screen is unavailable. You can keep using this view.',
  ],
} as const;
export type RestMessage = keyof typeof messages;

export function useRestText() {
  const { locale } = usePlatformLocale();
  const index = locale === 'en' ? 2 : locale === 'zh-Hant' ? 1 : 0;
  return useCallback((key: RestMessage) => messages[key][index], [index]);
}
