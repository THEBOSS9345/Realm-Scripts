import { world, system, Vector } from '@minecraft/server';

const spawn = new SpawnPro();
spawn.setSpawn(1, -60, 1, 99);
class SpawnPro {
    setSpawn(x, y, z, radius) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.radius = radius || 0;
    }
}

world.beforeEvents.itemUseOn.subscribe((data) => {
    if (radiusCheck(data.source, spawn?.x, spawn?.y, spawn?.z, spawn?.radius)) {
       data.cancel = true;
    }
});

world.afterEvents.blockBreak.subscribe(async ({ player, block, brokenBlockPermutation }) => {
    if (radiusCheck(player, spawn?.x, spawn?.y, spawn?.z, spawn?.radius)) {
        block.setPermutation(brokenBlockPermutation);
        await wait(1);
        const items = player.dimension.getEntities({
            type: 'minecraft:item',
            location: new Vector(block.location.x, block.location.y, block.location.z),
        });
        await kill(items);
    }
});


async function kill(items) {
    for (const item of items) item.kill();
}

async function wait(ticks) {
    return new Promise((resolve) => {
        system.runTimeout(resolve, ticks);
    });
}
function radiusCheck(player, x, y, z, radius) {
    const playerLocation = player.location;
    const playerX = playerLocation.x;
    const playerY = playerLocation.y;
    const playerZ = playerLocation.z;
    const distanceSquared = (playerX - x) ** 2 + (playerY - y) ** 2 + (playerZ - z) ** 2;
    const radiusSquared = radius ** 2;
    return distanceSquared <= radiusSquared;
}