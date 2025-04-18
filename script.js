const qrResult = document.getElementById("qr-result");
const qrInput = document.getElementById("qr-code");
const scanDate = document.getElementById("scan-date");
const form = document.getElementById("data-form");
const historyList = document.getElementById("history-list");
const addBtn = document.getElementById("add-entry");
const submitBtn = document.getElementById("submit-all");

const entries = [];

// Initialize QR Scanner
const html5QrCode = new Html5Qrcode("reader");
Html5Qrcode.getCameras().then(devices => {
  if (devices && devices.length) {
    html5QrCode.start(
      devices[0].id,
      { fps: 10, qrbox: 250 },
      qrCodeMessage => {
        qrResult.textContent = qrCodeMessage;
        qrInput.value = qrCodeMessage;
        scanDate.value = new Date().toISOString();
        html5QrCode.stop();
      }
    );
  }
});

// Add entry to history
addBtn.addEventListener("click", () => {
  const data = Object.fromEntries(new FormData(form));
  if (!data.qrCode) {
    alert("Please scan a QR code first.");
    return;
  }
  entries.push(data);

  const li = document.createElement("li");
  li.textContent = `${data.scanDate} - ${data.qrCode}`;
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove";
  removeBtn.onclick = () => {
    const index = [...historyList.children].indexOf(li);
    entries.splice(index, 1);
    historyList.removeChild(li);
  };
  li.appendChild(removeBtn);
  historyList.appendChild(li);

  form.reset();
  qrResult.textContent = "None";
});

// Submit all entries to Google Sheets
submitBtn.addEventListener("click", async () => {
  if (entries.length === 0) {
    alert("No entries to submit.");
    return;
  }

  try {
    const response = await fetch("YOUR_GOOGLE_APPS_SCRIPT_URL", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries })
    });

    const result = await response.json();
    if (result.result === "success") {
      alert("Data submitted successfully!");
      entries.length = 0;
      historyList.innerHTML = "";
    } else {
      alert("Submission failed. Try again.");
    }
  } catch (err) {
    alert("Error submitting data: " + err.message);
  }
});