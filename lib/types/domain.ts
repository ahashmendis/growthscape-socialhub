// Core domain types — will grow as features are implemented

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  timezone: string;
  plan: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  workspaceId: string;
  name: string;
  slug: string | null;
  logoUrl: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SocialAccount {
  id: string;
  brandId: string;
  platform: string;
  platformId: string;
  platformHandle: string | null;
  accountName: string;
  followers: number;
  isActive: boolean;
  lastSyncedAt: string | null;
}
