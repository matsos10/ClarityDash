import { AppId } from './types';

export const APPS: { id: AppId; label: string; bg: string; fg: string }[] = [
  { id: 'netflix', label: 'NETFLIX', bg: '#000000', fg: '#E50914' },
  { id: 'prime', label: 'prime video', bg: '#00A8E1', fg: '#FFFFFF' },
  { id: 'disney', label: 'Disney+', bg: '#0E1A5A', fg: '#FFFFFF' },
  { id: 'youtube', label: 'YouTube', bg: '#FF0000', fg: '#FFFFFF' },
  { id: 'spotify', label: 'Spotify', bg: '#1DB954', fg: '#000000' },
  { id: 'appletv', label: 'Apple TV', bg: '#2C2C2E', fg: '#FFFFFF' },
];

export const appLabel = (id: AppId) => APPS.find((a) => a.id === id)?.label ?? id;

/** Android TV / Google TV: links aceites pelo pedido "app link launch". */
export const ANDROID_TV_LINKS: Record<AppId, string> = {
  netflix: 'https://www.netflix.com/title',
  prime: 'https://app.primevideo.com',
  disney: 'https://www.disneyplus.com',
  youtube: 'https://www.youtube.com',
  spotify: 'market://launch?id=com.spotify.tv.android',
  appletv: 'market://launch?id=com.apple.atve.androidtv.appletv',
};

/** Samsung Tizen: IDs das aplicações (várias versões consoante o ano da TV). */
export const SAMSUNG_APP_IDS: Record<AppId, string[]> = {
  netflix: ['3201907018807', '11101200001'],
  prime: ['3201910019365', '3201512006785'],
  disney: ['3201901017640'],
  youtube: ['111299001912'],
  spotify: ['3201606009684'],
  appletv: ['3201807016597'],
};

/** Roku: IDs dos canais. */
export const ROKU_CHANNELS: Record<AppId, string> = {
  netflix: '12',
  prime: '13',
  disney: '291097',
  youtube: '837',
  spotify: '22297',
  appletv: '551012',
};

/** Sony: palavras procuradas no título das aplicações instaladas. */
export const SONY_TITLES: Record<AppId, RegExp> = {
  netflix: /netflix/i,
  prime: /prime video|amazon video|amazon prime/i,
  disney: /disney/i,
  youtube: /^youtube$|youtube(?! kids| music)/i,
  spotify: /spotify/i,
  appletv: /apple tv/i,
};
