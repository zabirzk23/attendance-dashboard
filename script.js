document.addEventListener("DOMContentLoaded", () => {

  // Hide app until login
  document.querySelector(".layout").style.display = "none";
  document.querySelector(".navbar").style.display = "none";

  // Auto login if saved
  if (localStorage.getItem("loggedIn") === "true") {
    document.getElementById("login").style.display = "none";
    document.querySelector(".layout").style.display = "flex";
    document.querySelector(".navbar").style.display = "flex";
  }

  // Apply saved theme
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
  const savedThreshold = localStorage.getItem("threshold");
if (savedThreshold) {
  document.getElementById("thresholdInput").value = savedThreshold;
}
});

let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
let chart;

function getThreshold() {
  return parseInt(localStorage.getItem("threshold")) || 80;
}

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
  let name = document.getElementById("subjectName").value.trim();
  let total = parseInt(document.getElementById("total").value);
  let attended = parseInt(document.getElementById("attended").value);

  if (!name || isNaN(total) || isNaN(attended) || attended > total) {
    showToast("Invalid input");
    return;
  }

  subjects.push({ name, total, attended });
  saveData();

  document.getElementById("subjectName").value = "";
  document.getElementById("total").value = "";
  document.getElementById("attended").value = "";

  showToast("Subject added");
  displaySubjects();
  updateDashboard();
}

function deleteSubject(index) {
  subjects.splice(index, 1);
  saveData();
  showToast("Deleted");
  displaySubjects();
  updateDashboard();
}

function confirmDelete(index) {
  if (confirm("Delete subject?")) {
    deleteSubject(index);
  }
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

  if (subjects.length === 0) {
    list.innerHTML = "<p>No subjects yet</p>";
    return;
  }

  const required = getThreshold() / 100;

  subjects.forEach((sub, index) => {

    let percent = ((sub.attended / sub.total) * 100).toFixed(2);
    let statusColor = percent >= getThreshold() ? "green" : "red";

    let bunkLimit = Math.floor((sub.attended - required * sub.total) / required);
    if (bunkLimit < 0) bunkLimit = 0;

    let needed = Math.ceil((required * sub.total - sub.attended) / (1 - required));
    if (needed < 0) needed = 0;

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

        <p>Safe Bunks Remaining: ${bunkLimit} hours</p>
        <p>Classes needed: ${needed} hours</p>

        <button onclick="editSubject(${index})">Edit</button>
        <button onclick="confirmDelete(${index})" style="background:#ef4444;">
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

  const threshold = getThreshold();

  subjects.forEach(sub => {

    totalClasses += sub.total;
    totalAttended += sub.attended;

    let percent = ((sub.attended / sub.total) * 100).toFixed(2);
    let color = percent >= threshold ? "green" : "red";

    html += `
      <div class="subject-card">
        <h3>${sub.name}</h3>
        <p>Attendance: <span style="color:${color}">
          ${percent}%
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
        style="width:${overall}%; background:${overall >= threshold ? 'green' : 'red'}">
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

function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

function openSettings() {
  document.getElementById("settingsModal").classList.toggle("hidden");
}

function saveSettings() {
  const threshold = document.getElementById("thresholdInput").value;
  localStorage.setItem("threshold", threshold);
  updateDashboard();
  displaySubjects();
  alert("Settings saved!");
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Attendance Report", 20, 20);

  let y = 40;

  subjects.forEach(sub => {
    const percent = ((sub.attended / sub.total) * 100).toFixed(2);
    doc.text(`${sub.name}: ${percent}%`, 20, y);
    y += 10;
  });

  doc.save("report.pdf");
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

function login() {
  localStorage.setItem("loggedIn", "true");
  document.getElementById("login").style.display = "none";
  document.querySelector(".layout").style.display = "flex";
  document.querySelector(".navbar").style.display = "flex";
}

window.addEventListener("beforeinstallprompt", () => {
  console.log("Install available");
});

showDashboard();