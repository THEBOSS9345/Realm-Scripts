import { world, system } from "@minecraft/server";
import { database } from "./Codes";

export const codeUsageMap = new Map();

world.beforeEvents.chatSend.subscribe((data) => {
    const { message, sender: player } = data;
    if (!message.startsWith('.')) return;
    data.cancel = true;
    const [commandName, ...args] = message.slice(1).trim().split(' ');
    const command = database.find(({ code }) => commandName === code);
    const hasPermission = (tags) => tags.some(permission => player.hasTag(permission));
    if (command && (!command.permissions || hasPermission(command.permissions))) {
        const playerUsageCount = codeUsageMap.get(commandName) || 0;
        if (playerUsageCount < command.maxUsesPerPlayer || !command.maxUsesPerPlayer) {
            codeUsageMap.set(commandName, playerUsageCount + 1);
            command.callback(player, args.join(' '));
        } else {
            player.sendMessage(`You have already used this code ${command.maxUsesPerPlayer} times.`);
        }
        return;
    }
    player.sendMessage('Unknown command or insufficient permissions.');
});

    