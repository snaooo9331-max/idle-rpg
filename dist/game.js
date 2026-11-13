"use strict";
let stage = 1;
let gold = 0;
let enemyNames = ["スライム", "ゴブリン", "オオカミ", "オーク", "ドラゴン", "オーガ", "エルフ"];
let enemyName = "ゴブリン";
let enemyHp = 25;
let enemyMaxHp = 25;
let attackPower = 3;
let upgradeCost = 10;
let attackInterval = 1000;
let speedUpgradeCost = 50;
let goldMultiplier = 1;
let goldMultiplierUpgradeCost = 25;
function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = String(value);
    }
}
function updateDisplay() {
    setText("stage", stage);
    setText("gold", gold);
    setText("enemy-name", enemyName);
    setText("enemy-hp", enemyHp);
    setText("enemy-max-hp", enemyMaxHp);
    setText("attack-power", attackPower);
    setText("upgrade-cost", upgradeCost);
    setText("attack-speed", (1000 / attackInterval).toFixed(2));
    setText("speed-cost", speedUpgradeCost);
    setText("gold-multiplier", goldMultiplier.toFixed(1));
    setText("gold-cost", goldMultiplierUpgradeCost);
    const hpPercent = Math.max(0, (enemyHp / enemyMaxHp) * 100);
    const hpBarFill = document.getElementById("hp-bar-fill");
    if (hpBarFill) {
        hpBarFill.style.width = hpPercent + "%";
        hpBarFill.classList.toggle("low", hpPercent <= 30);
    }
}
function doAttack() {
    enemyHp = enemyHp - attackPower;
    if (enemyHp <= 0) {
        defeatEnemy();
    }
}
function showDamage(amount) {
    const enemyArea = document.getElementById("enemy");
    if (!enemyArea) {
        return;
    }
    const damageText = document.createElement("span");
    damageText.textContent = "-" + amount;
    damageText.className = "damage";
    damageText.style.left = (40 + Math.random() * 100) + "%";
    enemyArea.appendChild(damageText);
    damageText.addEventListener("animationend", () => {
        damageText.remove();
    });
}
function attack() {
    doAttack();
    showDamage(attackPower);
    updateDisplay();
}
function defeatEnemy() {
    gold = gold + Math.floor(stage * 5 * goldMultiplier);
    stage = stage + 1;
    enemyMaxHp = Math.floor(enemyMaxHp * 1.2);
    enemyHp = enemyMaxHp;
    let index = Math.floor(Math.random() * enemyNames.length);
    enemyName = enemyNames[index];
}
function upgradeGoldMultiplier() {
    if (gold < goldMultiplierUpgradeCost) {
        return;
    }
    gold -= goldMultiplierUpgradeCost;
    goldMultiplier = goldMultiplier + 0.2;
    goldMultiplierUpgradeCost = Math.floor(goldMultiplierUpgradeCost * 2);
    updateDisplay();
}
document.getElementById("gold-button")?.addEventListener("click", upgradeGoldMultiplier);
loadGame();
updateDisplay();
let attackTimer = setInterval(attack, attackInterval);
setInterval(saveGame, 5000);
function upgradeAttack() {
    if (gold >= upgradeCost) {
        gold = gold - upgradeCost;
        attackPower = attackPower + 1;
        upgradeCost = Math.floor(upgradeCost * 1.5);
        updateDisplay();
    }
}
function upgradeSpeed() {
    if (gold < speedUpgradeCost) {
        return;
    }
    if (attackInterval <= 200) {
        return;
    }
    gold -= speedUpgradeCost;
    attackInterval = Math.floor(attackInterval * 0.9);
    speedUpgradeCost = Math.floor(speedUpgradeCost * 2);
    clearInterval(attackTimer);
    attackTimer = setInterval(attack, attackInterval);
    updateDisplay();
}
document.getElementById("speed-button")?.addEventListener("click", upgradeSpeed);
document.getElementById("upgrade-button")?.addEventListener("click", upgradeAttack);
function saveGame() {
    let saveData = {
        stage: stage,
        gold: gold,
        enemyName: enemyName,
        enemyHp: enemyHp,
        enemyMaxHp: enemyMaxHp,
        attackPower: attackPower,
        upgradeCost: upgradeCost,
        lastSaveTime: Date.now(),
        attackInterval: attackInterval,
        speedUpgradeCost: speedUpgradeCost,
        goldMultiplier: goldMultiplier,
        goldMultiplierUpgradeCost: goldMultiplierUpgradeCost,
    };
    localStorage.setItem("idleRpgSave", JSON.stringify(saveData));
}
function loadGame() {
    let saved = localStorage.getItem("idleRpgSave");
    if (saved === null) {
        return;
    }
    let saveData = JSON.parse(saved);
    stage = saveData.stage;
    gold = saveData.gold;
    enemyName = saveData.enemyName;
    enemyHp = saveData.enemyHp;
    enemyMaxHp = saveData.enemyMaxHp;
    attackPower = saveData.attackPower;
    upgradeCost = saveData.upgradeCost;
    attackInterval = saveData.attackInterval ?? 1000;
    speedUpgradeCost = saveData.speedUpgradeCost ?? 50;
    goldMultiplier = saveData.goldMultiplier ?? 1;
    goldMultiplierUpgradeCost = saveData.goldMultiplierUpgradeCost ?? 25;
    if (saveData.lastSaveTime) {
        giveOfflineReward(saveData.lastSaveTime);
    }
}
function resetGame() {
    if (confirm("本当にデータを消しますか？")) {
        localStorage.removeItem("idleRpgSave");
        location.reload();
    }
}
document.getElementById("reset-button")?.addEventListener("click", resetGame);
function giveOfflineReward(lastSaveTime) {
    let elapsed = Date.now() - lastSaveTime;
    if (elapsed < 60 * 1000) {
        return;
    }
    let maxOffline = 8 * 60 * 60 * 1000;
    if (elapsed > maxOffline) {
        elapsed = maxOffline;
    }
    let attackCount = Math.floor(elapsed / attackInterval);
    let goldBefore = gold;
    let stageBefore = stage;
    for (let i = 0; i < attackCount; i++) {
        doAttack();
    }
    let goldGained = gold - goldBefore;
    let stagesGained = stage - stageBefore;
    let offlineMessage = "おかえりなさい！放置中に" + goldGained + "G 獲得、" + stagesGained + "ステージ進みました。";
    setText("offline-message", offlineMessage);
    setTimeout(removeMessage, 5000);
}
function removeMessage() {
    setText("offline-message", "");
}
