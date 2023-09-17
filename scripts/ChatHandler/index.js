import { Player, World, world } from '@minecraft/server';

export class ChatCommand {
  static instance = null;
  static commandDatabase = [];

  constructor() {
    if (!ChatCommand.instance) {
      console.warn(JSON.stringify(ChatCommand.commandDatabase));
      this.commandPrefix = '.';
      world.beforeEvents.chatSend.subscribe(this.handleChatCommand.bind(this));
      ChatCommand.instance = this;
    }

    return ChatCommand.instance;
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
    ChatCommand.commandDatabase.push({ command, description, alias, permissions, callback });
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
    const matchedCommand = ChatCommand.commandDatabase.find(({ command, alias }) => {
      const cmdRegex = new RegExp(`^${command}(\\s|$)`, 'i');
      return cmdRegex.test(commandString) || (alias && alias.some(a => new RegExp(`^${a}(\\s|$)`, 'i').test(commandString)));
    });
    if (matchedCommand && (matchedCommand.permissions.length === 0 || this.hasPermission(matchedCommand.permissions, player))) {
      const args = commandString.slice(matchedCommand.command.length).trim();
      matchedCommand.callback(player, args, commandString);
    } else player.sendMessage(`§cUnknown command: ${commandString}, Please check that the command exists and that you have permission to use it.`);
  }

  /**
   * Check if a player has at least one of the required permissions.
   * 
   * @param {string[]} tags - An array of permission tags.
   * @param {Player} player - The player to check.
   * @returns {boolean} - True if the player has at least one required permission, otherwise false.
   */
  hasPermission(tags, player) {
    return tags.some(permission => player.hasTag(permission));
  }
}
ChatCommand.commandDatabase = [];

const newCommand = new ChatCommand();

newCommand.create('ping', '', [], [], (player) => {
    player.sendMessage('Server Ping')
});
newCommand.create('Help', 'Help Command What Show All Commands', ['h', 'help'], [], (player) => {
  const helpMessage = newCommand.commandDatabase
    .filter(command => command.permissions.length === 0 || newCommand.hasPermission(command.permissions, player))
    .map(command => {
      const alias = command.alias ? `[${command.alias.join(', ')}] ` : '';
      const description = command.description ? command.description : 'No description';
      return `§7${command.command} - ${alias}${description}`;
    }).join('\n');
  player.sendMessage(`§f§aAvailable Commands\n§f-------------------------\n${helpMessage}\n`);
});
