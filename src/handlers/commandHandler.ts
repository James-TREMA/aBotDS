import 'dotenv/config';
import { 
    Message, 
    Client, 
    EmbedBuilder, 
    PermissionsBitField, 
    TextChannel,
    GuildMember
} from 'discord.js';

export async function handleCommands(message: Message, client: Client): Promise<void> {
    if (message.content.startsWith('!avis')) {
        await handleAvis(message, client);
    } else if (message.content === '!clear') {
        await handleClear(message, client);
    } else if (message.content === '!close') {
        await handleClose(message, client);
    }
}

async function handleAvis(message: Message, client: Client): Promise<void> {
    const args = message.content.split(' ').slice(1);
    if (args.length < 3) {
        await message.reply('Usage: !avis @staff_mention note(1-5) commentaire');
        return;
    }

    if (isNaN(parseInt(args[1])) || parseInt(args[1]) < 1 || parseInt(args[1]) > 5) {
        await message.reply('Usage: !avis @staff_mention note commentaire');
        return;
    }

    const [staffMention, note, ...commentaire] = args;
    const avisChannelId = process.env.AVIS_CHANNEL_ID;
    if (!avisChannelId) {
        await message.reply('L\'ID du canal des avis n\'est pas configuré.');
        return;
    }

    const avisChannel = client.channels.cache.get(avisChannelId);
    const avisChannelTyped = avisChannel as TextChannel;
    if (!avisChannelTyped || !(avisChannelTyped instanceof TextChannel)) {
        await message.reply('Le salon des avis n\'a pas été trouvé.');
        return;
    }

    const stars = '⭐'.repeat(Math.min(Math.max(parseInt(note), 1), 5));
    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Nouvel Avis')
        .addFields(
            { name: 'Nom du staff', value: staffMention },
            { name: 'Note sur 5', value: stars },
            { name: 'Commentaire', value: commentaire.join(' ') }
        )
        .setFooter({ text: `Avis par ${message.author.tag}` })
        .setTimestamp();

    try {
        await avisChannelTyped.send({ embeds: [embed] });
        await message.delete();
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'avis:', error);
        await message.reply('Une erreur est survenue lors de l\'envoi de votre avis.');
    }
}

async function handleClear(message: Message, client: Client): Promise<void> {
    if (!message.member) {
        await message.reply('Cette commande ne peut être utilisée que dans un serveur.');
        return;
    }

    const member = message.member as GuildMember;
    if (!member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        await message.reply('Vous n\'avez pas la permission de gérer les messages.');
        return;
    }

    try {
        if (!message.channel || !(message.channel instanceof TextChannel)) {
            await message.reply('Impossible de récupérer les messages.');
            return;
        }

        const fetchedMessages = await message.channel.messages.fetch({ limit: 100 });
        const deletableMessages = fetchedMessages.filter(msg => {
            const messageAge = Date.now() - msg.createdTimestamp;
            return messageAge < 1209600000; // 14 jours en millisecondes
        });

        if (deletableMessages.size > 0) {
            await (message.channel as TextChannel).bulkDelete(deletableMessages);
        }

        const logChannelId = process.env.LOG_CHANNEL_ID;
        if (!logChannelId) {
            await message.reply('L\'ID du canal de logs n\'est pas configuré.');
            return;
        }

        const logChannel = client.channels.cache.get(logChannelId);
        if (logChannel instanceof TextChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Commande !clear exécutée')
                .setDescription(`Tous les messages ont été supprimés dans le salon ${message.channel.name}`)
                .addFields({ name: 'Utilisateur', value: message.author.tag, inline: true }, { name: 'Messages supprimés', value: deletableMessages.size.toString(), inline: true })
                .setTimestamp();

            await logChannel.send({ embeds: [logEmbed] });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression des messages:', error);
        await message.reply('Une erreur est survenue lors de la suppression des messages.');
    }
}

async function handleClose(message: Message, client: Client): Promise<void> {
    if (!message.channel || !(message.channel instanceof TextChannel)) {
        await message.reply('Cette commande ne peut être utilisée que dans un salon textuel.');
        return;
    }

    if (!message.channel.name.startsWith('ticket-')) {
        await message.reply('Cette commande ne peut être utilisée que dans un canal de ticket.');
        return;
    }

    const logChannelId = process.env.LOG_CHANNEL_ID;
    if (!logChannelId) {
        await message.reply('L\'ID du canal de logs n\'est pas configuré.');
        return;
    }

    try {
        const logChannel = client.channels.cache.get(logChannelId);
        if (logChannel instanceof TextChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Commande !close exécutée')
                .setDescription(`Le canal #${message.channel.name} a été supprimé`)
                .addFields({ name: 'Utilisateur', value: message.author.tag })
                .setTimestamp();

            await logChannel.send({ embeds: [logEmbed] });
        }
        await message.channel.delete();
    } catch (error) {
        console.error('Erreur lors de la suppression du canal:', error);
        await message.reply('Une erreur est survenue lors de la suppression du canal.');
    }
}