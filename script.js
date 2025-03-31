// Таблица планет с бустами
const planetBoosts = {
  "moon": 1.05,      // +5%
  "mercury": 1.10,   // +10%
  "pluto": 1.15,     // +15%
  "uranus": 1.20,    // +20%
  "mars": 1.25,      // +25%
  "jupiter": 1.30,   // +30%
  "saturn": 1.35,    // +35%
  "earth": 1.40      // +40%
};

// Извлечение параметров из URL
const params = new URLSearchParams(window.location.search);

let energy = Number(params.get('energy')) || 10;
let currentStars = Number(params.get('currentStars')) || 0;
let totalClicks = Number(params.get('clicks')) || 0;
const planet = params.get('planet') || "stars"; // Если нет, то stars.png
const baseStarsPerClick = 0.001;

// Определяем множитель буста
const boostMultiplier = planetBoosts[planet] || 1.0;

// Обновляем `starsPerClick` по бусту
let starsPerClick = baseStarsPerClick * boostMultiplier;

const maxEnergy = energy;

const star = document.getElementById("star");
const totalClicksDisplay = document.getElementById("totalClicks");
const currentStarsDisplay = document.getElementById("currentStars");
const energyValueDisplay = document.getElementById("energyValue");
const energyBar = document.getElementById("energyBar");
const message = document.getElementById("message");
const closeBtn = document.getElementById("closeBtn");

// Установка значений из параметров
totalClicksDisplay.textContent = totalClicks;
currentStarsDisplay.textContent = currentStars.toFixed(4); // Округляем до 3 знаков
energyValueDisplay.textContent = energy;
energyBar.style.width = `${(energy / maxEnergy) * 100}%`;

// Устанавливаем изображение планеты
star.src = `image/${planet}.png`;

// Обработчик клика
star.addEventListener("click", (event) => {
  if (energy > 0) {
    totalClicks++;
    energy--;
    totalClicksDisplay.textContent = totalClicks;

    // Увеличиваем звёзды на `starsPerClick` (с учётом буста)
    currentStars += starsPerClick;
    currentStarsDisplay.textContent = currentStars.toFixed(4);

    energyBar.style.width = `${(energy / maxEnergy) * 100}%`;
    energyValueDisplay.textContent = energy;

    // Показываем всплывающий текст с правильным значением
    createFloatingText(event.clientX, event.clientY, starsPerClick);
  } else {
    message.textContent = "⚠️ Энергия закончилась!";
  }
});

// Функция появления анимации "+0.001" или больше
function createFloatingText(x, y, value) {
  const text = document.createElement("div");
  text.classList.add("floating-text");

  // Округляем до 3 знаков
  text.textContent = `+${value.toFixed(4)}`;

  document.body.appendChild(text);
  text.style.left = `${x}px`;
  text.style.top = `${y}px`;

  setTimeout(() => text.remove(), 1000);
}

// Функция отправки данных в Telegram
function sendDataToTelegram() {
  const data = {
    stars: currentStars.toFixed(3),
    energy: energy,
    clicks: totalClicks
  };

  if (window.Telegram.WebApp) {
    window.Telegram.WebApp.sendData(JSON.stringify(data));
  } else {
    console.log("Telegram WebApp API не доступен. Данные:", data);
  }
}

// Закрытие и отправка данных
closeBtn.addEventListener("click", () => {
  sendDataToTelegram();
  if (window.Telegram.WebApp) {
    window.Telegram.WebApp.close();
  } else {
    console.log("Закрытие мини-приложения недоступно.");
  }
});

// Отправка данных перед выходом
window.addEventListener("beforeunload", sendDataToTelegram);

