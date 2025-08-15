import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { db } from "../database/DatabaseClient";
import { isAdmin } from "../util/isAdmin";
import type { ISlashCommand } from "./ISlashCommand";

export class GetConfigCommand implements ISlashCommand {
  register() {
    return new SlashCommandBuilder()
      .setName("get-config")
      .setDescription("設定確認");
  }

  async exec(interaction: ChatInputCommandInteraction) {
    if (!isAdmin(interaction)) {
      await interaction.reply({
        content: "エラー: コマンドを実行する権限がないです。",
        ephemeral: true,
      });
      return;
    }
    if (interaction.guildId === null) {
      await interaction.reply({
        content: "エラー: サーバーで実行してください。",
        ephemeral: true,
      });
      return;
    }

    const reportChannelId = await db.getReportChannel(interaction.guildId);
    const ignoreChannelIds = await db.getIgnoreChannels(interaction.guildId);
    const text =
      `報告チャンネル: ${!reportChannelId ? "(未設定)" : `https://discord.com/channels/${interaction.guildId}/${reportChannelId}`}\n` +
      `監視対象絵文字: ${await db.getReactionEmojis(interaction.guildId)}\n` +
      `監視対象外チャンネル: ${ignoreChannelIds.join(",")}\n` +
      `${ignoreChannelIds.map((x) => `https://discord.com/channels/${interaction.guildId}/${x}`).join(" ")}`;
    await interaction.reply(text);
  }
}
