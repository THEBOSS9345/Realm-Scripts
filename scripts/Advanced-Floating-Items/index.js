import { world } from '@minecraft/server';
world.afterEvents.entitySpawn.subscribe(({ entity }) => {
    if (entity.typeId != "minecraft:item") return;
    const ItemStack = entity.getComponent("item").itemStack;
    entity.nameTag = `§6${ItemStack.amount}x§r ${ItemStack.typeId.replace('minecraft:', '').toUpperCase()}`;
})
