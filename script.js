let logsData = JSON.parse(localStorage.getItem("trackosLogs")) || [];
let editingLogId = null;

/* =========================
   PAGE NAVIGATION
========================= */

function showPage(pageId, clickedLink = null) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.add("hidden");
    });

    const page = document.getElementById(pageId);

    if (page) {
        page.classList.remove("hidden");
    }

    document.querySelectorAll(".sidebar a").forEach(link => {
        link.classList.remove("active");
    });

    if (clickedLink) {
        clickedLink.classList.add("active");
    }

    if (pageId === "activityPage") {
        renderActivityPage();
    }

    if (pageId === "analyticsPage") {
        updateAnalytics();
        updateWeeklyChart();
    }
}


/* =========================
   ADD ACTIVITY BUTTON
========================= */

function startTracking() {
    showPage("dashboard");

    const form = document.getElementById("trackingForm");

    if (!form) return;

    form.classList.remove("hidden");
    form.style.display = "block";

    setTimeout(() => {
        form.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }, 100);
}


/* =========================
   SAVE / UPDATE ACTIVITY
========================= */

function saveLog(event) {
    event.preventDefault();

    const activityInput = document.getElementById("activity");
    const dateInput = document.getElementById("date");
    const hoursInput = document.getElementById("hours");
    const statusInput = document.getElementById("status");

    const activity = activityInput.value.trim();
    const date = dateInput.value;
    const hours = Number(hoursInput.value);
    const status = statusInput.value;

    if (!activity || !date || !hours || !status) {
        alert("Please fill all fields.");
        return;
    }

    if (editingLogId !== null) {

        const index = logsData.findIndex(
            log => Number(log.id) === Number(editingLogId)
        );

        if (index !== -1) {
            logsData[index].activity = activity;
            logsData[index].date = date;
            logsData[index].hours = hours;
            logsData[index].status = status;

            alert("Activity updated successfully!");
        }

    } else {

        const newLog = {
            id: Date.now(),
            activity: activity,
            date: date,
            hours: hours,
            status: status
        };

        logsData.push(newLog);

        alert("Activity added successfully!");
    }

    saveData();

    displayLogs();
    updateStats();
    updateAnalytics();
    updateWeeklyChart();
    renderActivityPage();

    clearForm();

    const submitButton = document.querySelector(
        "#trackingForm button[type='submit']"
    );

    if (submitButton) {
        submitButton.textContent = "Save Activity";
    }
}


/* =========================
   LOCAL STORAGE
========================= */

function saveData() {
    localStorage.setItem(
        "trackosLogs",
        JSON.stringify(logsData)
    );
}


/* =========================
   DASHBOARD LOGS
========================= */

function displayLogs() {

    const logsContainer = document.getElementById("logs");

    if (!logsContainer) return;

    logsContainer.innerHTML = "";

    const latestLogs = [...logsData]
        .sort((a, b) => Number(b.id) - Number(a.id))
        .slice(0, 10);

    if (latestLogs.length === 0) {
        logsContainer.innerHTML = `
            <div class="empty-state">
                No activities yet.
            </div>
        `;
        return;
    }

    latestLogs.forEach(log => {
        logsContainer.appendChild(
            createLogElement(log)
        );
    });
}


/* =========================
   CREATE LOG ELEMENT
========================= */

function createLogElement(log) {

    const div = document.createElement("div");

    div.className = "log-item";

    const icon = getActivityIcon(log.activity);

    div.innerHTML = `
        <div class="log-left">
            <div class="log-icon">${icon}</div>

            <div class="log-info">
                <h4>${escapeHTML(log.activity)}</h4>

                <p>
                    ${formatDate(log.date)}
                    • ${formatNumber(log.hours)} hour${log.hours === 1 ? "" : "s"}
                </p>
            </div>
        </div>

        <div class="log-right">

            <span class="status-badge ${log.status.toLowerCase()}">
                ${escapeHTML(log.status)}
            </span>

            <button
                class="edit-btn"
                onclick="editLog(${Number(log.id)})">
                Edit
            </button>

            <button
                class="delete-btn"
                onclick="deleteLog(${Number(log.id)})">
                Delete
            </button>

        </div>
    `;

    return div;
}


/* =========================
   ACTIVITY LOG PAGE
========================= */

function renderActivityPage() {

    const container = document.getElementById("allLogs");

    if (!container) return;

    const searchInput = document.getElementById("searchInput");
    const filterStatus = document.getElementById("filterStatus");

    const searchValue = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

    const filterValue = filterStatus
        ? filterStatus.value
        : "All";

    let filteredLogs = [...logsData];

    if (searchValue) {
        filteredLogs = filteredLogs.filter(log =>
            log.activity
                .toLowerCase()
                .includes(searchValue)
        );
    }

    if (filterValue !== "All") {
        filteredLogs = filteredLogs.filter(
            log => log.status === filterValue
        );
    }

    filteredLogs.sort(
        (a, b) => Number(b.id) - Number(a.id)
    );

    container.innerHTML = "";

    if (filteredLogs.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No matching activities found.
            </div>
        `;

        return;
    }

    filteredLogs.forEach(log => {
        container.appendChild(
            createLogElement(log)
        );
    });
}


/* =========================
   EDIT ACTIVITY
========================= */

function editLog(id) {

    const log = logsData.find(
        item => Number(item.id) === Number(id)
    );

    if (!log) return;

    editingLogId = Number(id);

    showPage("dashboard");

    const form = document.getElementById("trackingForm");

    if (!form) return;

    form.classList.remove("hidden");
    form.style.display = "block";

    document.getElementById("activity").value =
        log.activity;

    document.getElementById("date").value =
        log.date;

    document.getElementById("hours").value =
        log.hours;

    document.getElementById("status").value =
        log.status;

    const submitButton = form.querySelector(
        "button[type='submit']"
    );

    if (submitButton) {
        submitButton.textContent = "Update Activity";
    }

    setTimeout(() => {
        form.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }, 100);
}


/* =========================
   DELETE ACTIVITY
========================= */

function deleteLog(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this activity?"
    );

    if (!confirmDelete) return;

    logsData = logsData.filter(
        log => Number(log.id) !== Number(id)
    );

    saveData();

    displayLogs();
    updateStats();
    updateAnalytics();
    updateWeeklyChart();
    renderActivityPage();
}


/* =========================
   CLEAR FORM
========================= */

function clearForm() {

    const form = document.getElementById("trackingForm");

    if (!form) return;

    form.reset();

    editingLogId = null;

    const submitButton = form.querySelector(
        "button[type='submit']"
    );

    if (submitButton) {
        submitButton.textContent = "Save Activity";
    }
}


/* =========================
   DASHBOARD STATS
========================= */

function updateStats() {

    const totalTasks = logsData.length;

    const totalHours = logsData.reduce(
        (sum, log) => sum + Number(log.hours || 0),
        0
    );

    const completedTasks = logsData.filter(
        log => log.status === "Completed"
    ).length;

    const pendingTasks = logsData.filter(
        log => log.status === "Pending"
    ).length;

    setText("totalTasks", totalTasks);

    setText(
        "totalHours",
        formatNumber(totalHours)
    );

    setText(
        "completedTasks",
        completedTasks
    );

    setText(
        "pendingTasks",
        pendingTasks
    );
}


/* =========================
   ANALYTICS
========================= */

function updateAnalytics() {

    const totalTasks = logsData.length;

    const totalHours = logsData.reduce(
        (sum, log) => sum + Number(log.hours || 0),
        0
    );

    const completedTasks = logsData.filter(
        log => log.status === "Completed"
    ).length;

    const pendingTasks = logsData.filter(
        log => log.status === "Pending"
    ).length;

    const completionRate =
        totalTasks > 0
            ? (completedTasks / totalTasks) * 100
            : 0;


    /* ---------- MAIN ANALYTICS ---------- */

    setText(
        "analyticsTasks",
        totalTasks
    );

    setText(
        "analyticsHours",
        formatNumber(totalHours)
    );

    setText(
        "analyticsCompleted",
        completedTasks
    );

    setText(
        "completionRate",
        Math.round(completionRate) + "%"
    );


    /* ---------- COMPLETION OVERVIEW ---------- */

    setText(
        "completedChartValue",
        completedTasks
    );

    setText(
        "pendingChartValue",
        pendingTasks
    );

    const completedBar =
        document.getElementById("completedBar");

    const pendingBar =
        document.getElementById("pendingBar");

    if (completedBar) {
        completedBar.style.width =
            (totalTasks > 0
                ? (completedTasks / totalTasks) * 100
                : 0) + "%";
    }

    if (pendingBar) {
        pendingBar.style.width =
            (totalTasks > 0
                ? (pendingTasks / totalTasks) * 100
                : 0) + "%";
    }


    /* ---------- TIME OVERVIEW ---------- */

    setText(
        "timeTotalHours",
        formatNumber(totalHours)
    );

    const averageHours =
        totalTasks > 0
            ? totalHours / totalTasks
            : 0;

    setText(
        "averageHours",
        formatNumber(averageHours)
    );


    /* =========================
       MOST PRODUCTIVE DAY
    ========================= */

    const dayHours = {};

    logsData.forEach(log => {

        if (!log.date) return;

        if (!dayHours[log.date]) {
            dayHours[log.date] = 0;
        }

        dayHours[log.date] += Number(log.hours || 0);
    });

    let mostProductiveDay = null;
    let mostProductiveHours = 0;

    Object.keys(dayHours).forEach(date => {

        if (dayHours[date] > mostProductiveHours) {

            mostProductiveHours =
                dayHours[date];

            mostProductiveDay = date;
        }
    });


    if (mostProductiveDay) {

        setText(
            "mostProductiveDay",
            formatDate(mostProductiveDay)
        );

        setText(
            "mostProductiveHours",
            formatNumber(mostProductiveHours) + " hrs"
        );

    } else {

        setText(
            "mostProductiveDay",
            "No data"
        );

        setText(
            "mostProductiveHours",
            "0 hrs"
        );
    }


    /* =========================
       ACTIVE DAYS
    ========================= */

    const uniqueDates = new Set(
        logsData
            .filter(log => log.date)
            .map(log => log.date)
    );

    setText(
        "activeDays",
        uniqueDates.size
    );


    /* =========================
       ACTIVITY BREAKDOWN
    ========================= */

    const activityHours = {};

    logsData.forEach(log => {

        const activity =
            log.activity.trim() || "Other";

        if (!activityHours[activity]) {
            activityHours[activity] = 0;
        }

        activityHours[activity] +=
            Number(log.hours || 0);
    });


    const breakdownContainer =
        document.getElementById(
            "activityBreakdown"
        );

    if (breakdownContainer) {

        breakdownContainer.innerHTML = "";

        const activities =
            Object.entries(activityHours)
                .sort((a, b) => b[1] - a[1]);

        if (activities.length === 0) {

            breakdownContainer.innerHTML = `
                <div class="empty-state">
                    No activity data available.
                </div>
            `;

        } else {

            activities.forEach(
                ([activity, hours]) => {

                    const percentage =
                        totalHours > 0
                            ? (hours / totalHours) * 100
                            : 0;

                    const item =
                        document.createElement("div");

                    item.className =
                        "activity-breakdown-item";

                    item.innerHTML = `
                        <div class="activity-breakdown-top">

                            <span>
                                ${escapeHTML(activity)}
                            </span>

                            <strong>
                                ${formatNumber(hours)} hrs
                            </strong>

                        </div>

                        <div class="activity-breakdown-bar">
                            <div
                                class="activity-breakdown-fill"
                                style="width:${percentage}%">
                            </div>
                        </div>

                        <div class="activity-breakdown-percent">
                            ${Math.round(percentage)}%
                        </div>
                    `;

                    breakdownContainer.appendChild(item);
                }
            );
        }
    }


    /* =========================
       WEEKLY TOTAL
    ========================= */

    const weeklyTotal =
        getWeeklyTotalHours();

    setText(
        "weeklyTotalHours",
        formatNumber(weeklyTotal)
    );
}


/* =========================
   WEEKLY CHART
========================= */

function updateWeeklyChart() {

    const barsContainer =
        document.getElementById("weeklyBars");

    const labelsContainer =
        document.getElementById("weeklyLabels");

    if (!barsContainer || !labelsContainer) {
        return;
    }

    barsContainer.innerHTML = "";
    labelsContainer.innerHTML = "";


    const today = new Date();

    const days = [];

    for (let i = 6; i >= 0; i--) {

        const date = new Date(today);

        date.setHours(0, 0, 0, 0);

        date.setDate(
            today.getDate() - i
        );

        const dateString =
            date.toISOString().split("T")[0];

        const hours =
            logsData
                .filter(log => log.date === dateString)
                .reduce(
                    (sum, log) =>
                        sum + Number(log.hours || 0),
                    0
                );

        days.push({
            date: date,
            dateString: dateString,
            hours: hours
        });
    }


    const maxHours =
        Math.max(
            ...days.map(day => day.hours),
            1
        );


    days.forEach(day => {

        const column =
            document.createElement("div");

        column.className =
            "weekly-bar-column";

        const bar =
            document.createElement("div");

        bar.className =
            "weekly-bar";

        const height =
            (day.hours / maxHours) * 100;

        bar.style.height =
            height + "%";

        bar.title =
            formatNumber(day.hours) + " hours";

        const value =
            document.createElement("span");

        value.className =
            "weekly-bar-value";

        value.textContent =
            formatNumber(day.hours);

        bar.appendChild(value);

        column.appendChild(bar);

        barsContainer.appendChild(column);


        const label =
            document.createElement("span");

        label.className =
            "weekly-label";

        label.textContent =
            day.date.toLocaleDateString(
                "en-US",
                { weekday: "short" }
            );

        labelsContainer.appendChild(label);
    });
}


/* =========================
   WEEKLY TOTAL CALCULATION
========================= */

function getWeeklyTotalHours() {

    const today = new Date();

    const startDate =
        new Date(today);

    startDate.setHours(0, 0, 0, 0);

    startDate.setDate(
        today.getDate() - 6
    );

    return logsData
        .filter(log => {

            if (!log.date) return false;

            const logDate =
                new Date(log.date + "T00:00:00");

            return logDate >= startDate &&
                   logDate <= today;
        })
        .reduce(
            (sum, log) =>
                sum + Number(log.hours || 0),
            0
        );
}


/* =========================
   HELPER FUNCTIONS
========================= */

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


function formatNumber(number) {

    return Number(number).toFixed(1)
        .replace(".0", "");
}


function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


function getActivityIcon(activity) {

    const value =
        activity.toLowerCase();

    if (
        value.includes("study") ||
        value.includes("class") ||
        value.includes("college")
    ) {
        return "📚";
    }

    if (
        value.includes("gym") ||
        value.includes("workout") ||
        value.includes("exercise")
    ) {
        return "🏋️";
    }

    if (
        value.includes("coding") ||
        value.includes("code") ||
        value.includes("program")
    ) {
        return "💻";
    }

    if (
        value.includes("sleep")
    ) {
        return "😴";
    }

    if (
        value.includes("work") ||
        value.includes("job")
    ) {
        return "💼";
    }

    return "📌";
}


function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   SEARCH + FILTER
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const searchInput =
            document.getElementById(
                "searchInput"
            );

        const filterStatus =
            document.getElementById(
                "filterStatus"
            );

        if (searchInput) {
            searchInput.addEventListener(
                "input",
                renderActivityPage
            );
        }

        if (filterStatus) {
            filterStatus.addEventListener(
                "change",
                renderActivityPage
            );
        }


        displayLogs();
        updateStats();
        updateAnalytics();
        updateWeeklyChart();
        renderActivityPage();


        const form =
            document.getElementById(
                "trackingForm"
            );

        if (form) {
            form.classList.add("hidden");
            form.style.display = "none";
        }
    }
);
// TrackOS user name
const savedUserName = localStorage.getItem("trackosName");

if (!savedUserName) {
    const userName = prompt("Welcome to TrackOS! What's your name?");

    if (userName && userName.trim() !== "") {
        localStorage.setItem("trackosName", userName.trim());

        const greeting = document.getElementById("greeting");

        if (greeting) {
            greeting.textContent = "Good evening, " + userName.trim() + " 👋";
        }
    }
} else {
    const greeting = document.getElementById("greeting");

    if (greeting) {
        greeting.textContent = "Good evening, " + savedUserName + " 👋";
    }
}