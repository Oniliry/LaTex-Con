// Инициализация параметров и переменных из URL
const params = new URLSearchParams(window.location.search);
let energy = Number(params.get('energy')) || 0;
let currentStars = Number(params.get('currentStars')) || 0;
let totalClicks = Number(params.get('clicks')) || 0;
let planet = params.get('planet') || "stars";
const baseStarsPerClick = 0.001;

// Бусты для различных планет
const planetBoosts = {
  "stars": 1.00,
  "moon": 1.05,
  "mercury": 1.10,
  "pluto": 1.15,
  "uranus": 1.20,
  "mars": 1.25,
  "jupiter": 1.30,
  "saturn": 1.35,
  "earth": 1.40
};

// Максимальные значения энергии для каждой планеты
const maxEnergyPerPlanet = {
  "stars": 250,
  "moon": 260,
  "mercury": 270,
  "pluto": 280,
  "uranus": 290,
  "mars": 300,
  "jupiter": 320,
  "saturn": 330,
  "earth": 350
};

// Получение множителя для текущей планеты
let boostMultiplier = planetBoosts[planet] || 1.0;
let starsPerClick = baseStarsPerClick * boostMultiplier;
let maxEnergy = maxEnergyPerPlanet[planet] || 250; // Устанавливаем максимальную энергию для планеты

// Список планет для последовательной смены
const planets = ["stars", "moon", "mercury", "pluto", "uranus", "mars", "jupiter", "saturn", "earth"];

// Порог для смены планеты
function getNextPlanetThreshold() {
  const currentIndex = planets.indexOf(planet);
  const nextIndex = currentIndex + 1;

  // Если планета последняя, возвращаем бесконечность (ничего менять не будет)
  if (nextIndex >= planets.length) {
    return Infinity;
  }

  const nextBoostMultiplier = planetBoosts[planets[nextIndex]];
  const clicksForNextPlanet = 15000 + 15000 * ((boostMultiplier - 1) / 5) * 100;
  return clicksForNextPlanet;
}

// Получение элементов DOM
const star = document.getElementById("star");
const totalClicksDisplay = document.getElementById("totalClicks");
const currentStarsDisplay = document.getElementById("currentStars");
const energyValueDisplay = document.getElementById("energyValue");
const energyBar = document.getElementById("energyBar");
const message = document.getElementById("message");
const closeBtn = document.getElementById("closeBtn");
const container = document.querySelector(".container");

// Инициализация отображаемых значений
totalClicksDisplay.textContent = totalClicks;
currentStarsDisplay.textContent = currentStars.toFixed(4);
energyValueDisplay.textContent = energy;
energyBar.style.width = `${(energy / maxEnergy) * 100}%`;
energyBar.setAttribute('max', maxEnergy); // Устанавливаем максимальное значение для energyBar
star.src = `image/${planet}.png`;

document.addEventListener("DOMContentLoaded", () => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.expand();
  }
});

// Обработка кликов по планете
let lastClickTime = 0;
star.addEventListener("click", (event) => {
  event.preventDefault();
  const now = Date.now();
  if (now - lastClickTime < 200 || energy <= 0) return;
  lastClickTime = now;

  totalClicks++;
  energy--;
  currentStars += starsPerClick;

  // Обновление UI
  totalClicksDisplay.textContent = totalClicks;
  currentStarsDisplay.textContent = currentStars.toFixed(4);
  energyValueDisplay.textContent = energy;
  energyBar.style.width = `${(energy / maxEnergy) * 100}%`; // Обновляем ширину energyBar

  // Проверяем, нужно ли сменить планету
  if (totalClicks >= getNextPlanetThreshold()) {
    const currentIndex = planets.indexOf(planet);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < planets.length) {
      planet = planets[nextIndex];
      boostMultiplier = planetBoosts[planet];
      starsPerClick = baseStarsPerClick * boostMultiplier;
      maxEnergy = maxEnergyPerPlanet[planet]; // Обновляем максимальное значение энергии для новой планеты
      energy = Math.min(energy, maxEnergy); // Ограничиваем энергию максимальным значением

      // Обновление изображения планеты и UI
      star.src = `image/${planet}.png`;
      message.textContent = `Поздравляем! Теперь ваша планета: ${planet}.`;
      energyBar.setAttribute('max', maxEnergy); // Обновляем max для energyBar
      energyBar.style.width = `${(energy / maxEnergy) * 100}%`; // Обновляем ширину energyBar
    }
  }

  // Создание всплывающего текста с приростом звёзд
  createFloatingText(event.clientX, event.clientY, starsPerClick);
});

//Создает всплывающий текст, отображающий прирост звёзд
function createFloatingText(x, y, value) {
  const text = document.createElement("div");
  text.classList.add("floating-text");
  text.textContent = `+${value.toFixed(4)}`;
  document.body.appendChild(text);

  text.style.position = "absolute";
  text.style.pointerEvents = "none";

  const maxX = window.innerWidth - text.offsetWidth - 10;
  const maxY = window.innerHeight - text.offsetHeight - 10;

  text.style.left = `${Math.min(x, maxX)}px`;
  text.style.top = `${Math.min(y, maxY)}px`;

  setTimeout(() => text.remove(), 1000);
}

//Логика работы комет
let cometActive = false;    // Флаг, указывающий на активность кометы
let cometClicks = 0;        // Счетчик кликов по комете
let cometInterval = null;   // Интервал анимации кометы

//Создает и запускает анимацию кометы
function spawnComet() {
  if (cometActive) return; // Если комета уже активна, не создавать новую

  cometActive = true;
  cometClicks = 0;

  // Создаем элемент кометы и задаем начальные стили
  const comet = document.createElement("div");
  comet.classList.add("comet");

  // Определяем стартовую позицию кометы (слева или справа от контейнера)
  const containerRect = container.getBoundingClientRect();
  const fromLeft = Math.random() < 0.5;
  const startX = fromLeft ? -60 : containerRect.width + 60;
  const startY = Math.random() * containerRect.height * 0.8;
  comet.style.left = `${startX}px`;
  comet.style.top = `${startY}px`;

  container.appendChild(comet);

  // Вычисляем целевые координаты – центр планеты
  const starRect = star.getBoundingClientRect();
  const containerOffset = container.getBoundingClientRect();
  const targetX = starRect.left - containerOffset.left + starRect.width / 2;
  const targetY = starRect.top - containerOffset.top + starRect.height / 2;

  // Текущие координаты кометы
  let currentX = startX;
  let currentY = startY;

  // Вычисляем вектор движения кометы
  const dx = targetX - startX;
  const dy = targetY - startY;
  const distance = Math.hypot(dx, dy);
  // Случайная скорость (в пикселях за миллисекунду)
  const speed = Math.random() * (0.03 - 0.01) + 0.01;
  const stepX = dx / distance * speed;
  const stepY = dy / distance * speed;

  // Запускаем анимацию перемещения кометы (примерно 60 кадров в секунду)
  cometInterval = setInterval(() => {
    currentX += stepX * 16;
    currentY += stepY * 16;
    comet.style.left = `${currentX}px`;
    comet.style.top = `${currentY}px`;
    message.textContent = "Уничтожь комету!";
    // Проверяем, достигла ли комета области планеты
    const cometRect = comet.getBoundingClientRect();
    if (isColliding(cometRect, star.getBoundingClientRect())) {
      // Если комета не была уничтожена кликами, запускаем анимацию столкновения
      if (cometClicks < 10) {
        triggerExplosion(cometRect);
      }
      removeComet(comet);
    }
  }, 16);

  // Обработчик кликов по комете: при достижении 10 кликов комета уничтожается
  comet.addEventListener("click", () => {
    cometClicks++;
    triggerCometClickExplosion(comet.getBoundingClientRect());
    if (cometClicks >= 10) {
      removeComet(comet);
    }
  });
}

//Удаляет комету и выполняет завершающие действия
function removeComet(comet) {
  if (cometClicks >= 10) {
    // Начисляем бонус энергии: 5% от максимальной энергии
    const energyGain = Math.floor(maxEnergy * 0.05);
    energy = Math.min(maxEnergy, energy + energyGain);
    energyValueDisplay.textContent = energy;
    energyBar.style.width = `${(energy / maxEnergy) * 100}%`;
    message.textContent = "Комета уничтожена! +5% энергии!";
  }
  cometActive = false;
  clearInterval(cometInterval);
  if (comet.parentNode) {
    comet.parentNode.removeChild(comet);
  }
  setTimeout(() => { message.textContent = ""; }, 3000);
}

// Проверяет, пересекаются ли два прямоугольника
function isColliding(rect1, rect2) {
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}

// Запускает анимацию взрыва при столкновении кометы с планетой
function triggerExplosion(rect) {
  const explosion = document.createElement("div");
  explosion.classList.add("explosion");
  const containerRect = container.getBoundingClientRect();
  explosion.style.left = `${rect.left - containerRect.left - 20}px`;
  explosion.style.top = `${rect.top - containerRect.top - 20}px`;
  container.appendChild(explosion);

  // Дополнительно списываем случайное количество звезд (от 0.3% до 5%)
  const penaltyPercentage = Math.random() * (5 - 0.3) + 0.3;
  const penalty = currentStars * (penaltyPercentage / 100);
  currentStars = Math.max(0, currentStars - penalty);
  currentStarsDisplay.textContent = currentStars.toFixed(4);
  message.innerHTML = `Комета достигла планеты! \n\n-${penalty.toFixed(4)} звезд.`;

  setTimeout(() => explosion.remove(), 600);
}

// Запускает анимацию взрыва при клике на комету
function triggerCometClickExplosion(rect) {
  const explosion = document.createElement("div");
  explosion.classList.add("comet-click-explosion");
  const containerRect = container.getBoundingClientRect();
  explosion.style.left = `${rect.left - containerRect.left - 10}px`;
  explosion.style.top = `${rect.top - containerRect.top - 10}px`;
  container.appendChild(explosion);
  setTimeout(() => explosion.remove(), 500);
}

// Планирует появление кометы через случайные интервалы (от 1 до 10 секунд)
function scheduleComet() {
  const randomInterval = Math.random() * (30000 - 10000) + 10000;
  setTimeout(() => {
    spawnComet();
    scheduleComet();
  }, randomInterval);
}
scheduleComet();

// Отправка данных в Telegram при закрытии приложения
function sendDataToTelegram() {
  const data = {
    stars: currentStars.toFixed(3),
    energy: energy,
    clicks: totalClicks,
    planet: planet
  };
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.sendData(JSON.stringify(data));
  } else {
    console.log("Telegram WebApp API не доступен. Данные:", data);
  }
}

// Обработчик кнопки "Закрыть"
closeBtn.addEventListener("click", () => {
  sendDataToTelegram();
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.close();
  } else {
    console.log("Закрытие мини-приложения недоступно.");
  }
});

// Отправка данных при попытке закрытия страницы
window.addEventListener("beforeunload", sendDataToTelegram);

// Предотвращение скроллинга на мобильных устройствах
document.addEventListener('touchmove', (event) => {
  event.preventDefault();
}, { passive: false });
