import 'dotenv/config';
import { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ChatInputCommandInteraction, 
    TextChannel
} from 'discord.js';
import { Command } from '../types/command';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('avis')
        .setDescription('Donner un avis sur un membre du staff')
        .addUserOption(option => 
            option.setName('staff')
                .setDescription('Le membre du staff')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('note')
                .setDescription('Note sur 5')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(5))
        .addStringOption(option =>
            option.setName('commentaire')
                .setDescription('Votre commentaire')
                .setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const staff = interaction.options.getUser('staff');
        const note = interaction.options.getInteger('note');
        const commentaire = interaction.options.getString('commentaire');

        if (!staff || !note || !commentaire) {
            await interaction.reply({ 
                content: 'Tous les paramètres sont requis.',
                flags: ['Ephemeral']
            });
            return;
        }

        const stars = '⭐'.repeat(note);

        if (!process.env.AVIS_CHANNEL_ID) {
            await interaction.reply({
                content: 'L\'ID du canal des avis n\'est pas configuré.',
                flags: ['Ephemeral']
            });
            return;
        }

        const avisChannel = interaction.client.channels.cache.get(process.env.AVIS_CHANNEL_ID) as TextChannel;
        if (!avisChannel || !(avisChannel instanceof TextChannel)) {
            await interaction.reply({ 
                content: 'Le salon des avis n\'a pas été trouvé.',
                flags: ['Ephemeral']
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Nouvel Avis')
            .addFields(
                { name: 'Nom du staff', value: staff.toString() },
                { name: 'Note sur 5', value: stars },
                { name: 'Commentaire', value: commentaire }
            )
            .setFooter({ text: `Avis par ${interaction.user.tag}` })
            .setTimestamp();

        try {
            await avisChannel.send({ embeds: [embed] });
            await interaction.reply({ 
                content: 'Votre avis a été envoyé avec succès!',
                flags: ['Ephemeral']
            });
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'avis:', error);
            await interaction.reply({ 
                content: 'Une erreur est survenue lors de l\'envoi de votre avis.',
                flags: ['Ephemeral']
            });
        }
    },
} as Command;

export default command;
