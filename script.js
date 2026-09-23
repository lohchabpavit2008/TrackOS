function startTracking() {
    document.getElementById("logForm").style.display = "block";
}

function saveLog() {
    const activity = document.getElementById("activity").value;
    const date = document.getElementById("date").value;
    const hours = document.getElementById("hours").value;
    const status = document.getElementById("status").value;

    if (activity === "" || date === "" || hours === "") {
        alert("Please fill all details!");
        return;
    }

    const logs = document.getElementById("logs");
    const noLogs = document.getElementById("noLogs");

    if (noLogs) {
        noLogs.remove();
    }

    const logItem = document.createElement("div");

    logItem.className = "log-item";

    logItem.innerHTML = `
        <strong>${activity}</strong>
        <p>Date: ${date}</p>
        <p>Hours: ${hours}</p>
        <p>Status: ${status}</p>
    `;

    logs.appendChild(logItem);

    document.getElementById("activity").value = "";
    document.getElementById("date").value = "";
    document.getElementById("hours").value = "";
    document.getElementById("status").value = "Completed";
}