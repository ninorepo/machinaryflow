const qrResult = document.getElementById("qr-result");
const qrInput = document.getElementById("qr-code");
const scanDate = document.getElementById("scan-date");
const form = document.getElementById("data-form");
const historyList = document.getElementById("history-list");
const addBtn = document.getElementById("add-entry");
const submitBtn = document.getElementById("submit-all");

const entries = [];
let currentEditIndex = null;
const html5QrCode = new Html5Qrcode("reader");

function startScanning() {
  Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
      const backCamera = devices.find(d => d.label?.toLowerCase().includes("back"));
      const selectedCamera = backCamera || devices[0];

      html5QrCode.start(
        { deviceId: { exact: selectedCamera.id } },
        { fps: 10, qrbox: 250 },
        qrCodeMessage => {
          qrResult.textContent = qrCodeMessage;
          qrInput.value = qrCodeMessage;
          scanDate.value = new Date().toISOString();
        },
        errorMessage => {
          console.warn("Scan error:", errorMessage);
        }
      ).catch(err => {
        console.error("Camera start failed:", err);
      });
    }
  }).catch(err => {
    console.error("Camera error:", err);
  });
}
startScanning();

// Add or edit entry
addBtn.addEventListener("click", () => {
  const data = Object.fromEntries(new FormData(form));
  if (!data.qrCode) {
    alert("Please scan a QR code.");
    return;
  }

  if (currentEditIndex !== null) {
    entries[currentEditIndex] = data;
    const li = historyList.children[currentEditIndex];
    li.querySelector(".text").textContent = `${data.scanDate} - ${data.qrCode}`;
    currentEditIndex = null;
  } else {
    entries.push(data);
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.className = "text";
    span.textContent = `${data.scanDate} - ${data.qrCode}`;
    li.appendChild(span);

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => {
      for (const key in data) {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) input.value = data[key];
      }
      currentEditIndex = [...historyList.children].indexOf(li);
    };
    li.appendChild(editBtn);

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.onclick = () => {
      const index = [...historyList.children].indexOf(li);
      entries.splice(index, 1);
      historyList.removeChild(li);
    };
    li.appendChild(removeBtn);

    historyList.appendChild(li);
  }

  form.reset();
  qrResult.textContent = "None";
});

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
      alert("Submitted!");
      entries.length = 0;
      historyList.innerHTML = "";
    } else {
      alert("Failed to submit.");
    }
  } catch (err) {
    alert("Error: " + err.message);
  }
});
