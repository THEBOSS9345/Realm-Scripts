import { world, system, EntityHealthComponent } from "@minecraft/server";
const Entity_Health_Database = new Map();
system.runInterval(() => {
  world.getDimension('overworld').getEntities().forEach(entity => {
    const typeId = entity.typeId;
    const health =  Math.ceil(entity.getComponent('health')?.value);
    if (!Entity_Health_Database.has(typeId)) {
      Entity_Health_Database.set(typeId, health);
    }
    entity.nameTag = `${typeId.replace('minecraft:', '').toLocaleUpperCase()}\n${Math.ceil(entity.getComponent('health')?.current)}/${Entity_Health_Database.get(typeId)}`;
  });
});