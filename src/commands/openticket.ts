import 'dotenv/config';
import { 
    SlashCommandBuilder, 
    ChannelType, 
    EmbedBuilder, 
    PermissionFlagsBits, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ButtonInteraction, 
    ChatInputCommandInteraction,
    TextChannel 
} from 'discord.js';
import { Command } from '../types/command';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('openticket')
        .setDescription('Afficher le panneau de création de ticket')
        .setDMPermission(false),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Système de Ticket')
            .setDescription('Pour créer un ticket, cliquez sur le bouton ci-dessous.\nUn nouveau canal sera créé pour votre demande.')
            .setTimestamp();

        const button = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel('Ouvrir un ticket')
                    .setStyle(ButtonStyle.Success)
            );

        await interaction.reply({ embeds: [embed], components: [button] });
    },

    async handleButton(interaction: ButtonInteraction): Promise<void> {
        if (interaction.customId !== 'create_ticket') return;
        
        await interaction.deferReply({ flags: ['Ephemeral'] });
        
        const guild = interaction.guild;
        if (!guild) {
            await interaction.editReply({ 
                content: 'Cette commande ne peut être utilisée que dans un serveur.',
            });
            return;
        }

        if (!process.env.TICKET_CATEGORY_ID || !process.env.STAFF_ROLE_ID) {
            await interaction.editReply({
                content: 'La configuration du bot est incomplète.',
            });
            return;
        }

        const username = interaction.user.username.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        
        // Vérifier tous les tickets existants de l'utilisateur
        const existingTickets = guild.channels.cache.filter(channel =>
            channel instanceof TextChannel && 
            channel.parentId === process.env.TICKET_CATEGORY_ID &&
            channel.permissionOverwrites.cache.has(interaction.user.id)
        ).size;

        if (existingTickets > 0) {
            await interaction.editReply({ 
                content: 'Vous avez déjà un ticket ouvert!',
            });
            return;
        }

        try {
            const ticketChannel = await guild.channels.create({
                name: `ticket-${username}`,
                type: ChannelType.GuildText,
                parent: process.env.TICKET_CATEGORY_ID,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                    },
                    {
                        id: process.env.STAFF_ROLE_ID || '',
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                    },
                ],
            });

            if (!ticketChannel || !(ticketChannel instanceof TextChannel)) {
                await interaction.editReply({
                    content: 'Une erreur est survenue lors de la création du ticket.',
                });
                return;
            }

            const ticketEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Nouveau Ticket')
                .setDescription(`Ticket créé par ${interaction.user}\n\nUn staff vous répondra sous peu.`)
                .setTimestamp();

            await ticketChannel.send(`<@&${process.env.STAFF_ROLE_ID}>`);
            await ticketChannel.send({ embeds: [ticketEmbed] });
            await interaction.editReply({ 
                content: `Votre ticket a été créé: ${ticketChannel}`,
            });
        } catch (error) {
            console.error('Erreur lors de la création du ticket:', error);
            await interaction.editReply({ 
                content: 'Une erreur est survenue lors de la création du ticket.',
            });
        }
    }
};

export default command;