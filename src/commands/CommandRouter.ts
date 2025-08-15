import { ChatInputCommandInteraction, Client, REST, Routes } from "discord.js";
import { ISlashCommand } from "./ISlashCommand";

type CommandName = string;

export class CommandRouter {
  protected commands: Map<CommandName, ISlashCommand> = new Map();

  protected client: Client;
  protected token: string;
  protected clientId: string;

  constructor(client: Client, token: string, clientId: string) {
    this.client = client;
    this.token = token;
    this.clientId = clientId;
  }

  registerCommands(commands: ISlashCommand[]) {
    for (const command of commands) {
      const builder = command.register();
      this.commands.set(builder.name, command);
    }
  }

  async deploy(guildId?: string) {
    const rest = new REST({ version: "10" }).setToken(this.token);
    const body = Array.from(this.commands.values()).map((c) =>
      c.register().toJSON(),
    );

    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(this.clientId, guildId), {
        body,
      });
      console.log(`Guild コマンドをデプロイ完了: ${guildId}`);
    } else {
      await rest.put(Routes.applicationCommands(this.clientId), { body });
      console.log("グローバル コマンドをデプロイ完了");
    }
  }

  async handleInteraction(interaction: ChatInputCommandInteraction) {
    const command = this.commands.get(interaction.commandName);
    if (command) await command.exec(interaction);
    else console.log(`INF: 不明なコマンド: ${interaction.commandName}`);
  }
}
