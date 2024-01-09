import { world, system } from "@minecraft/server";
export const CombatDatabase = {};

world.afterEvents.entityHurt.subscribe((event) => {
    if (event.damageSource.cause !== "entityAttack") return;
    CombatDatabase[event.hurtEntity.id] = { timer: setTimer(20, 'seconds') };
    event.hurtEntity.addTag('incombat');
}, { entityTypes: ["minecraft:player"] })

system.runInterval(() => {
    world.getPlayers({ tag: 'incombat' }).map((player) => {
        if (!CombatDatabase[player.id]) return delete CombatDatabase[player.id], player.removeTag('incombat')
        if (!CombatDatabase[player.id] || CombatDatabase[player.id].hasOwnProperty('clear')) return;
        if (hasTimerReachedEnd(CombatDatabase[player.id].timer.targetDate)) {
            delete CombatDatabase[player.id]
            player.sendMessage('§aYou Are Now Out Of Combat')
            player.removeTag('incombat')
            return
        }
        const playerinv = player.getComponent('inventory').container
        CombatDatabase[player.id] = { timer: CombatDatabase[player.id].timer, location: player.location, dimension: player.dimension.id, items: [...Array.from({ length: playerinv.size }).map((_, i) => playerinv.getItem(i)).filter(v => v !== undefined), ...["Head", "Chest", "Legs", "Feet"].map(v => player.getComponent("minecraft:equippable").getEquipment(v)).filter(v => v !== undefined)] }
    })
})

world.afterEvents.playerLeave.subscribe(({ playerId, playerName }) => {
    if (!CombatDatabase[playerId] || CombatDatabase[playerId]?.clear) return;
    CombatDatabase[playerId]?.items.map((value) => world.getDimension(CombatDatabase[playerId].dimension).spawnItem(value, CombatDatabase[playerId].location))
    CombatDatabase[playerId] = { clear: true }
    console.warn(`[Combat Logging] ${playerName} Combat Logged!`)
})

world.afterEvents.playerSpawn.subscribe((event) => {
    if (!event.initialSpawn) return
    if (!CombatDatabase[event.player.id]?.clear) return;
    delete CombatDatabase[event.player.id]
    event.player.runCommandAsync('clear @s')
    event.player.sendMessage('§cYour inventory Was Cleared For Combat logging!');
})

world.afterEvents.entityDie.subscribe(({ damageSource, deadEntity }) => {
    if (!CombatDatabase[deadEntity.id]) return;
    delete CombatDatabase[deadEntity.id]
    deadEntity.sendMessage('§aCombat Ended')
}, { entityTypes: ["minecraft:player"] })

export const setTimer = (value, unit) => {
    const targetDate = new Date();
    switch (unit) {
        case 'hours':
            targetDate.setHours(targetDate.getHours() + value);
            break;
        case 'days':
            targetDate.setDate(targetDate.getDate() + value);
            break;
        case 'minutes':
            targetDate.setMinutes(targetDate.getMinutes() + value);
            break;
        case 'seconds':
            targetDate.setSeconds(targetDate.getSeconds() + value);
            break;
    }
    return { value, unit, targetDate };
};

export function hasTimerReachedEnd(targetDate) {
    if (!(targetDate instanceof Date)) targetDate = new Date(targetDate);
    return Date.now() >= targetDate;
}
