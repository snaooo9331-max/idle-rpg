let stage = 1;
let gold = 0;
let enemyNames = ["スライム", "ゴブリン", "オオカミ", "オーク", "ドラゴン", "オーガ"];

let enemyName = "ゴブリン";
let enemyHp = 25;
let enemyMaxHp = 25;
let attackPower = 3;
let upgradeCost = 10;
let attackInterval = 1000;

function updateDisplay() {
  document.getElementById("stage").textContent = stage;
  document.getElementById("gold").textContent = gold;
  document.getElementById("enemy-name").textContent = enemyName;
  document.getElementById("enemy-hp").textContent = enemyHp;
  document.getElementById("enemy-max-hp").textContent = enemyMaxHp;
  document.getElementById("attack-power").textContent = attackPower;
  document.getElementById("upgrade-cost").textContent = upgradeCost;
}

function doAttack() {
  enemyHp = enemyHp - attackPower;

  if (enemyHp <= 0) {
    defeatEnemy();
  }
}

function attack() {
  doAttack();
  updateDisplay();
}

function defeatEnemy() {
  gold = gold + stage * 5;
  stage = stage + 1;

  enemyMaxHp = Math.floor(enemyMaxHp * 1.5);
  enemyHp = enemyMaxHp;

  let index = Math.floor(Math.random() * enemyNames.length);
  enemyName = enemyNames[index];
}

loadGame();
updateDisplay();
setInterval(attack, attackInterval);
setInterval(saveGame, 5000);

function upgradeAttack() {
  if (gold >= upgradeCost) {
    gold = gold - upgradeCost;
    attackPower = attackPower + 1;
    upgradeCost = Math.floor(upgradeCost * 1.5);
    updateDisplay();
  }
}

document.getElementById("upgrade-button").addEventListener("click", upgradeAttack);

function saveGame() {
  let saveData = {
    stage: stage,
    gold: gold,
    enemyName: enemyName,
    enemyHp: enemyHp,
    enemyMaxHp: enemyMaxHp,
    attackPower: attackPower,
    upgradeCost: upgradeCost,
    lastSaveTime: Date.now()
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

document.getElementById("reset-button").addEventListener("click", resetGame);

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

  document.getElementById("offline-message").textContent = "おかえりなさい！放置中に" + goldGained + "G 獲得、" + stagesGained + "ステージ進みました。";
  
  setTimeout(removeMessage, 5000);
}

function removeMessage() {
  document.getElementById("offline-message").textContent = "";
}
