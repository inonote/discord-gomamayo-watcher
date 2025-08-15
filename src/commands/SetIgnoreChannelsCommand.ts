import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "./ISlashCommand";
import { isAdmin } from "../util/isAdmin";
import { db } from "../database/DatabaseClient";

export class SetIgnoreChannelsCommand implements ISlashCommand {
  register() {
    return new SlashCommandBuilder()
      .setName("set-ignore-channels")
      .setDescription("無視するチャンネルを設定")
      .addStringOption((option) =>
        option
          .setName("channels")
          .setDescription("チャンネル ID (カンマ区切り)")
          .setRequired(true),
      );
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

    const channels = interaction.options.getString("channels") || "";

    if (await db.setIgnoreChannels(interaction.guildId, channels.split(",")))
      await interaction.reply(`設定しました。`);
    else await interaction.reply(`エラー: 設定に失敗しました。`);
  }
}
