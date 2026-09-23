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

    alert(
        "Log Saved!\n\n" +
        "Activity: " + activity +
        "\nDate: " + date +
        "\nHours: " + hours +
        "\nStatus: " + status
    );
}