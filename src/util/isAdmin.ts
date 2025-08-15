import {
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";

export function isAdmin(interaction: ChatInputCommandInteraction): boolean {
  const member = interaction.member;

  if (!member || typeof member.permissions === "string")
    // 権限なさげ
    return false;

  return member.permissions.has(PermissionFlagsBits.Administrator);
}
