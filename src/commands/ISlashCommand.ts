import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";

export interface ISlashCommand {
  /**
   * コマンド定義
   */
  register(): SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;

  /**
   * コマンド実行
   */
  exec(interaction: ChatInputCommandInteraction): Promise<void>;
}
