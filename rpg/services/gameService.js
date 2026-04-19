class GameService {
    /**
     * Processa um turno de combate RPG.
     * @param {Object} attacker Stats do atacante
     * @param {Object} defender Stats do defensor
     * @param {String} action Tipo de ação ('ATTACK', 'SKILL', 'DEFEND')
     */
    processTurn(attacker, defender, action) {
        let damage = 0;
        let energyCost = 0;
        let message = '';

        // Lógica de Ação
        switch (action) {
            case 'ATTACK':
                // Dano base = ATK do atacante - (DEF do defensor / 2)
                damage = Math.max(5, attacker.attack - Math.floor(defender.defense / 2));
                message = `${attacker.name} usou um ataque básico e causou ${damage} de dano!`;
                break;

            case 'SKILL':
                energyCost = 20;
                if (attacker.energy >= energyCost) {
                    damage = Math.floor(attacker.attack * 1.8) - Math.floor(defender.defense / 3);
                    attacker.energy -= energyCost;
                    message = `${attacker.name} usou uma habilidade especial e causou ${damage} de dano massivo!`;
                } else {
                    damage = 0;
                    message = `${attacker.name} tentou usar uma habilidade, mas não tinha energia suficiente!`;
                }
                break;

            case 'DEFEND':
                damage = 0;
                attacker.isDefending = true;
                message = `${attacker.name} entrou em posição de defesa!`;
                break;
        }

        // Aplicação de dano (se o defensor estiver defendendo, dano reduzido em 50%)
        if (defender.isDefending && damage > 0) {
            damage = Math.floor(damage * 0.5);
            message += ` (Dano reduzido pela defesa de ${defender.name})`;
            defender.isDefending = false; // Reseta estado de defesa após receber golpe
        }

        defender.hp = Math.max(0, defender.hp - damage);

        return {
            damage,
            energyConsumed: energyCost,
            message,
            targetDead: defender.hp <= 0
        };
    }

    /**
     * Gera uma ação para a CPU (AI Simples)
     */
    generateCPUMove(cpuStats) {
        if (cpuStats.energy >= 20 && Math.random() > 0.6) return 'SKILL';
        if (cpuStats.hp < 30 && Math.random() > 0.5) return 'DEFEND';
        return 'ATTACK';
    }
}

module.exports = new GameService();