import { socialAccountRepository } from "../repositories/social.repository";
import { connectSocialSchema } from "../../schemas/social";
import { AppError } from "@/lib/api/errors";
import { prisma } from "@/lib/db/client";

export const socialService = {
  async listByBrand(brandId: string) {
    return socialAccountRepository.findByBrandId(brandId);
  },

  async disconnect(accountId: string) {
    return socialAccountRepository.softDelete(accountId);
  },

  async getOAuthUrl(platform: string, brandId: string, workspaceId: string) {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/v1/social/connect/${platform.toLowerCase()}/callback`;

    const configs: Record<string, { authUrl: string; clientIdEnv: string; scopes: string[] }> = {
      facebook: {
        authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
        clientIdEnv: "FACEBOOK_APP_ID",
        scopes: [
          "pages_show_list",
          "pages_read_engagement",
          "pages_manage_posts",
          "pages_manage_metadata",
          "instagram_basic",
          "instagram_content_publish",
          "instagram_manage_insights",
          "public_profile",
        ],
      },
      youtube: {
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        clientIdEnv: "YOUTUBE_CLIENT_ID",
        scopes: [
          "https://www.googleapis.com/auth/youtube.readonly",
          "https://www.googleapis.com/auth/youtubeanalytics.readonly",
          "https://www.googleapis.com/auth/userinfo.profile",
        ],
      },
    };

    const config = configs[platform.toLowerCase()];
    if (!config) throw new AppError("NOT_FOUND", `Platform "${platform}" not supported for OAuth`);

    const clientId = process.env[config.clientIdEnv];
    if (!clientId) throw new AppError("INTERNAL_ERROR", `Platform "${platform}" not configured`);

    const state = Buffer.from(JSON.stringify({ brandId, workspaceId, platform })).toString("base64");

    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("scope", config.scopes.join(" "));
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");

    return authUrl.toString();
  },

  async handleOAuthCallback(platform: string, code: string, state: string) {
    const { brandId, workspaceId } = JSON.parse(Buffer.from(state, "base64").toString());

    const tokens = await this.exchangeCodeForTokens(platform, code);

    // Fetch account info based on platform
    let accountInfo: { platformId: string; platformHandle: string; accountName: string; followers: number };

    switch (platform.toLowerCase()) {
      case "facebook":
        accountInfo = await this.fetchFacebookAccountInfo(tokens.accessToken);
        break;
      case "youtube":
        accountInfo = await this.fetchYouTubeAccountInfo(tokens.accessToken);
        break;
      default:
        throw new AppError("NOT_FOUND", `Platform "${platform}" not supported`);
    }

    // Check for existing connection
    const existing = await prisma.socialAccount.findFirst({
      where: { platform: platform.toUpperCase() as any, platformId: accountInfo.platformId, deletedAt: null },
    });
    if (existing) throw new AppError("CONFLICT", "This account is already connected");

    // Create social account with credential
    const socialAccount = await prisma.socialAccount.create({
      data: {
        brandId,
        platform: platform.toUpperCase() as any,
        platformId: accountInfo.platformId,
        platformHandle: accountInfo.platformHandle,
        accountName: accountInfo.accountName,
        followers: accountInfo.followers,
        isActive: true,
        credential: {
          create: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken || null,
            expiresAt: tokens.expiresAt || null,
            scopes: tokens.scopes || [],
          },
        },
      },
      include: { credential: true },
    });

    return socialAccount;
  },

  async exchangeCodeForTokens(platform: string, code: string) {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/v1/social/connect/${platform.toLowerCase()}/callback`;

    switch (platform.toLowerCase()) {
      case "facebook": {
        const clientId = process.env.FACEBOOK_APP_ID;
        const clientSecret = process.env.FACEBOOK_APP_SECRET;
        const res = await fetch(
          `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`
        );
        const data = await res.json();
        if (data.error) throw new AppError("AI_PROVIDER_ERROR", data.error.message);
        return {
          accessToken: data.access_token,
          refreshToken: null, // Facebook tokens don't expire, no refresh token
          expiresAt: null,
          scopes: [],
        };
      }
      case "youtube": {
        const clientId = process.env.YOUTUBE_CLIENT_ID;
        const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
        const res = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: clientId!,
            client_secret: clientSecret!,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
          }),
        });
        const data = await res.json();
        if (data.error) throw new AppError("AI_PROVIDER_ERROR", data.error_description);
        return {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: new Date(Date.now() + data.expires_in * 1000),
          scopes: data.scope?.split(" ") || [],
        };
      }
      default:
        throw new AppError("NOT_FOUND", `Platform "${platform}" not supported`);
    }
  },

  async refreshAccessToken(accountId: string) {
    const account = await socialAccountRepository.findById(accountId);
    if (!account || !account.credential?.refreshToken) {
      throw new AppError("NOT_FOUND", "Account not found or no refresh token");
    }

    let newToken: string;
    switch (account.platform) {
      case "YOUTUBE": {
        const res = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.YOUTUBE_CLIENT_ID!,
            client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
            refresh_token: account.credential.refreshToken,
            grant_type: "refresh_token",
          }),
        });
        const data = await res.json();
        if (data.error) throw new AppError("AI_PROVIDER_ERROR", data.error_description);
        newToken = data.access_token;
        break;
      }
      default:
        throw new AppError("NOT_FOUND", `Token refresh not supported for ${account.platform}`);
    }

    await socialAccountRepository.updateToken(accountId, {
      accessToken: newToken,
      expiresAt: new Date(Date.now() + 3600 * 1000),
    });

    return newToken;
  },

  async fetchFacebookAccountInfo(accessToken: string) {
    // Get user's pages
    const res = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}&fields=id,name,username,fan_count,picture`);
    const data = await res.json();
    if (data.error) throw new AppError("AI_PROVIDER_ERROR", data.error.message);

    if (!data.data || data.data.length === 0) {
      throw new AppError("NOT_FOUND", "No Facebook pages found");
    }

    // Return first page for now (UI can let user choose later)
    const page = data.data[0];
    return {
      platformId: page.id,
      platformHandle: page.username || null,
      accountName: page.name,
      followers: page.fan_count || 0,
    };
  },

  async fetchYouTubeAccountInfo(accessToken: string) {
    const res = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (data.error) throw new AppError("AI_PROVIDER_ERROR", data.error.message);

    if (!data.items || data.items.length === 0) {
      throw new AppError("NOT_FOUND", "No YouTube channel found");
    }

    const channel = data.items[0];
    return {
      platformId: channel.id,
      platformHandle: channel.snippet.customUrl || channel.snippet.title,
      accountName: channel.snippet.title,
      followers: parseInt(channel.statistics.subscriberCount || "0", 10),
    };
  },
};
