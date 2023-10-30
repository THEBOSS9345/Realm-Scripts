import { world } from '@minecraft/server';
const commands = []
let CommandInitialized = false;
Object.defineProperty(globalThis, 'ChatCommand', {
    get: function () {
        const prefix = '.';
        const hasPermission = (player, tags) => tags.some(permission => player.hasTag(permission));
        return {
            create(command, description, alias = [], permissions = [], callback) {
                if (typeof description !== 'string' || typeof command !== 'string') return console.error(`${typeof command === "string" ? 'description' : 'name'} is not a string at create`);
                commands.push({ command, description, alias, permissions, callback });
                ChatCommand.handleChatCommand
            },
            get handleChatCommand() {
                if (CommandInitialized) return;
                CommandInitialized = true;
                world.beforeEvents.chatSend.subscribe((data) => {
                    const { message, sender: player } = data;
                    if (!message.startsWith(prefix)) return;
                    data.cancel = true;
                    const commandString = message.slice(prefix.length).trim();
                    const matchedCommand = commands.find(({ command, alias }) => {
                        const cmdRegex = new RegExp(`^${command}(\\s|$)`, 'i');
                        return cmdRegex.test(commandString) || (alias && alias.some(a => new RegExp(`^${a}(\\s|$)`, 'i').test(commandString)));
                    });
                    if (matchedCommand && (matchedCommand.permissions.length === 0 || hasPermission(matchedCommand.permissions, player))) {
                        const args = commandString.slice(matchedCommand.command.length).trim();
                        matchedCommand.callback(player, args, commandString);
                    } else player.sendMessage(`§cUnknown command: ${commandString}, Please check that the command exists and that you have permission to use it.`);
                });
            }
        };
    }
});
ChatCommand.create('Help', 'Help Command: Shows all available commands', ['h', 'help'], [], (player) => {
    const helpMessage = commands
        .filter(command => command.permissions.length === 0 || hasPermission(player, command.permissions))
        .map(command => {
            const alias = command.alias.length > 0 ? `[${command.alias.join(', ')}] ` : '';
            const description = command.description ? command.description : '';
            return `§7${command.command} - ${alias}${description}`;
        })
        .join('\n');
    player.sendMessage(`§f§aAvailable Commands\n§f-------------------------\n${helpMessage}\n`);
});

export default globalThis.ChatCommand
