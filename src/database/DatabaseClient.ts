import { DatabaseSync } from "node:sqlite";

class DatabaseClient {
  db: DatabaseSync;

  constructor() {
    this.db = new DatabaseSync("./storage.db");
  }

  async init() {
    await this.db.exec(
      "CREATE TABLE IF NOT EXISTS report_channel(guild_id text PRIMARY KEY,channel_id text)",
    );
    await this.db.exec(
      "CREATE TABLE IF NOT EXISTS reaction_emojis(guild_id text PRIMARY KEY,emojis text)",
    );
    await this.db.exec(
      "CREATE TABLE IF NOT EXISTS ignore_channels(guild_id text PRIMARY KEY,channel_ids text)",
    );
  }

  async getReportChannel(guildId: string): Promise<string | null> {
    try {
      const stmt = await this.db.prepare(
        "SELECT channel_id FROM report_channel WHERE guild_id = ?",
      );
      const ret = await stmt.get(guildId);
      if (!ret) return null;

      return ret["channel_id"] as string;
    } catch (e) {
      console.error("ERR: getReportChannel", e);
      return null;
    }
  }

  async setReportChannel(guildId: string, channelId: string): Promise<boolean> {
    try {
      const stmt = await this.db.prepare(
        "REPLACE INTO report_channel (guild_id, channel_id) VALUES (?, ?)",
      );
      const ret = await stmt.run(guildId, channelId);
      return ret.changes > 0;
    } catch (e) {
      console.error("ERR: setReportChannel", e);
      return false;
    }
  }

  async getReactionEmojis(guildId: string): Promise<string[]> {
    try {
      const stmt = await this.db.prepare(
        "SELECT emojis FROM reaction_emojis WHERE guild_id = ?",
      );
      const ret = await stmt.get(guildId);
      if (!ret) return [];

      return (ret["emojis"] as string).split(",");
    } catch (e) {
      console.error("ERR: getReactionEmojis", e);
      return [];
    }
  }

  async setReactionEmojis(guildId: string, emojis: string[]): Promise<boolean> {
    try {
      const stmt = await this.db.prepare(
        "REPLACE INTO reaction_emojis (guild_id, emojis) VALUES (?, ?)",
      );
      const ret = await stmt.run(
        guildId,
        emojis.map((x) => x.trim()).join(","),
      );
      return ret.changes > 0;
    } catch (e) {
      console.error("ERR: setReactionEmojis", e);
      return false;
    }
  }
  async getIgnoreChannels(guildId: string): Promise<string[]> {
    try {
      const stmt = await this.db.prepare(
        "SELECT channel_ids FROM ignore_channels WHERE guild_id = ?",
      );
      const ret = await stmt.get(guildId);
      if (!ret) return [];

      return (ret["channel_ids"] as string).split(",");
    } catch (e) {
      console.error("ERR: getIgnoreChannels", e);
      return [];
    }
  }

  async setIgnoreChannels(
    guildId: string,
    channelIds: string[],
  ): Promise<boolean> {
    try {
      const stmt = await this.db.prepare(
        "REPLACE INTO ignore_channels (guild_id, channel_ids) VALUES (?, ?)",
      );
      const ret = await stmt.run(
        guildId,
        channelIds.map((x) => x.trim()).join(","),
      );
      return ret.changes > 0;
    } catch (e) {
      console.error("ERR: setIgnoreChannels", e);
      return false;
    }
  }
}

export const db = new DatabaseClient();
