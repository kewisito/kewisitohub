export type SocialPlatformId =
  | 'twitch'
  | 'tiktok'
  | 'instagram'
  | 'youtube'
  | 'discord'
  | 'whatsapp';

export interface SocialNetwork {
  id: SocialPlatformId;
  name: string;
  handle: string;
  url: string;
  followers: number;
  labelFollowers: string; // e.g. "seguidores", "suscriptores", "miembros"
  brandColor: string;
  brandBg: string;
  borderColor: string;
  glowColor: string;
  iconType: string;
  description: string;
}

export interface StreamInfo {
  channel: string;
  title: string;
  category: string;
  isLive: boolean;
  viewers?: number;
}
