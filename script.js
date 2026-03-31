function saveHistory(type, amount){

const history =
JSON.parse(localStorage.getItem("txHistory")) || [];

history.push({
type: type,
amount: amount,
time: new Date().toLocaleString()
});

localStorage.setItem("txHistory", JSON.stringify(history));
}

/* =========================
🔥 TELEGRAM LOGIN (NO BACKEND)
========================= */
function onTelegramAuth(user){

console.log("Telegram User:", user);

// save locally
localStorage.setItem("telegram", user.id);
localStorage.setItem("name", user.first_name);

// redirect
window.location.href = "home.html";
}

/* =========================
🔥 POPUP CONTROL
========================= */
window.openModal = function(){

let popup = document.getElementById("boostPopup");

popup.style.display = "flex";
popup.style.justifyContent = "center";
popup.style.alignItems = "center";
}

window.closeModal = function(){
document.getElementById("boostPopup").style.display = "none";
}

/* =========================
🔥 SETTINGS
========================= */
let baseDaily = 50;

const WALLET_KEY = "wallet";
const MINED_KEY = "mined";
const LAST_KEY = "lastTime";
const BOOST_KEY = "boost";

/* =========================
🔥 LOAD DATA
========================= */
let wallet = parseFloat(localStorage.getItem(WALLET_KEY)) || 0;
let mined = parseFloat(localStorage.getItem(MINED_KEY)) || 0;
let lastTime = parseFloat(localStorage.getItem(LAST_KEY)) || Date.now();
let boost = parseFloat(localStorage.getItem(BOOST_KEY)) || 0;

/* =========================
🔥 CALCULATIONS
========================= */
function getDaily(){
return baseDaily + (boost * 0.552);
}

function getSpeed(){
return 2 + (boost * 0.1);
}

/* =========================
🔥 MINING ENGINE
========================= */
function updateMining(){

let now = Date.now();
let diff = (now - lastTime) / 1000;

let perSecond = getDaily() / 86400;

mined += perSecond * diff;

lastTime = now;

localStorage.setItem(MINED_KEY, mined);
localStorage.setItem(LAST_KEY, lastTime);

document.getElementById("mined").textContent =
mined.toFixed(6);

document.getElementById("wallet").textContent =
wallet.toFixed(2);

document.getElementById("speedDisplay").textContent =
getSpeed().toFixed(2);
}

/* LOOP */
function loop(){
updateMining();
requestAnimationFrame(loop);
}
loop();

/* =========================
🔥 CLAIM
========================= */
window.claim = function(){

if(mined <= 0) return;

wallet += mined;
localStorage.setItem(WALLET_KEY, wallet);

saveHistory("Claim", mined.toFixed(6));

mined = 0;
localStorage.setItem(MINED_KEY, mined);

document.getElementById("wallet").textContent =
wallet.toFixed(2);

document.getElementById("mined").textContent =
"0.000000";
}

/* =========================
🔥 BOOST
========================= */
window.applyBoost = function(amount){

let boost = parseFloat(localStorage.getItem(BOOST_KEY)) || 0;

boost += amount;

localStorage.setItem(BOOST_KEY, boost);

saveHistory("Boost", amount.toFixed(2));

alert("⚡ Boost Activated!");

updateMining();
}
