import 'dotenv/config';
import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { Command } from '../types/command';

const command = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Fermer le ticket actuel'),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!interaction.channel || !(interaction.channel instanceof TextChannel)) {
            await interaction.reply({ 
                content: 'Cette commande ne peut être utilisée que dans un salon textuel.',
                ephemeral: true 
            });
            return;
        }

        if (!interaction.channel.name.startsWith('ticket-')) {
            await interaction.reply({ 
                content: 'Cette commande ne peut être utilisée que dans un canal de ticket.',
                ephemeral: true 
            });
            return;
        }

        try {
            if (!process.env.LOG_CHANNEL_ID) {
                await interaction.reply({
                    content: 'L\'ID du canal de logs n\'est pas configuré.',
                    ephemeral: true
                });
                return;
            }

            const logChannel = interaction.client.channels.cache.get(process.env.LOG_CHANNEL_ID) as TextChannel;
            if (logChannel && logChannel instanceof TextChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('Commande /close exécutée')
                    .setDescription(`Le canal #${interaction.channel.name} a été supprimé`)
                    .addFields({ name: 'Utilisateur', value: interaction.user.tag })
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed] });
            }

            await interaction.reply({ 
                content: 'Fermeture du ticket...', 
                flags: ['Ephemeral']
            });
            await interaction.channel.delete();
        } catch (error) {
            console.error('Erreur lors de la suppression du canal:', error);
            await interaction.reply({ 
                content: 'Une erreur est survenue lors de la suppression du canal.',
                flags: ['Ephemeral']
            });
        }
    }
} as Command;

export default command;