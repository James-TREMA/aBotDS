import 'dotenv/config';
import { ChannelType, EmbedBuilder, Client, Message, Guild, TextChannel, PermissionFlagsBits } from 'discord.js';

async function sendStaffNotification(channel: TextChannel): Promise<void> {
    const staffRoleId = process.env.STAFF_ROLE_ID;
    if (!staffRoleId) {
        console.error('L\'ID du rôle staff n\'est pas configuré');
        return;
    }
    await channel.send(`<@&${staffRoleId}>`);
}

async function sendTicketEmbed(message: Message, channel: TextChannel): Promise<void> {
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Nouveau Ticket')
        .setDescription(`${message.content}\n\nUn staff vous répondra sous peu.`)
        .setTimestamp();

    await channel.send({ embeds: [embed] });
}

export async function handleTickets(message: Message, client: Client): Promise<void> {
    if (message.channel.type === ChannelType.DM && !message.author.bot) {
        const guild = client.guilds.cache.first();
        if (!guild) return;

        const ticketChannel = await createTicketChannel(message, guild);
        if (ticketChannel) {
            await sendTicketMessage(message, ticketChannel);
        }
    }
}

async function createTicketChannel(message: Message, guild: Guild): Promise<TextChannel | null> {
    const username = message.author.username.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const existingChannel = guild.channels.cache.find(channel => 
        channel.name === `ticket-${username}` && 
        channel.parentId === process.env.TICKET_CATEGORY_ID
    );

    if (existingChannel && existingChannel instanceof TextChannel) return existingChannel;

    try {
        const channel = await guild.channels.create({
            name: `ticket-${username}`,
            type: ChannelType.GuildText,
            parent: process.env.TICKET_CATEGORY_ID,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: message.author.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                },
                {
                    id: process.env.STAFF_ROLE_ID || '',
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                },
            ],
        });

        return channel;
    } catch (error) {
        console.error('Erreur lors de la création du canal:', error);
        return null;
    }
}

async function sendTicketMessage(message: Message, channel: TextChannel): Promise<void> {
    try {
        await sendStaffNotification(channel);
        await sendTicketEmbed(message, channel);
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
    }
}