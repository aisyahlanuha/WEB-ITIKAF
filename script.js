const RAMADHAN_DATES = [
  "21 Ramadhan",
  "22 Ramadhan",
  "23 Ramadhan",
  "24 Ramadhan",
  "25 Ramadhan",
  "26 Ramadhan",
  "27 Ramadhan",
  "28 Ramadhan",
  "29 Ramadhan",
  "30 Ramadhan",
];

const AGE_GROUPS = [
  "0-5 Tahun",
  "6-12 Tahun",
  "13-18 Tahun",
  "19-25 Tahun",
  "26-35 Tahun",
  "36-45 Tahun",
  "46-55 Tahun",
  "56-65 Tahun",
  "66 Tahun Keatas",
];

const STORAGE_KEY = "itikaf-registrations";
const PRICE = 25000;

const individuTanggal = document.getElementById("individu-tanggal");
const rombonganTanggal = document.getElementById("rombongan-tanggal");
const rombonganUsia = document.getElementById("rombongan-usia");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

function createCheckboxes(container) {
  RAMADHAN_DATES.forEach((date) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = date;
    label.appendChild(input);
    label.append(date);
    container.appendChild(label);
  });
}

function createAgeInputs(container) {
  AGE_GROUPS.forEach((group) => {
    const wrapper = document.createElement("div");
    wrapper.className = "age-item";
    const label = document.createElement("label");
    label.textContent = group;
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.placeholder = "Jumlah";
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    container.appendChild(wrapper);
  });
}

createCheckboxes(individuTanggal);
createCheckboxes(rombonganTanggal);
createAgeInputs(rombonganUsia);

const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));
    button.classList.add("active");
    const target = document.getElementById(`tab-${button.dataset.tab}`);
    if (target) {
      target.classList.add("active");
    }
  });
});

function getSelectedDates(container) {
  return Array.from(container.querySelectorAll("input:checked")).map(
    (input) => input.value
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateIndividuTotal() {
  const nights = getSelectedDates(individuTanggal).length;
  const infaq = Number(document.getElementById("individu-infaq").value) || 0;
  const total = nights * PRICE + infaq;
  document.getElementById("individu-total").textContent = formatCurrency(total);
}

function calculateRombonganTotal() {
  const nights = getSelectedDates(rombonganTanggal).length;
  const count = Number(document.getElementById("rombongan-jumlah").value) || 0;
  const infaq = Number(document.getElementById("rombongan-infaq").value) || 0;
  const total = nights * count * PRICE + infaq;
  document.getElementById("rombongan-total").textContent = formatCurrency(total);
}

[individuTanggal, document.getElementById("individu-infaq")].forEach((el) => {
  el.addEventListener("change", calculateIndividuTotal);
});

document
  .getElementById("rombongan-jumlah")
  .addEventListener("input", calculateRombonganTotal);

[rombonganTanggal, document.getElementById("rombongan-infaq")].forEach((el) => {
  el.addEventListener("change", calculateRombonganTotal);
});

function loadRegistrations() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveRegistrations(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateCode(prefix) {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${Date.now().toString().slice(-6)}-${random}`;
}

function renderResult(container, data) {
  container.classList.add("active");
  container.innerHTML = `
    <strong>Pendaftaran berhasil!</strong>
    <p>Kode unik: <strong>${data.code}</strong></p>
    <p>QR: gunakan untuk check-in malam i'tikaf.</p>
    <img alt="QR ${data.code}" src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
      data.code
    )}" />
  `;
}

function updateChart() {
  const chart = document.getElementById("chart-bars");
  const registrations = loadRegistrations();
  const counts = RAMADHAN_DATES.reduce((acc, date) => {
    acc[date] = 0;
    return acc;
  }, {});

  registrations.forEach((entry) => {
    entry.dates.forEach((date) => {
      if (counts[date] !== undefined) {
        counts[date] += entry.type === "rombongan" ? entry.count : 1;
      }
    });
  });

  chart.innerHTML = "";
  RAMADHAN_DATES.forEach((date) => {
    const value = counts[date];
    const ratio = Math.min(value / 900, 1);
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.innerHTML = `
      <label>${date}</label>
      <div class="bar-track">
        <div class="bar-fill ${value > 900 ? "over" : ""}" style="width: ${
      ratio * 100
    }%"></div>
      </div>
      <span>${value}</span>
    `;
    chart.appendChild(bar);
  });
}

function renderCalendars() {
  const feb = document.getElementById("calendar-feb");
  const mar = document.getElementById("calendar-mar");
  const febDays = 28;
  const marDays = 31;

  function fillCalendar(container, days, startHighlight, endHighlight, month) {
    container.innerHTML = "";
    for (let day = 1; day <= days; day += 1) {
      const cell = document.createElement("div");
      const isHighlighted =
        (month === "feb" && day >= startHighlight) ||
        (month === "mar" && day <= endHighlight);
      cell.className = `day ${isHighlighted ? "highlight" : ""}`;
      cell.textContent = day;
      container.appendChild(cell);
    }
  }

  fillCalendar(feb, febDays, 18, 28, "feb");
  fillCalendar(mar, marDays, 1, 20, "mar");
}

function renderSearchResults(query) {
  const results = document.getElementById("search-results");
  const tagList = document.getElementById("night-tags");
  const registrations = loadRegistrations();
  const filtered = registrations.filter((entry) =>
    entry.name.toLowerCase().includes(query.toLowerCase())
  );

  results.innerHTML = "";
  tagList.innerHTML = "";

  if (!query) {
    results.innerHTML = "<p>Masukkan nama untuk melihat data.</p>";
    return;
  }

  if (!filtered.length) {
    results.innerHTML = "<p>Data tidak ditemukan.</p>";
    return;
  }

  filtered.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "result-card";
    card.innerHTML = `
      <strong>${entry.name}</strong>
      <p>Jenis: ${entry.type}</p>
      <p>Jumlah Malam: ${entry.dates.length}</p>
      <p>Jumlah Jamaah: ${entry.count}</p>
      <p>Kode: ${entry.code}</p>
    `;
    results.appendChild(card);

    entry.dates.forEach((date) => {
      const tag = document.createElement("div");
      tag.className = "tag";
      tag.textContent = date;
      tagList.appendChild(tag);
    });
  });
}

function downloadData() {
  const data = loadRegistrations();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "data-registrasi-itikaf.json";
  link.click();
  URL.revokeObjectURL(url);
}

function validateDates(dates, container) {
  if (!dates.length) {
    container.textContent = "Pilih minimal 1 tanggal i'tikaf.";
    container.classList.add("active");
    return false;
  }
  return true;
}

function handleIndividuSubmit(event) {
  event.preventDefault();
  const dates = getSelectedDates(individuTanggal);
  const result = document.getElementById("individu-result");
  result.classList.remove("active");

  if (!validateDates(dates, result)) {
    return;
  }

  const entry = {
    type: "individu",
    name: document.getElementById("individu-nama").value.trim(),
    address: document.getElementById("individu-alamat").value.trim(),
    phone: document.getElementById("individu-telepon").value.trim(),
    age: document.getElementById("individu-usia").value,
    dates,
    infaq: Number(document.getElementById("individu-infaq").value) || 0,
    count: 1,
    code: generateCode("IND"),
  };

  const data = loadRegistrations();
  data.push(entry);
  saveRegistrations(data);
  renderResult(result, entry);
  updateChart();
  event.target.reset();
  calculateIndividuTotal();
}

function handleRombonganSubmit(event) {
  event.preventDefault();
  const dates = getSelectedDates(rombonganTanggal);
  const result = document.getElementById("rombongan-result");
  result.classList.remove("active");

  if (!validateDates(dates, result)) {
    return;
  }

  const ageCounts = Array.from(rombonganUsia.querySelectorAll("input")).map(
    (input, index) => ({
      group: AGE_GROUPS[index],
      count: Number(input.value) || 0,
    })
  );

  const entry = {
    type: "rombongan",
    name: document.getElementById("rombongan-penanggung").value.trim(),
    count: Number(document.getElementById("rombongan-jumlah").value) || 0,
    members: document.getElementById("rombongan-nama").value.trim(),
    address: document.getElementById("rombongan-alamat").value.trim(),
    region: document.getElementById("rombongan-daerah").value.trim(),
    institution: document.getElementById("rombongan-instansi").value.trim(),
    phone: document.getElementById("rombongan-telepon").value.trim(),
    ageGroups: ageCounts,
    dates,
    infaq: Number(document.getElementById("rombongan-infaq").value) || 0,
    code: generateCode("ROM"),
  };

  const data = loadRegistrations();
  data.push(entry);
  saveRegistrations(data);
  renderResult(result, entry);
  updateChart();
  event.target.reset();
  calculateRombonganTotal();
}

function init() {
  renderCalendars();
  updateChart();
  calculateIndividuTotal();
  calculateRombonganTotal();

  document
    .getElementById("form-individu")
    .addEventListener("submit", handleIndividuSubmit);
  document
    .getElementById("form-rombongan")
    .addEventListener("submit", handleRombonganSubmit);

  document
    .getElementById("search-input")
    .addEventListener("input", (event) =>
      renderSearchResults(event.target.value)
    );

  document
    .getElementById("download-data")
    .addEventListener("click", downloadData);
}

init();
