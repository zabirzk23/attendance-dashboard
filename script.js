let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
let chart;

function saveData() {
    localStorage.setItem("subjects", JSON.stringify(subjects));
}

function hideAll() {
    document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
}

function showDashboard() {
    hideAll();
    document.getElementById("dashboard").classList.remove("hidden");
    updateDashboard();
}

function showSubjects() {
    hideAll();
    document.getElementById("subjects").classList.remove("hidden");
    displaySubjects();
}

function showAnalytics() {
    hideAll();
    document.getElementById("analytics").classList.remove("hidden");
    drawChart();
}

function addSubject() {
    let name = document.getElementById("subjectName").value;
    let total = parseInt(document.getElementById("total").value);
    let attended = parseInt(document.getElementById("attended").value);

    if (!name || isNaN(total) || isNaN(attended) || attended > total) return;

    subjects.push({ name, total, attended });
    saveData();
    displaySubjects();
    updateDashboard();
}

function deleteSubject(index) {
    subjects.splice(index, 1);
    saveData();
    displaySubjects();
    updateDashboard();
}

function editSubject(index) {
    let newTotal = prompt("Enter new total classes:");
    let newAttended = prompt("Enter new attended classes:");

    if (newTotal && newAttended) {
        subjects[index].total = parseInt(newTotal);
        subjects[index].attended = parseInt(newAttended);
        saveData();
        displaySubjects();
        updateDashboard();
    }
}

function displaySubjects() {
    let list = document.getElementById("subjectList");
    list.innerHTML = "";

    subjects.forEach((sub, index) => {

        let percent = ((sub.attended / sub.total) * 100).toFixed(2);
        let required = 80;

        let statusColor = percent >= required ? "green" : "red";

        let bunkLimit = Math.floor((sub.attended - 0.8 * sub.total) / 0.8);
        if (bunkLimit < 0) bunkLimit = 0;

        list.innerHTML += `
            <div class="subject-card">
                <h3>${sub.name}</h3>
                <p>Present: ${sub.attended}</p>
                <p>Total: ${sub.total}</p>
                <p style="color:${statusColor}">
                    Attendance: ${percent}%
                </p>

                <div class="progress-bar">
                    <div class="progress-fill" 
                        style="width:${percent}%; background:${statusColor}">
                    </div>
                </div>

                <p>Safe Bunks Remaining: ${bunkLimit}</p>

                <button onclick="editSubject(${index})">Edit</button>
                <button onclick="deleteSubject(${index})" 
                        style="background:#ef4444;">
                        Delete
                </button>
            </div>
        `;
    });
}

function updateDashboard() {

    let totalClasses = 0;
    let totalAttended = 0;

    let html = "";

    subjects.forEach(sub => {

        totalClasses += sub.total;
        totalAttended += sub.attended;

        let percent = ((sub.attended / sub.total) * 100).toFixed(2);
        let status = percent >= 80 ? "Safe" : "Below 80%";
        let color = percent >= 80 ? "green" : "red";

        html += `
            <div class="subject-card">
                <h3>${sub.name}</h3>
                <p>Attendance: <span style="color:${color}">
                    ${percent}% (${status})
                </span></p>

                <div class="progress-bar">
                    <div class="progress-fill"
                         style="width:${percent}%; background:${color}">
                    </div>
                </div>
            </div>
        `;
    });

    let overall = totalClasses
        ? ((totalAttended / totalClasses) * 100).toFixed(2)
        : 0;

    document.getElementById("overallStats").innerHTML = `
        <h2>Overall Attendance: ${overall}%</h2>
        <div class="progress-bar">
            <div class="progress-fill"
                 style="width:${overall}%; background:${overall >= 80 ? 'green' : 'red'}">
            </div>
        </div>
        <hr>
        ${html}
    `;
}

function drawChart() {

    if (chart) chart.destroy();

    let ctx = document.getElementById("attendanceChart");

    let labels = subjects.map(s => s.name);
    let data = subjects.map(s =>
        ((s.attended / s.total) * 100).toFixed(2)
    );

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Attendance %',
                data: data,
                backgroundColor: '#3b82f6'
            }]
        }
    });
}

function clearAll() {
    localStorage.removeItem("subjects");
    subjects = [];
    displaySubjects();
    updateDashboard();
}

showDashboard();