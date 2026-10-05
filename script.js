const API = "https://inai-col1.fishrungames.com";

const listEl = document.getElementById("list");
const listStatus = document.getElementById("listStatus");
const totalEl = document.getElementById("total");
const form = document.getElementById("adForm");
const formStatus = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");
const preview = document.getElementById("preview");

function setStatus(el, text, type) {
  el.textContent = text;
  el.className = "status" + (type ? " " + type : "");
}

function renderAd(ad) {
  const card = document.createElement("article");
  card.className = "card";

  const pic = document.createElement("div");
  pic.className = "pic";
  if (ad.image_url) {
    const img = document.createElement("img");
    img.src = API + ad.image_url;
    img.alt = ad.title;
    img.loading = "lazy";
    pic.appendChild(img);
  } else {
    pic.textContent = "Без фото";
  }

  const body = document.createElement("div");
  body.className = "body";

  const h3 = document.createElement("h3");
  h3.textContent = ad.title;
  const p = document.createElement("p");
  p.textContent = ad.description;
  const price = document.createElement("div");
  price.className = "price";
  price.textContent = Number(ad.price).toLocaleString("ru-RU") + " сом";

  body.append(h3, p, price);
  card.append(pic, body);
  return card;
}

async function loadAds() {
  setStatus(listStatus, "Загружаем объявления…");
  try {
    const res = await fetch(API + "/ads");
    if (!res.ok) throw new Error("Сервер ответил " + res.status);
    const data = await res.json();

    listEl.replaceChildren();
    const items = data.items || [];
    // новые сверху
    items.slice().reverse().forEach(ad => listEl.appendChild(renderAd(ad)));
    totalEl.textContent = "Всего: " + (data.total ?? items.length);
    setStatus(listStatus, items.length ? "" : "Пока нет ни одного объявления. Опубликуйте первое.");
  } catch (e) {
    setStatus(listStatus, "Не удалось загрузить объявления: " + e.message, "err");
  }
}

const imageInput = form.elements["image"];
imageInput.addEventListener("change", () => {
  // Предпросмотр необязателен: если что-то пойдёт не так, отправка всё равно работает
  try {
    const file = imageInput.files && imageInput.files[0];
    if (!file) { preview.style.display = "none"; return; }
    const reader = new FileReader();
    reader.onload = () => {
      preview.src = reader.result;
      preview.style.display = "block";
    };
    reader.onerror = () => { preview.style.display = "none"; };
    reader.readAsDataURL(file);
  } catch (err) {
    preview.style.display = "none";
    console.warn("Предпросмотр недоступен:", err);
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  setStatus(formStatus, "Отправляем…");
  try {
    const res = await fetch(API + "/ads", {
      method: "POST",
      body: new FormData(form) // Content-Type с boundary браузер выставит сам
    });
    if (!res.ok) throw new Error("Сервер ответил " + res.status);
    await res.json();
    form.reset();
    preview.style.display = "none";
    setStatus(formStatus, "Объявление опубликовано.", "ok");
    loadAds();
  } catch (e) {
    setStatus(formStatus, "Не удалось отправить: " + e.message, "err");
  } finally {
    submitBtn.disabled = false;
  }
});

loadAds();
