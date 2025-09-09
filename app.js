let debts = [];
let currentFilter = "all";
let searchTerm = "";

function save() {
  localStorage.setItem("debts", JSON.stringify(debts));
}

function load() {
  const raw = localStorage.getItem("debts");
  if (raw) debts = JSON.parse(raw);
}

function computeStatus(d) {
  if (d.amount <= 0) return "paid";
  if (d.amount < d.original) return "partial";
  return "unpaid";
}

function render() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  let filtered = debts;
  if (currentFilter !== "all") {
    filtered = filtered.filter(d => computeStatus(d) === currentFilter);
  }

  if (searchTerm.trim() !== "") {
    filtered = filtered.filter(d =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  filtered.forEach(d => {
    const card = document.createElement("div");
    card.className = "card";

    const info = document.createElement("p");
    if (d.amount <= 0) {
      info.textContent = `${d.name} — ✅ To‘langan`;
    } else {
      info.textContent = `${d.name} — Qolgan qarz: ${d.amount} so‘m`;
    }

    const actions = document.createElement("div");
    actions.className = "actions";

    if (d.amount > 0) {
      const partialBtn = document.createElement("button");
      partialBtn.className = "partial-btn";
      partialBtn.textContent = "➗ Qisman to‘lash";
      partialBtn.onclick = () => partialPay(d.id);
      actions.appendChild(partialBtn);

      const payBtn = document.createElement("button");
      payBtn.className = "pay-btn";
      payBtn.textContent = "✅ To‘liq to‘lash";
      payBtn.onclick = () => payFull(d.id);
      actions.appendChild(payBtn);
    } else {
      const unpayBtn = document.createElement("button");
      unpayBtn.className = "unpay-btn";
      unpayBtn.textContent = "❌ Qayta qarz qilish";
      unpayBtn.onclick = () => unpay(d.id);
      actions.appendChild(unpayBtn);
    }

    card.appendChild(info);
    card.appendChild(actions);
    list.appendChild(card);
  });

  updateTabs();
  updateStats();
}

function updateTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn =>
    btn.classList.remove("active")
  );
  const activeBtn = document.querySelector(
    `.tab-btn[data-filter="${currentFilter}"]`
  );
  if (activeBtn) activeBtn.classList.add("active");
}

function updateStats() {
  const total = debts.reduce((sum, d) => sum + d.amount, 0);
  const unpaid = debts
    .filter(d => computeStatus(d) === "unpaid" || computeStatus(d) === "partial")
    .reduce((sum, d) => sum + d.amount, 0);
  const top = debts.sort((a, b) => b.amount - a.amount)[0];

  document.getElementById("totalAmount").textContent = total;
  document.getElementById("unpaidAmount").textContent = unpaid;
  document.getElementById("topDebtor").textContent = top ? top.name : "—";
}

function addDebt() {
  const name = document.getElementById("nameInput").value.trim();
  const amount = parseFloat(document.getElementById("amountInput").value);

  if (!name || isNaN(amount) || amount <= 0) {
    alert("Ism va summa to‘g‘ri kiriting!");
    return;
  }

  let existing = debts.find(
    d => d.name.toLowerCase() === name.toLowerCase()
  );
  if (existing) {
    existing.amount += amount;
    existing.original += amount;
  } else {
    const debt = { id: Date.now(), name, amount, original: amount };
    debts.push(debt);
  }

  save();
  document.getElementById("nameInput").value = "";
  document.getElementById("amountInput").value = "";

  currentFilter = "unpaid";
  render();
}

function payFull(id) {
  const d = debts.find(x => x.id === id);
  if (!d) return;
  d.amount = 0;
  save();
  currentFilter = "paid";
  render();
}

function partialPay(id) {
  const d = debts.find(x => x.id === id);
  if (!d) return;
  const val = parseFloat(prompt("Qancha summa to‘landi?"));
  if (isNaN(val) || val <= 0) return alert("Xato summa!");

  if (val >= d.amount) {
    d.amount = 0;
    currentFilter = "paid";
  } else {
    d.amount -= val;
    currentFilter = "partial";
  }

  save();
  render();
}

function unpay(id) {
  const d = debts.find(x => x.id === id);
  if (!d) return;
  d.amount = d.original;
  currentFilter = "unpaid";
  save();
  render();
}

function setFilter(f) {
  currentFilter = f;
  render();
}

function searchDebts() {
  searchTerm = document.getElementById("searchInput").value;
  render();
}

document.getElementById("addBtn").addEventListener("click", addDebt);
document.getElementById("searchInput").addEventListener("input", searchDebts);

document.querySelectorAll(".tab-btn").forEach(btn => {
  if (btn.id !== "clearPaidBtn") {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      render();
    });
  }
});

document.getElementById("clearPaidBtn").addEventListener("click", () => {
  if (confirm("Hamma to‘langan qarzlarni o‘chirmoqchimisiz?")) {
    debts = debts.filter(d => computeStatus(d) !== "paid");
    save();
    render();
  }
});

load();
render();
