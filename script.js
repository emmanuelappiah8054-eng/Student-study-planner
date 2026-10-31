
/* ==========================================
   ATU STUDY PLANNER
   COMPLETE TASK MANAGEMENT JAVASCRIPT
========================================== */

"use strict";

// ==========================================
// 1. GET HTML ELEMENTS
// ==========================================

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const taskTitle = document.getElementById("taskTitle");
const taskSubject = document.getElementById("taskSubject");
const taskDate = document.getElementById("taskDate");
const taskPriority = document.getElementById("taskPriority");
const taskCategory = document.getElementById("taskCategory");

const editId = document.getElementById("editId");
const errorMessage = document.getElementById("errorMessage");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");
const emptyMessage = document.getElementById("emptyMessage");

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const clearCompleted = document.getElementById("clearCompleted");
const themeButton = document.getElementById("themeButton");

// ==========================================
// 2. LOAD PREVIOUSLY SAVED TASKS
// ==========================================

function loadTasks() {
    try {
        const savedTasks = JSON.parse(
            localStorage.getItem("atuStudyTasks")
        );

        return Array.isArray(savedTasks) ? savedTasks : [];

    } catch (error) {
        console.error("Error loading tasks:", error);
        return [];
    }
}

let tasks = loadTasks();
let currentFilter = "all";

// ==========================================
// 3. SAVE TASKS IN LOCAL STORAGE
// ==========================================

function saveTasks() {
    localStorage.setItem(
        "atuStudyTasks",
        JSON.stringify(tasks)
    );
}

// ==========================================
// 4. VALIDATION MESSAGE
// ==========================================

function showError(message) {
    errorMessage.textContent = message;
}

function clearError() {
    errorMessage.textContent = "";
}

// ==========================================
// 5. ADD NEW TASK OR UPDATE EXISTING TASK
// ==========================================

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();
    clearError();

    const title = taskTitle.value.trim();
    const subject = taskSubject.value.trim();

    // REQUIREMENT 1:
    // Reject a task without a title.

    if (title === "") {
        showError("Task title is required. Please enter a title.");
        taskTitle.focus();
        return;
    }

    if (subject === "") {
        showError("Please enter the subject or course name.");
        taskSubject.focus();
        return;
    }

    // Check whether the user is editing a task.
    const editingId = editId.value;

    if (editingId !== "") {

        const task = tasks.find(
            item => String(item.id) === String(editingId)
        );

        if (!task) {
            showError("Task not found. Please try again.");
            resetForm();
            return;
        }

        // Update existing task.
        task.title = title;
        task.subject = subject;
        task.date = taskDate.value;
        task.priority = taskPriority.value;
        task.category = taskCategory.value;

    } else {

        // Create a new task.
        const newTask = {
            id: Date.now() + Math.random(),
            title: title,
            subject: subject,
            date: taskDate.value,
            priority: taskPriority.value,
            category: taskCategory.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);
    }

    // Save changes.
    saveTasks();

    // Clear the form and refresh the task list.
    resetForm();
    displayTasks();
});

// ==========================================
// 6. RESET TASK FORM
// ==========================================

function resetForm() {

    taskForm.reset();
    editId.value = "";

    submitButton.textContent = "+ Add Study Task";
    cancelButton.hidden = true;

    clearError();
}

// Cancel editing.
cancelButton.addEventListener("click", resetForm);

// ==========================================
// 7. EDIT TASK
// ==========================================

function editTask(id) {

    const task = tasks.find(
        item => String(item.id) === String(id)
    );

    if (!task) return;

    editId.value = task.id;

    taskTitle.value = task.title || "";
    taskSubject.value = task.subject || "";
    taskDate.value = task.date || "";
    taskPriority.value = task.priority || "Medium";
    taskCategory.value = task.category || "Assignment";

    submitButton.textContent = "Save Changes";
    cancelButton.hidden = false;

    clearError();

    taskForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    taskTitle.focus();
}

// ==========================================
// 8. MARK TASK COMPLETE OR INCOMPLETE
// ==========================================

function toggleTask(id) {

    const task = tasks.find(
        item => String(item.id) === String(id)
    );

    if (!task) return;

    // REQUIREMENT 2 AND 3:
    // Change complete to incomplete and
    // incomplete to complete when clicked.

    task.completed = !task.completed;

    // Save the new status.
    saveTasks();

    // Update the task list and statistics.
    displayTasks();
}

// ==========================================
// 9. DELETE TASK
// ==========================================

function deleteTask(id) {

    const task = tasks.find(
        item => String(item.id) === String(id)
    );

    if (!task) return;

    // REQUIREMENT 4:
    // Remove the selected task.

    tasks = tasks.filter(
        item => String(item.id) !== String(id)
    );

    // Save the updated task list.
    saveTasks();

    // Cancel editing if the deleted task was being edited.
    if (String(editId.value) === String(id)) {
        resetForm();
    }

    // Refresh the display.
    displayTasks();
}

// ==========================================
// 10. CHECK OVERDUE TASKS
// ==========================================

function getTodayString() {

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function isOverdue(task) {

    return task.date &&
        task.date < getTodayString() &&
        !task.completed;
}

// ==========================================
// 11. FORMAT DUE DATE
// ==========================================

function formatDate(dateString) {

    if (!dateString) {
        return "No due date";
    }

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// ==========================================
// 12. DISPLAY TASKS
// ==========================================

function displayTasks() {

    taskList.innerHTML = "";

    const visibleTasks = getFilteredTasks();

    visibleTasks.forEach(task => {

        const taskItem = document.createElement("div");

        const priority = (task.priority || "Medium").toLowerCase();

        taskItem.className = `task-item ${priority}`;

        if (task.completed) {
            taskItem.classList.add("completed");
        }

        // Task information.
        const taskInfo = document.createElement("div");
        taskInfo.className = "task-info";

        const title = document.createElement("h3");
        title.textContent = task.title;

        const subject = document.createElement("p");
        subject.textContent = "Subject: " + task.subject;

        const dueDate = document.createElement("p");
        dueDate.textContent = "Due Date: " + formatDate(task.date);

        const status = document.createElement("p");

        // Show completion status.
        status.textContent = task.completed
            ? "Status: Completed"
            : "Status: Incomplete";

        taskInfo.append(title, subject, dueDate, status);

        // Task labels.
        const tags = document.createElement("div");
        tags.className = "task-tags";

        addTag(tags, task.priority || "Medium", priority);
        addTag(tags, task.category || "Other");

        if (isOverdue(task)) {
            addTag(tags, "Overdue", "overdue");
        }

        taskInfo.appendChild(tags);

        // Task action buttons.
        const actions = document.createElement("div");
        actions.className = "task-actions";

        // Completion button.
        const completeButton = document.createElement("button");

        completeButton.type = "button";
        completeButton.className = "done-btn";

        completeButton.textContent = task.completed
            ? "Mark Incomplete"
            : "Mark Complete";

        completeButton.addEventListener("click", function() {
            toggleTask(task.id);
        });

        // Edit button.
        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function() {
            editTask(task.id);
        });

        // Delete button.
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "remove-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {
            deleteTask(task.id);
        });

        actions.append(
            completeButton,
            editButton,
            deleteButton
        );

        taskItem.append(taskInfo, actions);

        taskList.appendChild(taskItem);
    });

    // Show empty message when no tasks are displayed.
    emptyMessage.hidden = visibleTasks.length > 0;

    updateStatistics();
    updateFilterButtons();
}

// ==========================================
// 13. ADD TASK TAGS
// ==========================================

function addTag(container, text, className = "") {

    const tag = document.createElement("span");

    tag.className = `tag ${className}`;
    tag.textContent = text;

    container.appendChild(tag);
}

// ==========================================
// 14. SEARCH, FILTER AND SORT TASKS
// ==========================================

function getFilteredTasks() {

    const searchTerm = searchInput.value.trim().toLowerCase();

    let filteredTasks = tasks.filter(task => {

        const matchesSearch =
            (task.title || "").toLowerCase().includes(searchTerm) ||
            (task.subject || "").toLowerCase().includes(searchTerm) ||
            (task.category || "").toLowerCase().includes(searchTerm);

        let matchesFilter = true;

        if (currentFilter === "pending") {
            matchesFilter = !task.completed;
        }

        if (currentFilter === "completed") {
            matchesFilter = Boolean(task.completed);
        }

        if (currentFilter === "overdue") {
            matchesFilter = isOverdue(task);
        }

        return matchesSearch && matchesFilter;
    });

    // Sorting.
    const sortMode = sortSelect.value;

    if (sortMode === "newest") {

        filteredTasks.sort((a, b) =>
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );

    } else if (sortMode === "oldest") {

        filteredTasks.sort((a, b) =>
            new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        );

    } else if (sortMode === "dueDate") {

        filteredTasks.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return a.date.localeCompare(b.date);
        });

    } else if (sortMode === "priority") {

        const priorityOrder = {
            High: 1,
            Medium: 2,
            Low: 3
        };

        filteredTasks.sort((a, b) =>
            (priorityOrder[a.priority] || 2) -
            (priorityOrder[b.priority] || 2)
        );
    }

    return filteredTasks;
}

// Search tasks.
searchInput.addEventListener("input", displayTasks);

// Sort tasks.
sortSelect.addEventListener("change", displayTasks);

// ==========================================
// 15. DASHBOARD STATISTICS
// ==========================================

function updateStatistics() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    const overdue = tasks.filter(
        task => isOverdue(task)
    ).length;

    const percentage = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    document.getElementById("totalCount").textContent = total;

    document.getElementById("pendingCount").textContent = pending;

    document.getElementById("completedCount").textContent = completed;

    document.getElementById("overdueCount").textContent = overdue;

    document.getElementById("progressPercentage").textContent =
        percentage + "%";

    document.getElementById("progressBar").style.width =
        percentage + "%";

    document.getElementById("progressCaption").textContent = total > 0
        ? `${completed} of ${total} tasks completed. Keep up the good work!`
        : "You have not completed any tasks yet.";
}

// ==========================================
// 16. FILTER BUTTONS AND SIDEBAR NAVIGATION
// ==========================================

function updateFilterButtons() {

    document.querySelectorAll(".filter-btn").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.filter === currentFilter
        );
    });

    document.querySelectorAll(".nav-link").forEach(button => {

        const view = button.dataset.view;

        const active = view === currentFilter ||
            (view === "dashboard" && currentFilter === "all");

        button.classList.toggle("active", active);
    });

    const titles = {
        all: "My Study Tasks",
        pending: "Pending Tasks",
        completed: "Completed Tasks",
        overdue: "Overdue Tasks"
    };

    document.getElementById("listTitle").textContent =
        titles[currentFilter] || "My Study Tasks";
}

// Sidebar navigation.
document.querySelectorAll(".nav-link").forEach(button => {

    button.addEventListener("click", function() {

        currentFilter = this.dataset.view === "dashboard"
            ? "all"
            : this.dataset.view;

        displayTasks();

        document.querySelector(".tasks-panel").scrollIntoView({
            behavior: "smooth"
        });
    });
});

// Filter buttons.
document.querySelectorAll(".filter-btn").forEach(button => {

    button.addEventListener("click", function() {

        currentFilter = this.dataset.filter;

        displayTasks();
    });
});

// ==========================================
// 17. CLEAR COMPLETED TASKS
// ==========================================

clearCompleted.addEventListener("click", function() {

    const completedTasks = tasks.filter(
        task => task.completed
    ).length;

    if (completedTasks === 0) {
        alert("There are no completed tasks to clear.");
        return;
    }

    const confirmation = confirm(
        "Are you sure you want to delete all completed tasks?"
    );

    if (!confirmation) return;

    tasks = tasks.filter(
        task => !task.completed
    );

    saveTasks();
    resetForm();
    displayTasks();
});

// ==========================================
// 18. DARK MODE
// ==========================================

function applySavedTheme() {

    const savedTheme = localStorage.getItem("atuTheme");

    const darkMode = savedTheme === "dark";

    document.body.classList.toggle("dark", darkMode);

    themeButton.textContent = darkMode
        ? "☀ Toggle Light Mode"
        : "☾ Toggle Dark Mode";
}

themeButton.addEventListener("click", function() {

    const darkMode =
        !document.body.classList.contains("dark");

    document.body.classList.toggle("dark", darkMode);

    localStorage.setItem(
        "atuTheme",
        darkMode ? "dark" : "light"
    );

    themeButton.textContent = darkMode
        ? "☀ Toggle Light Mode"
        : "☾ Toggle Dark Mode";
});

// ==========================================
// 19. DISPLAY TODAY'S DATE
// ==========================================

document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

// ==========================================
// 20. START THE APPLICATION
// ==========================================

// Restore dark mode.
applySavedTheme();

// REQUIREMENT 5:
// Load previously saved tasks when the
// browser opens or the page is refreshed.
displayTasks();
