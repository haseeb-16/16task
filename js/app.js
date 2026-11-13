

const elements = {
    total: document.querySelector("#total-count"),
    completed: document.querySelector("#completed-count"),
    progress: document.querySelector("#progress-count"),
    pending: document.querySelector("#pending-count"),
    list: document.querySelector("#assignment-list"),
    search: document.querySelector("#search-input"),
    filter: document.querySelector("#status-filter"),
    count: document.querySelector("#assignment-count"),
    status: document.querySelector("#status-message"),
    empty: document.querySelector("#empty-state"),
    theme: document.querySelector("#theme-toggle"),
    sidebar: document.querySelector("#sidebar"),
    menu: document.querySelector("#menu-toggle"),
    modal: document.querySelector("#application-modal"),
    toast: document.querySelector("#toast"),
    form: document.querySelector("#application-form")
};

let assignments = [];

function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("toast--visible");

    setTimeout(() => {
        elements.toast.classList.remove("toast--visible");
    }, 2500);
}

function updateStatistics(data) {
    elements.total.textContent = data.length;

    elements.completed.textContent =
        data.filter(item => item.status === "Completed").length;

    elements.progress.textContent =
        data.filter(item => item.status === "In Progress").length;

    elements.pending.textContent =
        data.filter(item => item.status === "Pending").length;
}

function getStatusClass(status) {
    const classes = {
        "Completed": "completed",
        "In Progress": "progress",
        "Pending": "pending"
    };

    return classes[status] || "pending";
}

function renderAssignments(data) {
    elements.list.replaceChildren();

    data.forEach(assignment => {
        const row = document.createElement("tr");

        const title = document.createElement("td");
        title.textContent = assignment.title;

        const dueDate = document.createElement("td");
        dueDate.textContent = assignment.dueDate;

        const progress = document.createElement("td");
        progress.textContent = `${assignment.progress}%`;

        const status = document.createElement("td");
        const badge = document.createElement("span");

        badge.className =
            `status-badge status-badge--${getStatusClass(assignment.status)}`;

        badge.textContent = assignment.status;

        status.append(badge);
        row.append(title, dueDate, progress, status);

        elements.list.append(row);
    });

    elements.count.textContent = `${data.length} results`;
    elements.empty.hidden = data.length !== 0;
}

function filterAssignments() {
    const searchText = elements.search.value.toLowerCase();
    const selectedStatus = elements.filter.value;

    const filtered = assignments.filter(item => {
        const matchesSearch =
            item.title.toLowerCase().includes(searchText);

        const matchesStatus =
            selectedStatus === "all" ||
            item.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    renderAssignments(filtered);
}

async function loadAssignments() {
    elements.status.textContent = "Loading assignments...";

    try {
        const response = await fetch("/data/assignments.json");

        if (!response.ok) {
            throw new Error("Unable to load assignment data.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid assignment data.");
        }

        assignments = data;
        updateStatistics(assignments);
        filterAssignments();

        elements.status.textContent = "Assignments loaded successfully.";
    } catch (error) {
        elements.status.textContent = error.message;
        showToast("Could not load assignments.");
    }
}

// Search and filter
elements.search.addEventListener("input", filterAssignments);
elements.filter.addEventListener("change", filterAssignments);

// Theme switching with saved preference
const savedTheme = localStorage.getItem("internhub-theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
}

elements.theme.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");

    const theme = document.body.classList.contains("dark-theme")
        ? "dark"
        : "light";

    localStorage.setItem("internhub-theme", theme);
});

// Mobile sidebar
elements.menu.addEventListener("click", () => {
    const isOpen = elements.sidebar.classList.toggle("sidebar--open");

    elements.menu.setAttribute("aria-expanded", String(isOpen));
});

// Modal
document.querySelector("#open-modal").addEventListener("click", () => {
    elements.modal.showModal();
});

document.querySelector("#close-modal").addEventListener("click", () => {
    elements.modal.close();
});

document.querySelector("#modal-done").addEventListener("click", () => {
    elements.modal.close();
});

// Close modal when clicking outside its content
elements.modal.addEventListener("click", event => {
    if (event.target === elements.modal) {
        elements.modal.close();
    }
});

// Application form
elements.form.addEventListener("submit", event => {
    event.preventDefault();

    if (!elements.form.reportValidity()) {
        return;
    }

    const formData = new FormData(elements.form);
    const application = Object.fromEntries(formData.entries());

    console.log("Application submitted:", application);

    elements.form.reset();
    elements.modal.close();

    showToast("Application submitted successfully!");
});

// Load data
loadAssignments();
