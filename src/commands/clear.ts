import 'dotenv/config';
import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { Command } from '../types/command';

const command = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Supprimer les messages du salon')
        .addIntegerOption(option =>
            option.setName('nombre')
                .setDescription('Nombre de messages à supprimer (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction: ChatInputCommandInteraction) {
        try {
            if (!interaction.channel || !(interaction.channel instanceof TextChannel)) {
                await interaction.reply({ 
                    content: 'Cette commande ne peut être utilisée que dans un salon textuel.',
                    flags: ['Ephemeral']
                });
                return;
            }

            const amount = interaction.options.getInteger('nombre', true);
            const messages = await interaction.channel.messages.fetch({ 
                limit: amount,
                before: interaction.id 
            });

            if (messages.size === 0) {
                await interaction.reply({ content: 'Aucun message à supprimer.', flags: ['Ephemeral'] });
                return;
            }

            await interaction.channel.bulkDelete(messages, true);

            const logChannelId = process.env.LOG_CHANNEL_ID;
            if (!logChannelId) {
                await interaction.reply({
                    content: 'L\'ID du canal de logs n\'est pas configuré.',
                    flags: ['Ephemeral']
                });
                return;
            }

            const logChannel = interaction.client.channels.cache.get(logChannelId);
            if (logChannel && logChannel instanceof TextChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('Commande /clear exécutée')
                    .setDescription(`${messages.size} messages ont été supprimés dans le salon ${interaction.channel.name}`)
                    .addFields({ name: 'Utilisateur', value: interaction.user.tag })
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed] });
                
                await interaction.reply({ 
                    content: `${messages.size} message${messages.size > 1 ? 's' : ''} ${messages.size > 1 ? 'ont' : 'a'} été supprimé${messages.size > 1 ? 's' : ''} avec succès!`,
                    flags: ['Ephemeral']
                });
                return;
            }

            await interaction.reply({ 
                content: `${messages.size} message${messages.size > 1 ? 's' : ''} ${messages.size > 1 ? 'ont' : 'a'} été supprimé${messages.size > 1 ? 's' : ''}!`,
                flags: ['Ephemeral']
            });
            return;
        } catch (error) {
            console.error('Erreur lors de la suppression des messages:', error);
            await interaction.reply({ 
                content: 'Une erreur est survenue lors de la suppression des messages. Les messages de plus de 14 jours ne peuvent pas être supprimés.',
                flags: ['Ephemeral']
            });
            return;
        }
    },
} as Command;

export default command;
