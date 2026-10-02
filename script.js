const STORAGE_KEY = "siswa";

const form = document.getElementById("note-form");
const noteInput = document.getElementById("note");
const labelInput = document.getElementById("label");
const historyList = document.getElementById("data-tampil");
const statusText = document.getElementById("hasil");
const deleteAllButton = document.getElementById("delete-all");

function readNotes() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null) {
    return [];
  }

  const notes = JSON.parse(saved);
  if (
    !Array.isArray(notes) ||
    notes.some(
      (item) =>
        !item ||
        typeof item.note !== "string" ||
        typeof item.label !== "string",
    )
  ) {
    throw new Error("Format data histori tidak valid.");
  }

  return notes;
}

function showError(error) {
  console.error("Gagal mengakses Local Storage:", error);
  statusText.textContent =
    "Data tidak dapat diproses. Periksa izin penyimpanan browser atau hapus semua data.";
  statusText.classList.add("error");
}

function renderNotes() {
  historyList.replaceChildren();
  statusText.classList.remove("error");

  let notes;
  try {
    notes = readNotes();
  } catch (error) {
    showError(error);
    return;
  }

  if (notes.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent =
      "Belum ada catatan. Tambahkan catatan pertamamu di atas.";
    historyList.appendChild(emptyItem);
    statusText.textContent = "0 catatan tersimpan";
    return;
  }

  notes.forEach((item, index) => {
    const listItem = document.createElement("li");
    listItem.className = "history-item";

    const detail = document.createElement("span");
    detail.className = "history-detail";
    detail.textContent = item.note;

    const label = document.createElement("span");
    label.className = "note-label";
    label.textContent = item.label;

    const textGroup = document.createElement("div");
    textGroup.className = "history-text";
    textGroup.append(detail, label);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-one";
    deleteButton.dataset.index = String(index);
    deleteButton.textContent = "Hapus";
    deleteButton.setAttribute("aria-label", `Hapus catatan ${item.note}`);

    listItem.append(textGroup, deleteButton);
    historyList.appendChild(listItem);
  });

  statusText.textContent = `${notes.length} catatan tersimpan`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const note = noteInput.value.trim();
  const label = labelInput.value;
  if (!note || !label) {
    statusText.textContent = "Mohon isi catatan dan pilih keterangannya.";
    statusText.classList.add("error");
    return;
  }

  try {
    const notes = readNotes();
    notes.push({ note, label });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    form.reset();
    renderNotes();
  } catch (error) {
    showError(error);
  }
});

historyList.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest(".delete-one");
  if (!button || !historyList.contains(button)) {
    return;
  }

  if (!window.confirm("Yakin ingin menghapus catatan ini?")) {
    return;
  }

  try {
    const notes = readNotes();
    const index = Number(button.dataset.index);
    if (!Number.isInteger(index) || index < 0 || index >= notes.length) {
      throw new Error("Catatan yang dipilih tidak ditemukan.");
    }

    notes.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    renderNotes();
  } catch (error) {
    showError(error);
  }
});

deleteAllButton.addEventListener("click", () => {
  let notes;
  try {
    notes = readNotes();
  } catch (error) {
    showError(error);
    return;
  }

  if (notes.length === 0) {
    renderNotes();
    return;
  }

  if (!window.confirm("Yakin ingin menghapus semua catatan?")) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    renderNotes();
  } catch (error) {
    showError(error);
  }
});

renderNotes();
