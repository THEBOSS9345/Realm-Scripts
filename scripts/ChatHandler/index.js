import { Player, World, world } from '@minecraft/server';


export class ChatCommand {
    constructor() {
        this.commandDatabase = [];
        this.commandPrefix = '.';
        world.beforeEvents.chatSend.subscribe(this.handleChatCommand.bind(this));
    }

    /**
     * Create a new chat command.
     * 
     * @param {string} command - The command string (e.g., "help").
     * @param {string} description - Description of the command.
     * @param {string[]} alias - An array of alias strings for the command.
     * @param {string[]} permissions - An array of required permissions.
     * @param {(player: Player, args: string, commandString: string) => void} callback - The callback function to execute when the command is used.
     */
    create(command, description, alias, permissions, callback) {
        this.commandDatabase.push({ command, description, alias, permissions, callback });
    }

    /**
     * Handle incoming chat commands.
     * 
     * @param {object} data - The chat data object.
     * @param {string} data.message - The chat message.
     * @param {Player} data.sender - The player who sent the message.
     */
    handleChatCommand(data) {
        const { message, sender: player } = data;
        if (!message.startsWith(this.commandPrefix)) return;
        data.cancel = true;
        const commandString = message.slice(this.commandPrefix.length).trim();
        const matchedCommand = this.commandDatabase.find(({ command, alias }) => {
            const cmdRegex = new RegExp(`^${command}(\\s|$)`, 'i');
            return cmdRegex.test(commandString) || (alias && alias.some(a => new RegExp(`^${a}(\\s|$)`, 'i').test(commandString)));
        });
        if (matchedCommand && (!matchedCommand.permissions || this.hasPermission(matchedCommand.permissions, player))) {
            const args = commandString.slice(matchedCommand.command.length).trim();
            matchedCommand.callback(player, args, commandString);
        } else player.sendMessage(`§cUnknown command: ${commandString}, Please check that the command exists and that you have permission to use it.`);
    }
    /**
     * Check if a player has the required permissions.
     * 
     * @param {string[]} tags - An array of permission tags.
     * @param {Player} player - The player to check.
     * @returns {boolean} - True if the player has all required permissions, otherwise false.
     */
    hasPermission(tags, player) {
        return tags.every((permission) => player.hasTag(permission));
    }
}


const newCommand = new ChatCommand();

newCommand.create('ping', '', [], [], (player) => {
    player.sendMessage('Server Ping')
});

newCommand.create('Help', 'Help Command What Show All Commands', ['h', 'help'], [], (player) => {
    const helpMessage = newCommand.commandDatabase
        .filter(command => !command.permissions || newCommand.hasPermission(command.permissions, player))
        .map(command => {
            const alias = command.alias ? command.alias.join(', ') : 'No Alias';
            const description = command.description ? command.description : 'No description';
            return `§7${command.command} - [${alias}] ${description}`;
        }).join('\n');
    player.sendMessage(`§f§aAvailable Commands\n§f-------------------------\n${helpMessage}\n`);
})
