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

Html5QrCode.getCameras().then(devices => {
  if (devices && devices.length) {
    // Prefer back camera for mobile devices
    const backCamera = devices.find(device => device.label.toLowerCase().includes('back'));
    const selectedCamera = backCamera || devices[0];  // If no back camera, use the first available camera

    html5QrCode.start(
      selectedCamera.id,
      { fps: 10, qrbox: 250 },
      qrCodeMessage => {
        qrResult.textContent = qrCodeMessage;  // Update the QR result display
        qrInput.value = qrCodeMessage;         // Set the QR code input field
        scanDate.value = new Date().toISOString();  // Set the scan date
        html5QrCode.stop();  // Stop the scanner after the QR code is captured
      }
    );
  }
});

// Add entry to history
addBtn.addEventListener("click", () => {
  const data = Object.fromEntries(new FormData(form));  // Get form data
  if (!data.qrCode) {
    alert("Please scan a QR code first.");
    return;
  }
  entries.push(data);  // Add the new entry to the history

  const li = document.createElement("li");
  li.textContent = `${data.scanDate} - ${data.qrCode}`;
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove";
  removeBtn.onclick = () => {
    const index = [...historyList.children].indexOf(li);
    entries.splice(index, 1);  // Remove the entry from history
    historyList.removeChild(li);
  };
  li.appendChild(removeBtn);
  historyList.appendChild(li);  // Add the entry to the history list

  form.reset();  // Reset the form for the next entry
  qrResult.textContent = "None";  // Clear the QR result display
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
      entries.length = 0;  // Clear entries after successful submission
      historyList.innerHTML = "";  // Clear the history list
    } else {
      alert("Submission failed. Try again.");
    }
  } catch (err) {
    alert("Error submitting data: " + err.message);
  }
});
