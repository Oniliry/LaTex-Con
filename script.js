// Извлечение параметров из URL
const params = new URLSearchParams(window.location.search);
let currentStars = Number(params.get('currentStars')) || 0;
const starsPerClick = Number(params.get('starsPerClick')) || 1;
let energy = Number(params.get('initialEnergy')) || 10;
const maxEnergy = energy;

let clickCount = 0;

const star = document.getElementById("star");
const clickCountDisplay = document.getElementById("clickCount");
const currentStarsDisplay = document.getElementById("currentStars");
const energyDisplay = document.getElementById("energy");
const message = document.getElementById("message");
const closeBtn = document.getElementById("closeBtn");

// Установка начальных значений
clickCountDisplay.textContent = clickCount;
currentStarsDisplay.textContent = currentStars;
energyDisplay.style.width = `${(energy / maxEnergy) * 100}%`;

// Обработчик клика по звезде
star.addEventListener("click", (event) => {
  if (energy > 0) {
    clickCount++;
    energy--;
    clickCountDisplay.textContent = clickCount;

    // Начисление звезд за клик
    currentStars += starsPerClick;
    currentStarsDisplay.textContent = currentStars;
    
    // Обновление шкалы энергии
    energyDisplay.style.width = `${(energy / maxEnergy) * 100}%`;

    // Визуальный эффект на звезде
    star.classList.add("glow");
    setTimeout(() => star.classList.remove("glow"), 500);

    // Вылетающий текст "+1" в точке клика
    createFloatingText(event.clientX, event.clientY);
  } else {
    message.textContent = "⚠️ Энергия закончилась! Подожди...";
  }
});

// Функция появления вылетающего "+1"
function createFloatingText(x, y) {
  const text = document.createElement("div");
  text.classList.add("floating-text");
  text.textContent = "+1";
  document.body.appendChild(text);
  text.style.left = `${x}px`;
  text.style.top = `${y}px`;

  setTimeout(() => {
    text.remove();
  }, 1000);
}

// Восстановление энергии каждые 5 секунд
setInterval(() => {
  if (energy < maxEnergy) {
    energy++;
    energyDisplay.style.width = `${(energy / maxEnergy) * 100}%`;
    message.textContent = "";
  }
}, 5000);

let tg = window.Telegram.WebApp

function sendDataToTelegram() {
  const data = {
    clicks: clickCount,
    stars: currentStars
  };
  if (tg) {
    console.log(tg)
    tg.sendData(JSON.stringify(data));
  } else {
    console.log("Telegram WebApp API не доступен. Данные:", data);
  }
}

closeBtn.addEventListener("click", () => {
  sendDataToTelegram();
  if (tg) {
    tg.close();
  } else {
    console.log("Закрытие мини-приложения недоступно.");
  }
});

// При закрытии окна (например, через системное закрытие) отправляем данные
window.addEventListener("beforeunload", sendDataToTelegram);

