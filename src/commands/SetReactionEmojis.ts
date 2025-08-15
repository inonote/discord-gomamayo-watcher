import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { ISlashCommand } from "./ISlashCommand";
import { isAdmin } from "../util/isAdmin";
import { db } from "../database/DatabaseClient";

export class SetReactionEmojisCommand implements ISlashCommand {
  register() {
    return new SlashCommandBuilder()
      .setName("set-reaction-emojis")
      .setDescription("ゴママヨとして反応する絵文字を設定")
      .addStringOption((option) =>
        option
          .setName("emojis")
          .setDescription("絵文字 (カンマ区切り)")
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

    const emojis = interaction.options.getString("emojis") || "";

    if (await db.setReactionEmojis(interaction.guildId, emojis.split(",")))
      await interaction.reply(`設定しました。`);
    else await interaction.reply(`エラー: 設定に失敗しました。`);
  }
}
