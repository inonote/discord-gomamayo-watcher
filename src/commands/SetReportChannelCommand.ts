import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { db } from "../database/DatabaseClient";
import { isAdmin } from "../util/isAdmin";
import type { ISlashCommand } from "./ISlashCommand";

export class SetReportChannelCommand implements ISlashCommand {
  register() {
    return new SlashCommandBuilder()
      .setName("set-report-channel")
      .setDescription("ゴママヨを報告するチャンネルを設定");
  }

  async exec(interaction: ChatInputCommandInteraction) {
    if (!isAdmin(interaction)) {
      await interaction.reply({
        content: "エラー: コマンドを実行する権限がないです。",
        ephemeral: true,
      });
      return;
    }
    if (interaction.guildId === null || !interaction.channel) {
      await interaction.reply({
        content: "エラー: サーバーのチャンネルで実行してください。",
        ephemeral: true,
      });
      return;
    }

    if (
      !interaction.channel.isTextBased() ||
      !interaction.channel.isSendable()
    ) {
      await interaction.reply({
        content: "エラー: テキスト送信可能なチャンネルを指定してください。",
        ephemeral: true,
      });
      return;
    }

    if (await db.setReportChannel(interaction.guildId, interaction.channelId))
      await interaction.reply(
        `設定しました。\nhttps://discord.com/channels/${interaction.guildId}/${interaction.channelId}`,
      );
    else await interaction.reply(`エラー: 設定に失敗しました。`);
  }
}
