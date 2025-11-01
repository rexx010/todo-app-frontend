const landingPage = document.getElementById("landing");
const registerPage = document.getElementById("registerPage");
const loginPage = document.getElementById("loginPage");
const mainApp = document.getElementById("mainApp");

const loginBtn = document.querySelector(".loginbtn");
const registerBtn = document.querySelector(".registerbtn");
const loginSubmit = document.querySelector(".login-submit");
const registerSubmit = document.querySelector(".register-submit");
const createAccountLink = document.querySelector("#loginPage a");
const backToLoginLink = document.getElementById("backToLogin");

const logoutBtn = document.querySelector(".sidebar-footer button:last-child");
const profileName = document.querySelector(".profile h4");

const API_BASE = "https://my-todo-app-m3ny.onrender.com/api/auth";

function showError(inputId, message) {
  let input = document.getElementById(inputId);
  let errorSpan = input.nextElementSibling;

  if (!errorSpan || !errorSpan.classList.contains("error")) {
    errorSpan = document.createElement("span");
    errorSpan.classList.add("error");
    errorSpan.style.color = "red";
    errorSpan.style.fontSize = "12px";
    input.insertAdjacentElement("afterend", errorSpan);
  }

  errorSpan.textContent = message;
}

function clearErrors(formSelector) {
  document.querySelectorAll(`${formSelector} .error`).forEach(el => el.remove());
}

function showLanding() {
  landingPage.classList.remove("hidden");
  loginPage.classList.add("hidden");
  registerPage.classList.add("hidden");
  mainApp.classList.add("hidden");
}

function showMainApp(user) {
  landingPage.classList.add("hidden");
  loginPage.classList.add("hidden");
  registerPage.classList.add("hidden");
  mainApp.classList.remove("hidden");

  if (user && profileName) {
    profileName.textContent = user.username;
  }
}

registerSubmit.addEventListener("click", async () => {
  clearErrors("#registerPage");

  const username = document.getElementById("register-username").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value.trim();

  if (!username) return showError("register-username", "Username is required");
  if (!email) return showError("register-email", "Email is required");
  if (!password) return showError("register-password", "Password is required");

  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
      credentials: "include"
    });

    const data = await response.json()
    
    if (response.ok) {
      alert("Registration successful! Please login.");
      registerPage.classList.add("hidden");
      loginPage.classList.remove("hidden");
    } else  {
      // If backend returns multiple errors, show each next to the correct input
      if (data.errors) {
        // assuming backend sends { errors: { username: "msg", email: "msg" } }
        for (const field in data.errors) {
          const message = data.errors[field];
          const inputId = `register-${field}`;
          showError(inputId, message);
        }
      } else if (data.message) {
        // fallback single message
        showError("register-username", data.message);
      } else {
        alert("Registration failed.");
      }
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong!");
  }
});

loginSubmit.addEventListener("click", async () => {
  clearErrors("#loginPage");

  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!username) return showError("login-username", "Username is required");
  if (!password) return showError("login-password", "Password is required");

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include"
    });

    if (response.ok) {
      const message = await response.json();
      showMainApp(message);

      await fetchTasks();
      await fetchAllTasks();
    } else {
      const error = await response.text();
      showError("login-password", error || "Login failed.");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong!");
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await fetch(`${API_BASE}/logout`, {
      method: "GET",
      credentials: "include"
    });
    showLanding();
  } catch (err) {
    console.error("Logout failed:", err);
  }
});

loginBtn.addEventListener("click", () => {
  showLanding();
  landingPage.classList.add("hidden");
  loginPage.classList.remove("hidden");
});

registerBtn.addEventListener("click", () => {
  showLanding();
  landingPage.classList.add("hidden");
  registerPage.classList.remove("hidden");
});

createAccountLink.addEventListener("click", (e) => {
  e.preventDefault();
  loginPage.classList.add("hidden");
  registerPage.classList.remove("hidden");
});

backToLoginLink.addEventListener("click", (e) => {
  e.preventDefault();
  registerPage.classList.add("hidden");
  loginPage.classList.remove("hidden");
});

checkSession();

async function checkSession() {
  try {
    const response = await fetch(`${API_BASE}/me`, {
      method: "GET",
      credentials: "include"
    });

    if (response.ok) {
      const user = await response.json();
      showMainApp(user);
      await fetchTasks();
      await fetchAllTasks();
    } else {
      showLanding();
    }
  } catch (err) {
    console.error("Session check failed:", err);
    showLanding();
  }
}

const dropdownButtons = document.querySelectorAll(".dropdown-btn");

dropdownButtons.forEach(button => {
  button.addEventListener("click", () => {
    const content = button.nextElementSibling;

    if (content.style.display === "block") {
      content.style.display = "none";
      button.querySelector("h3").textContent = button.querySelector("h3").textContent.replace("⮝", "⮟");
    } else {
      content.style.display = "block";
      button.querySelector("h3").textContent = button.querySelector("h3").textContent.replace("⮟", "⮝");
    }
  });
});

async function fetchTasks() {
  try {
    const response = await fetch("https://my-todo-app-m3ny.onrender.com/api/todo/gettask", {
      method: "GET",
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Failed to fetch tasks: " + response.status);
    }

    const tasks = await response.json();

    const todoList = document.getElementById("todoList");
    todoList.innerHTML = "";

    tasks.forEach(task => {
      const li = document.createElement("li");

      li.innerHTML = `
        <input type="checkbox" ${task.status === "CHECKED" ? "checked" : ""}>
        <div class="task-info">
          <h4>${task.title}</h4>
          <p>${task.description}</p>
        </div>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      `;
      li.dataset.id = task.id;
      todoList.appendChild(li);
    });

  } catch (error) {
    console.error("Error loading tasks:", error);
  }
}

async function fetchAllTasks() {
  try {
    const response = await fetch("https://my-todo-app-m3ny.onrender.com/api/todo/gettask", {
      method: "GET",
      credentials: "include"
    });
    if (!response.ok) throw new Error("Failed to fetch tasks");

    const tasks = await response.json();

    const inprogressList = document.getElementById("inprogressList");
    const completedList = document.getElementById("completedList");

    inprogressList.innerHTML = "";
    completedList.innerHTML = "";

    tasks.forEach(task => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="task-info">
          <h4>${task.title}</h4>
          <p>${task.description}</p>
        </div>
      `;
      if (task.status === "CHECKED") completedList.appendChild(li);
      else inprogressList.appendChild(li);
    });

  } catch (err) {
    console.error(err);
  }
}

const openPopupBtn = document.getElementById("openPopupBtn");
const closePopupBtn = document.getElementById("closePopupBtn");
const taskPopup = document.getElementById("taskPopup");

openPopupBtn.addEventListener("click", () => {
  taskPopup.classList.add("show");
});

closePopupBtn.addEventListener("click", () => {
  taskPopup.classList.remove("show");
});

window.addEventListener("click", (e) => {
  if (e.target === taskPopup) {
    taskPopup.classList.remove("show");
  }
});

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDesc").value.trim();

  if (!title || !description) return;

  try {
    const response = await fetch("https://my-todo-app-m3ny.onrender.com/api/todo/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ title, description })
    });

    if (!response.ok) {
      throw new Error("Failed to add task: " + response.status);
    }

    const newTask = await response.json();

    const li = document.createElement("li");
    li.dataset.id = newTask.id;
    li.innerHTML = `
      <input type="checkbox" ${newTask.status === "CHECKED" ? "checked" : ""}>
      <div class="task-info">
        <h4>${newTask.title}</h4>
        <p>${newTask.description}</p>
      </div>
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    `;

    todoList.appendChild(li);

    taskForm.reset();

    taskPopup.classList.remove("show");

    await fetchAllTasks();

  } catch (error) {
    console.error("Error adding task:", error);
    alert("Failed to add task. Please try again.");
  }
});

document.getElementById("todoList").addEventListener("click", async (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const taskId = li.dataset.id;
  const title = li.querySelector("h4").textContent;
  const description = li.querySelector("p").textContent;

  if (e.target.classList.contains("delete-btn")) {
    if (confirm(`Are you sure you want to delete the task "${title}"?`)) {
      try {
        const response = await fetch(`https://my-todo-app-m3ny.onrender.com/api/todo/delete/${taskId}`, {
          method: "DELETE",
          credentials: "include"
        });
        if (response.ok) {
          await fetchTasks();
          await fetchAllTasks();
        } else {
          const error = await response.text();
          alert("Failed to delete task: " + error);
        }
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  } else if (e.target.classList.contains("edit-btn")) {
    const newTitle = prompt("Edit Title:", title);
    const newDescription = prompt("Edit Description:", description);
    if (newTitle && newDescription) {
      try {
        const response = await fetch(`https://my-todo-app-m3ny.onrender.com/api/todo/update/${taskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle, description: newDescription, status: li.querySelector("input").checked ? "CHECKED" : "UNCHECKED" }),
          credentials: "include"
        });
        if (response.ok) {
          await fetchTasks();
          await fetchAllTasks();
        } else {
          const error = await response.text();
          alert("Failed to update task: " + error);
        }
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
  } else if (e.target.tagName === "INPUT" && e.target.type === "checkbox") {
    const status = e.target.checked ? "CHECKED" : "UNCHECKED";
    try {
      const response = await fetch(`https://my-todo-app-m3ny.onrender.com/api/todo/mark/${taskId}`, {
        method: "GET",
        credentials: "include"
      });
      if (response.ok) {
        await fetchTasks();
        await fetchAllTasks();
      } else {
        const error = await response.text();
        alert("Failed to update task status: " + error);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  }
});
