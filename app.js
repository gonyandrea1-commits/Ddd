const boardElement = document.getElementById("board");
const setupSection = document.getElementById("setup");
const gameSection = document.getElementById("game");
const playerNameInput = document.getElementById("player-name");
const playerColorInput = document.getElementById("player-color");
const addPlayerButton = document.getElementById("add-player");
const startGameButton = document.getElementById("start-game");
const playerList = document.getElementById("player-list");
const currentPlayerLabel = document.getElementById("current-player");
const currentMoneyLabel = document.getElementById("current-money");
const diceResultLabel = document.getElementById("dice-result");
const turnActions = document.getElementById("turn-actions");
const playersStatus = document.getElementById("players-status");
const logEntries = document.getElementById("log-entries");

const groupSizes = {
  brown: 2,
  lightblue: 3,
  pink: 3,
  orange: 3,
  red: 3,
  yellow: 3,
  green: 3,
  darkblue: 2,
};

const spaces = [
  { type: "go", name: "Старт" },
  {
    type: "property",
    name: "Вулиця Стара",
    price: 60,
    group: "brown",
    color: "#9b6b43",
    houseCost: 50,
    rents: [2, 10, 30, 90, 160, 250],
  },
  { type: "community", name: "Скриня громади" },
  {
    type: "property",
    name: "Вулиця Реміснича",
    price: 60,
    group: "brown",
    color: "#9b6b43",
    houseCost: 50,
    rents: [4, 20, 60, 180, 320, 450],
  },
  { type: "tax", name: "Податок на дохід", amount: 200 },
  { type: "railroad", name: "Північна залізниця", price: 200 },
  {
    type: "property",
    name: "Блакитний проспект",
    price: 100,
    group: "lightblue",
    color: "#7ec8e3",
    houseCost: 50,
    rents: [6, 30, 90, 270, 400, 550],
  },
  { type: "chance", name: "Шанс" },
  {
    type: "property",
    name: "Лазурна вулиця",
    price: 100,
    group: "lightblue",
    color: "#7ec8e3",
    houseCost: 50,
    rents: [6, 30, 90, 270, 400, 550],
  },
  {
    type: "property",
    name: "Морська вулиця",
    price: 120,
    group: "lightblue",
    color: "#7ec8e3",
    houseCost: 50,
    rents: [8, 40, 100, 300, 450, 600],
  },
  { type: "jail", name: "Вʼязниця" },
  {
    type: "property",
    name: "Рожева алея",
    price: 140,
    group: "pink",
    color: "#e26aa5",
    houseCost: 100,
    rents: [10, 50, 150, 450, 625, 750],
  },
  { type: "utility", name: "Електростанція", price: 150 },
  {
    type: "property",
    name: "Проспект мрій",
    price: 140,
    group: "pink",
    color: "#e26aa5",
    houseCost: 100,
    rents: [10, 50, 150, 450, 625, 750],
  },
  {
    type: "property",
    name: "Вулиця Троянд",
    price: 160,
    group: "pink",
    color: "#e26aa5",
    houseCost: 100,
    rents: [12, 60, 180, 500, 700, 900],
  },
  { type: "railroad", name: "Східна залізниця", price: 200 },
  {
    type: "property",
    name: "Помаранчева площа",
    price: 180,
    group: "orange",
    color: "#f08c4c",
    houseCost: 100,
    rents: [14, 70, 200, 550, 750, 950],
  },
  { type: "community", name: "Скриня громади" },
  {
    type: "property",
    name: "Вулиця Сонця",
    price: 180,
    group: "orange",
    color: "#f08c4c",
    houseCost: 100,
    rents: [14, 70, 200, 550, 750, 950],
  },
  {
    type: "property",
    name: "Проспект Свободи",
    price: 200,
    group: "orange",
    color: "#f08c4c",
    houseCost: 100,
    rents: [16, 80, 220, 600, 800, 1000],
  },
  { type: "freeparking", name: "Безкоштовна парковка" },
  {
    type: "property",
    name: "Червоний бульвар",
    price: 220,
    group: "red",
    color: "#e15b64",
    houseCost: 150,
    rents: [18, 90, 250, 700, 875, 1050],
  },
  { type: "chance", name: "Шанс" },
  {
    type: "property",
    name: "Проспект Ритму",
    price: 220,
    group: "red",
    color: "#e15b64",
    houseCost: 150,
    rents: [18, 90, 250, 700, 875, 1050],
  },
  {
    type: "property",
    name: "Вулиця Музики",
    price: 240,
    group: "red",
    color: "#e15b64",
    houseCost: 150,
    rents: [20, 100, 300, 750, 925, 1100],
  },
  { type: "railroad", name: "Південна залізниця", price: 200 },
  {
    type: "property",
    name: "Жовтий проспект",
    price: 260,
    group: "yellow",
    color: "#f2c94c",
    houseCost: 150,
    rents: [22, 110, 330, 800, 975, 1150],
  },
  {
    type: "property",
    name: "Сонячна вулиця",
    price: 260,
    group: "yellow",
    color: "#f2c94c",
    houseCost: 150,
    rents: [22, 110, 330, 800, 975, 1150],
  },
  { type: "utility", name: "Водоканал", price: 150 },
  {
    type: "property",
    name: "Золота площа",
    price: 280,
    group: "yellow",
    color: "#f2c94c",
    houseCost: 150,
    rents: [24, 120, 360, 850, 1025, 1200],
  },
  { type: "goToJail", name: "До вʼязниці" },
  {
    type: "property",
    name: "Зелений парк",
    price: 300,
    group: "green",
    color: "#6fbf73",
    houseCost: 200,
    rents: [26, 130, 390, 900, 1100, 1275],
  },
  {
    type: "property",
    name: "Сквер Дніпра",
    price: 300,
    group: "green",
    color: "#6fbf73",
    houseCost: 200,
    rents: [26, 130, 390, 900, 1100, 1275],
  },
  { type: "community", name: "Скриня громади" },
  {
    type: "property",
    name: "Парк Весни",
    price: 320,
    group: "green",
    color: "#6fbf73",
    houseCost: 200,
    rents: [28, 150, 450, 1000, 1200, 1400],
  },
  { type: "railroad", name: "Західна залізниця", price: 200 },
  { type: "chance", name: "Шанс" },
  {
    type: "property",
    name: "Темно-синя набережна",
    price: 350,
    group: "darkblue",
    color: "#2f80ed",
    houseCost: 200,
    rents: [35, 175, 500, 1100, 1300, 1500],
  },
  { type: "tax", name: "Податок на розкіш", amount: 100 },
  {
    type: "property",
    name: "Королівський проспект",
    price: 400,
    group: "darkblue",
    color: "#2f80ed",
    houseCost: 200,
    rents: [50, 200, 600, 1400, 1700, 2000],
  },
];

const state = {
  players: [],
  currentPlayerIndex: 0,
  lastRoll: null,
  pendingPurchase: null,
  pendingBuild: null,
  doublesCount: 0,
  chanceDeck: [],
  communityDeck: [],
  gameStarted: false,
};

const chanceCards = [
  {
    text: "Переїдьте на старт і отримайте 200.",
    action: (player) => movePlayerTo(player, 0, true),
  },
  {
    text: "Банк виплачує вам дивіденди 100.",
    action: (player) => adjustMoney(player, 100),
  },
  {
    text: "Виплатіть штраф 50.",
    action: (player) => adjustMoney(player, -50),
  },
  {
    text: "Перейдіть на найближчу залізницю.",
    action: (player) => moveToNearest(player, "railroad"),
  },
  {
    text: "Перейдіть на найближчу комунальну службу.",
    action: (player) => moveToNearest(player, "utility"),
  },
  {
    text: "Йдете до вʼязниці.",
    action: (player) => sendToJail(player),
  },
];

const communityCards = [
  {
    text: "Ви отримали спадщину 100.",
    action: (player) => adjustMoney(player, 100),
  },
  {
    text: "Повернення податку 50.",
    action: (player) => adjustMoney(player, 50),
  },
  {
    text: "Оплатіть послуги лікаря 50.",
    action: (player) => adjustMoney(player, -50),
  },
  {
    text: "Отримайте 25 за консультацію.",
    action: (player) => adjustMoney(player, 25),
  },
  {
    text: "Отримайте 10 з кожного гравця.",
    action: (player) =>
      state.players.forEach((other) => {
        if (other !== player && !other.bankrupt) {
          adjustMoney(other, -10);
          adjustMoney(player, 10);
        }
      }),
  },
  {
    text: "Йдете до вʼязниці.",
    action: (player) => sendToJail(player),
  },
];

function shuffleDeck(deck) {
  return deck
    .map((card) => ({ card, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ card }) => card);
}

function initDecks() {
  state.chanceDeck = shuffleDeck(chanceCards);
  state.communityDeck = shuffleDeck(communityCards);
}

function addLog(message) {
  const entry = document.createElement("div");
  entry.className = "log__entry";
  entry.textContent = message;
  logEntries.prepend(entry);
}

function updatePlayerList() {
  playerList.innerHTML = "";
  state.players.forEach((player) => {
    const item = document.createElement("li");
    const color = document.createElement("span");
    color.className = "player-color";
    color.style.background = player.color;
    item.appendChild(color);
    item.append(player.name);
    playerList.appendChild(item);
  });
  startGameButton.disabled = state.players.length < 2;
}

function addPlayer() {
  const name = playerNameInput.value.trim();
  if (!name) {
    return;
  }
  if (state.players.length >= 4) {
    addLog("Максимум 4 гравці.");
    return;
  }
  state.players.push({
    name,
    color: playerColorInput.value,
    position: 0,
    money: 1500,
    properties: [],
    inJail: false,
    jailTurns: 0,
    doublesCount: 0,
    bankrupt: false,
  });
  playerNameInput.value = "";
  updatePlayerList();
}

function startGame() {
  if (state.players.length < 2) {
    return;
  }
  state.gameStarted = true;
  setupSection.hidden = true;
  gameSection.hidden = false;
  initDecks();
  renderBoard();
  renderPlayersStatus();
  updateTurn();
  addLog("Гра розпочалась! Перший хід.");
}

function renderBoard() {
  boardElement.innerHTML = "";
  spaces.forEach((space, index) => {
    const cell = document.createElement("div");
    cell.className = "space";
    const coords = getCoordinates(index);
    cell.style.gridColumn = coords.col;
    cell.style.gridRow = coords.row;

    const name = document.createElement("div");
    name.className = "space__name";
    name.textContent = space.name;

    const owner = document.createElement("div");
    owner.className = "space__owner";
    if (space.owner !== undefined && space.owner !== null) {
      owner.style.background = state.players[space.owner]?.color || "transparent";
    }

    const tokens = document.createElement("div");
    tokens.className = "space__tokens";

    state.players.forEach((player) => {
      if (!player.bankrupt && player.position === index) {
        const token = document.createElement("span");
        token.className = "token";
        token.style.background = player.color;
        tokens.appendChild(token);
      }
    });

    const price = document.createElement("div");
    price.className = "space__price";
    if (space.type === "property" || space.type === "railroad" || space.type === "utility") {
      price.textContent = `₴${space.price}`;
    } else if (space.type === "tax") {
      price.textContent = `-₴${space.amount}`;
    } else {
      price.textContent = "";
    }

    if (space.type === "property" && space.houses) {
      price.textContent = `Будинки: ${space.houses}`;
    }

    cell.appendChild(name);
    cell.appendChild(owner);
    cell.appendChild(tokens);
    cell.appendChild(price);
    boardElement.appendChild(cell);
  });
}

function getCoordinates(index) {
  if (index === 0) return { row: 11, col: 11 };
  if (index > 0 && index < 10) return { row: 11, col: 11 - index };
  if (index === 10) return { row: 11, col: 1 };
  if (index > 10 && index < 20) return { row: 11 - (index - 10), col: 1 };
  if (index === 20) return { row: 1, col: 1 };
  if (index > 20 && index < 30) return { row: 1, col: index - 19 };
  if (index === 30) return { row: 1, col: 11 };
  return { row: index - 29, col: 11 };
}

function renderPlayersStatus() {
  playersStatus.innerHTML = "";
  state.players.forEach((player) => {
    const card = document.createElement("div");
    card.className = "player-card";
    if (player.bankrupt) {
      card.style.opacity = 0.6;
    }

    const header = document.createElement("div");
    header.className = "player-card__header";

    const badge = document.createElement("div");
    badge.className = "player-badge";
    const dot = document.createElement("span");
    dot.className = "player-color";
    dot.style.background = player.color;
    badge.appendChild(dot);
    badge.append(player.name);

    const money = document.createElement("div");
    money.textContent = `₴${player.money}`;

    header.appendChild(badge);
    header.appendChild(money);

    const props = document.createElement("div");
    const propertyNames = player.properties
      .map((index) => spaces[index].name)
      .join(", ");
    props.textContent = propertyNames ? `Майно: ${propertyNames}` : "Майна немає";

    const status = document.createElement("div");
    status.textContent = player.inJail ? "У вʼязниці" : "На полі";

    card.appendChild(header);
    card.appendChild(props);
    card.appendChild(status);
    playersStatus.appendChild(card);
  });
}

function updateTurn() {
  const player = state.players[state.currentPlayerIndex];
  if (!player || player.bankrupt) {
    advanceToNextPlayer();
    return;
  }

  currentPlayerLabel.textContent = player.name;
  currentMoneyLabel.textContent = `₴${player.money}`;
  diceResultLabel.textContent = state.lastRoll ? state.lastRoll.join(" + ") : "—";
  turnActions.innerHTML = "";

  if (player.inJail) {
    addActionButton("Спробувати дубль", () => rollDice(true));
    addActionButton("Заплатити 50", () => payJailFine());
  } else if (state.pendingPurchase !== null) {
    addActionButton("Купити", () => buyProperty());
    addActionButton("Пропустити", () => skipPurchase());
  } else if (state.pendingBuild !== null) {
    addActionButton("Побудувати будинок", () => buildHouse());
    addActionButton("Пропустити", () => endTurn());
  } else {
    addActionButton("Кинути кубики", () => rollDice(false));
    addActionButton("Закінчити хід", () => endTurn());
  }
}

function addActionButton(label, handler) {
  const button = document.createElement("button");
  button.textContent = label;
  button.className = "primary";
  button.addEventListener("click", handler);
  turnActions.appendChild(button);
}

function rollDice(fromJail) {
  const player = state.players[state.currentPlayerIndex];
  if (!player) return;

  const die1 = Math.ceil(Math.random() * 6);
  const die2 = Math.ceil(Math.random() * 6);
  const total = die1 + die2;
  state.lastRoll = [die1, die2];
  diceResultLabel.textContent = `${die1} + ${die2}`;

  if (fromJail) {
    handleJailRoll(player, die1, die2, total);
    return;
  }

  handleMove(player, total, die1 === die2);
}

function handleJailRoll(player, die1, die2, total) {
  if (die1 === die2) {
    player.inJail = false;
    player.jailTurns = 0;
    addLog(`${player.name} вибиває дубль і виходить з вʼязниці.`);
    handleMove(player, total, true);
    return;
  }

  player.jailTurns += 1;
  addLog(`${player.name} не вибив дубль (${player.jailTurns}/3).`);
  if (player.jailTurns >= 3) {
    addLog(`${player.name} сплачує 50 і виходить з вʼязниці.`);
    adjustMoney(player, -50);
    player.inJail = false;
    player.jailTurns = 0;
    handleMove(player, total, false);
    return;
  }
  endTurn();
}

function payJailFine() {
  const player = state.players[state.currentPlayerIndex];
  if (!player) return;
  adjustMoney(player, -50);
  player.inJail = false;
  player.jailTurns = 0;
  addLog(`${player.name} сплачує 50 і виходить з вʼязниці.`);
  updateTurn();
}

function handleMove(player, steps, isDouble) {
  if (isDouble) {
    player.doublesCount += 1;
    if (player.doublesCount >= 3) {
      addLog(`${player.name} вибив 3 дубля та йде до вʼязниці.`);
      sendToJail(player);
      endTurn();
      return;
    }
  } else {
    player.doublesCount = 0;
  }

  const oldPosition = player.position;
  let newPosition = (oldPosition + steps) % spaces.length;
  if (oldPosition + steps >= spaces.length) {
    adjustMoney(player, 200);
    addLog(`${player.name} проходить старт і отримує 200.`);
  }
  player.position = newPosition;

  const space = spaces[newPosition];
  addLog(`${player.name} став на поле "${space.name}".`);
  resolveSpace(player, space);
  renderBoard();
  renderPlayersStatus();
}

function resolveSpace(player, space) {
  state.pendingPurchase = null;
  state.pendingBuild = null;

  if (space.type === "property" || space.type === "railroad" || space.type === "utility") {
    if (space.owner === undefined || space.owner === null) {
      state.pendingPurchase = spaces.indexOf(space);
      updateTurn();
      return;
    }

    if (space.owner === state.currentPlayerIndex) {
      if (space.type === "property" && canBuildHouse(player, space)) {
        state.pendingBuild = spaces.indexOf(space);
      }
      updateTurn();
      return;
    }

    const owner = state.players[space.owner];
    const rent = calculateRent(space, owner);
    addLog(`${player.name} сплачує ${rent} гравцю ${owner.name}.`);
    adjustMoney(player, -rent);
    adjustMoney(owner, rent);
    checkBankruptcy(player);
    updateTurn();
    return;
  }

  if (space.type === "tax") {
    addLog(`${player.name} сплачує податок ${space.amount}.`);
    adjustMoney(player, -space.amount);
    checkBankruptcy(player);
    updateTurn();
    return;
  }

  if (space.type === "chance") {
    drawCard("chance", player);
    updateTurn();
    return;
  }

  if (space.type === "community") {
    drawCard("community", player);
    updateTurn();
    return;
  }

  if (space.type === "goToJail") {
    sendToJail(player);
    updateTurn();
    return;
  }

  updateTurn();
}

function drawCard(type, player) {
  const deck = type === "chance" ? state.chanceDeck : state.communityDeck;
  const card = deck.shift();
  deck.push(card);
  addLog(`${player.name}: ${card.text}`);
  card.action(player);
  renderBoard();
  renderPlayersStatus();
}

function movePlayerTo(player, index, collectGo) {
  if (collectGo && player.position > index) {
    adjustMoney(player, 200);
    addLog(`${player.name} проходить старт і отримує 200.`);
  }
  player.position = index;
  resolveSpace(player, spaces[index]);
}

function moveToNearest(player, type) {
  let distance = 1;
  while (distance < spaces.length) {
    const index = (player.position + distance) % spaces.length;
    if (spaces[index].type === type) {
      movePlayerTo(player, index, true);
      return;
    }
    distance += 1;
  }
}

function sendToJail(player) {
  player.position = 10;
  player.inJail = true;
  player.jailTurns = 0;
  player.doublesCount = 0;
  addLog(`${player.name} опиняється у вʼязниці.`);
  renderBoard();
}

function calculateRent(space, owner) {
  if (space.type === "railroad") {
    const owned = owner.properties.filter((index) => spaces[index].type === "railroad").length;
    return 25 * Math.pow(2, owned - 1);
  }

  if (space.type === "utility") {
    const owned = owner.properties.filter((index) => spaces[index].type === "utility").length;
    const multiplier = owned === 2 ? 10 : 4;
    const roll = state.lastRoll ? state.lastRoll[0] + state.lastRoll[1] : 6;
    return roll * multiplier;
  }

  if (space.type === "property") {
    if (space.houses && space.houses > 0) {
      return space.rents[space.houses];
    }
    if (ownsFullGroup(owner, space.group)) {
      return space.rents[0] * 2;
    }
    return space.rents[0];
  }

  return 0;
}

function ownsFullGroup(player, group) {
  const properties = player.properties.filter((index) => spaces[index].group === group);
  return properties.length === groupSizes[group];
}

function canBuildHouse(player, space) {
  if (space.type !== "property") return false;
  if (!ownsFullGroup(player, space.group)) return false;
  if (space.houses >= 5) return false;
  return player.money >= space.houseCost;
}

function buildHouse() {
  const index = state.pendingBuild;
  if (index === null) return;
  const player = state.players[state.currentPlayerIndex];
  const space = spaces[index];
  if (!player || !space) return;
  if (!canBuildHouse(player, space)) {
    state.pendingBuild = null;
    updateTurn();
    return;
  }
  space.houses = (space.houses || 0) + 1;
  adjustMoney(player, -space.houseCost);
  addLog(`${player.name} будує будинок на "${space.name}".`);
  state.pendingBuild = null;
  renderBoard();
  renderPlayersStatus();
  updateTurn();
}

function buyProperty() {
  const index = state.pendingPurchase;
  if (index === null) return;
  const player = state.players[state.currentPlayerIndex];
  const space = spaces[index];
  if (!player || !space) return;
  if (player.money < space.price) {
    addLog(`${player.name} не має достатньо коштів.`);
    state.pendingPurchase = null;
    updateTurn();
    return;
  }

  adjustMoney(player, -space.price);
  space.owner = state.currentPlayerIndex;
  player.properties.push(index);
  addLog(`${player.name} купує "${space.name}".`);
  state.pendingPurchase = null;
  renderBoard();
  renderPlayersStatus();
  updateTurn();
}

function skipPurchase() {
  state.pendingPurchase = null;
  updateTurn();
}

function adjustMoney(player, amount) {
  player.money += amount;
  renderPlayersStatus();
}

function checkBankruptcy(player) {
  if (player.money >= 0) return;
  addLog(`${player.name} банкрут.`);
  player.bankrupt = true;
  player.properties.forEach((index) => {
    spaces[index].owner = null;
    spaces[index].houses = 0;
  });
  player.properties = [];
  const activePlayers = state.players.filter((p) => !p.bankrupt);
  if (activePlayers.length === 1) {
    addLog(`Переможець: ${activePlayers[0].name}!`);
  }
  renderBoard();
  renderPlayersStatus();
}

function endTurn() {
  state.pendingPurchase = null;
  state.pendingBuild = null;
  state.lastRoll = null;
  diceResultLabel.textContent = "—";
  advanceToNextPlayer();
}

function advanceToNextPlayer() {
  let nextIndex = state.currentPlayerIndex;
  do {
    nextIndex = (nextIndex + 1) % state.players.length;
  } while (state.players[nextIndex].bankrupt);
  state.currentPlayerIndex = nextIndex;
  updateTurn();
}

addPlayerButton.addEventListener("click", addPlayer);
startGameButton.addEventListener("click", startGame);

playerNameInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    addPlayer();
  }
});
