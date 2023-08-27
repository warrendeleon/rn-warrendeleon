export interface YoutubeApiResponse {
  kind: string;
  etag: string;
  pageInfo: PageInfo;
  items: Video[];
}

export interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}

export interface Video {
  kind: string;
  etag: string;
  id: string;
  snippet: Snippet;
}

export interface Snippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: Thumbnails;
  channelTitle: string;
  playlistId: string;
  position: number;
  resourceId: ResourceId;
  videoOwnerChannelTitle: string;
  videoOwnerChannelId: string;
}

export interface Thumbnails {
  default: Default;
  medium: Medium;
  high: High;
  standard: Standard;
  maxres: Maxres;
}

export interface Default {
  url: string;
  width: number;
  height: number;
}

export interface Medium {
  url: string;
  width: number;
  height: number;
}

export interface High {
  url: string;
  width: number;
  height: number;
}

export interface Standard {
  url: string;
  width: number;
  height: number;
}

export interface Maxres {
  url: string;
  width: number;
  height: number;
}

export interface ResourceId {
  kind: string;
  videoId: string;
}
