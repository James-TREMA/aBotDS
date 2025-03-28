import { ChatInputCommandInteraction, SlashCommandBuilder, ButtonInteraction } from 'discord.js';

export interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    handleButton?: (interaction: ButtonInteraction) => Promise<void>;
}