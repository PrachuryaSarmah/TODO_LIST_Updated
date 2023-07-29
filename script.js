const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
checkReminders();
function renderTasks(filterOptions = {}) {
  
  const taskList = document.getElementById('taskList');
  const backlogsList = document.getElementById('backlogsList');
  taskList.innerHTML = '';
  backlogsList.innerHTML = '';

  const currentDate = new Date();

  tasks
    .filter(taskObj => {
      if (filterOptions.priority && filterOptions.priority !== 'all' && taskObj.priority !== filterOptions.priority) {
        return false;
      }
      if (filterOptions.dueDate && taskObj.dueDate !== filterOptions.dueDate) {
        return false;
      }
      if (filterOptions.category && filterOptions.category !== 'all' && taskObj.category !== filterOptions.category) {
        return false;
      }
      return true;
    })
    .forEach((taskObj, taskIndex) => {
      const li = document.createElement('li');
      li.setAttribute('draggable', 'true');
      li.dataset.taskIndex = taskIndex;
      li.addEventListener('dragstart', handleDragStart);
      li.addEventListener('dragover', handleDragOver);
      li.addEventListener('drop', handleDrop);
      li.innerHTML = `
        
        <span id="TskName" class="${taskObj.done ? 'completed-task' : ''}">${taskObj.task}</span>
        ${taskObj.done ? '<span class="status"></span>' : ''}
        <span class="due-date">${taskObj.dueDate}</span>
        <span class="category">${taskObj.category}</span>
        <span class="priority">${taskObj.priority}</span>
        <button id="EdTsk" onclick="editTask(${taskIndex})">Edit the task</button>
        <button id="EdDel" onclick="deleteTask(${taskIndex})">Delete the task</button>
        ${!taskObj.done ? `<button onclick="markAsDone(${taskIndex})">Mark as Done</button>` : `<button onclick="markAsUndone(${taskIndex})">Mark as Undone</button>`}
        <button id="EdDue" onclick="editDueDate(${taskIndex})">Edit Due Date</button>
        <button id="EdCat" onclick="editCategory(${taskIndex})">Edit Category</button>
        <button id= "EdPri" onclick="editPriority(${taskIndex})">Edit Priority</button>
        <button id="AdSub" onclick="addSubTask(${taskIndex})">Add Subtask</button>
        <button id="AdRem" onclick="addReminder(${taskIndex})">Add Reminder</button> 
      `;
      // Add the "draggable" attribute to the list item
      
     if (taskObj.subTasks && taskObj.subTasks.length > 0) {
        const subTaskList = document.createElement('ul');
        taskObj.subTasks.forEach((subTaskObj, subTaskIndex) => {
          const subTaskLi = document.createElement('li');
          subTaskLi.innerHTML = `
            <div id= "downIt">
            <span id="sTask">${subTaskObj.task}</span>
            <button class= "create" onclick="deleteSubTask(${taskIndex}, ${subTaskIndex})">Delete Subtask</button>
            </div>
          `;
          subTaskList.appendChild(subTaskLi);
        });
        li.appendChild(subTaskList);
      }
    
      if (!taskObj.done && new Date(taskObj.dueDate) < currentDate) {
        li.classList.add('overdue-task');
        backlogsList.appendChild(li); // Move overdue tasks to the backlog section
      } else {
        taskList.appendChild(li);
      }


      
    });
}


function checkReminders() {
    tasks.forEach((taskObj) => {
      if (taskObj.reminders && taskObj.reminders.length > 0) {
        taskObj.reminders.forEach(reminderDate => {
          const currentDate = new Date();
          const reminderDateTime = new Date(reminderDate);
          if (currentDate.toDateString() === reminderDateTime.toDateString()) {
            alert(`Reminder: ${taskObj.task} is due today!`);
          }
        });
      }
    });
  }
  



  function setReminder(taskIndex, reminderDate) {
    const taskObj = tasks[taskIndex];
    // Check if the reminders array exists or initialize it if it doesn't
    if (!taskObj.reminders) {
      taskObj.reminders = [];
    }
    taskObj.reminders.push(reminderDate);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    applyFilter(); // Apply filter after adding the reminder
  }

function addReminder(taskIndex) {
  const reminderDate = prompt('Set a reminder date (YYYY-MM-DD):');
  if (reminderDate && reminderDate.trim() !== '') {
    setReminder(taskIndex, reminderDate.trim());
  }
}

function applyFilter() {
  const filterPriority = document.getElementById('filterPriority').value;
  const filterDueDate = document.getElementById('filterDueDate').value;
  const filterCategory = document.getElementById('filterCategory').value;

  const filterOptions = {
    priority: filterPriority,
    dueDate: filterDueDate,
    category: filterCategory,
  };

  renderTasks(filterOptions);
}

function addTask() {
  const taskInput = document.getElementById('taskInput');
  const dueDateInput = document.getElementById('dueDateInput');
  const categoryInput = document.getElementById('categoryInput');
  const priorityInput = document.getElementById('priorityInput');
  const task = taskInput.value.trim();
  const dueDate = dueDateInput.value;
  const category = categoryInput.value;
  const priority = priorityInput.value;

  if (task === '') return;

  tasks.push({ task, dueDate, category, priority, done: false });
  localStorage.setItem('tasks', JSON.stringify(tasks));
  logActivity(`Added new task: '${task}'`, `Priority: ${priority}, Category: ${category}, Due Date: ${dueDate}`);
  applyFilter(); // Apply filter after adding the task
  taskInput.value = '';
  dueDateInput.value = '';
}

function searchTasks() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim();
  
    if (searchTerm === '') {
      renderTasks();
      return;
    }
  
    const filteredTasks = tasks.filter(taskObj => {
      const subTasks = taskObj.subTasks || [];
      return (
        taskObj.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subTasks.some(subTask => subTask.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  
    const filterOptions = {
      priority: 'all',
      dueDate: '',
      category: 'all',
    };
  
    renderTasks(filterOptions);
  
    const taskList = document.getElementById('taskList');
    const backlogsList = document.getElementById('backlogsList');
    taskList.innerHTML = '';
    backlogsList.innerHTML = '';
  
    filteredTasks.forEach((taskObj, taskIndex) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${taskObj.task}</span>
        <span class="due-date">${taskObj.dueDate}</span>
        <span class="category">${taskObj.category}</span>
        <span class="priority">${taskObj.priority}</span>
        <button onclick="editTask(${taskIndex})">Edit</button>
        <button onclick="deleteTask(${taskIndex})">Delete</button>
        ${!taskObj.done ? `<button onclick="markAsDone(${taskIndex})">Mark as Done</button>` : `<button onclick="markAsUndone(${taskIndex})">Mark as Undone</button>`}
        <button onclick="editDueDate(${taskIndex})">Edit Due Date</button>
        <button onclick="editCategory(${taskIndex})">Edit Category</button>
        <button onclick="editPriority(${taskIndex})">Edit Priority</button>
        <button onclick="addSubTask(${taskIndex})">Edit SubTask</button>
      `;
  
      if (!taskObj.done && new Date(taskObj.dueDate) < new Date()) {
        backlogsList.appendChild(li);
      } else {
        taskList.appendChild(li);
      }
    });
  }

function editTask(taskIndex) {
    const temp= tasks[taskIndex].task;
    const taskObj = tasks[taskIndex];
  
    const editedTask = prompt('Edit the task:', taskObj.task);
    if (editedTask !== null && editedTask.trim() !== '') {
      taskObj.task = editedTask.trim();
      localStorage.setItem('tasks', JSON.stringify(tasks));
      
      renderTasks(); // Re-render tasks after editing the task
      logActivity(`Edited task:`, `'${temp}'. New task: '${editedTask}'`);
    }
  }

  function deleteTask(taskIndex) {
    const tem= tasks[taskIndex].task;
    if (confirm('Are you sure you want to delete this task?')) {
      tasks.splice(taskIndex, 1);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      
      applyFilter(); // Applying filter after deleting the task
      logActivity(`Deleted task`, `'${tem}'`);
      
    }
  }
  function editDueDate(taskIndex) {
    const taskObj = tasks[taskIndex];
    const editedDueDate = prompt('Edit the due date:', taskObj.dueDate);
  
    if (editedDueDate !== null && editedDueDate.trim() !== '') {
      taskObj.dueDate = editedDueDate;
      localStorage.setItem('tasks', JSON.stringify(tasks));
      applyFilter(); // Applying filter after editing the due date
    }
  }

  function editCategory(taskIndex) {
    const taskObj = tasks[taskIndex];
    const editedCategory = prompt('Edit the category:', taskObj.category);
  
    if (editedCategory !== null && editedCategory.trim() !== '') {
      taskObj.category = editedCategory;
      localStorage.setItem('tasks', JSON.stringify(tasks));
      applyFilter(); // Applying filter after editing the category
    }
  }

  function addSubTask(taskIndex) {
    const subTask = prompt('Enter subtask:');
    if (subTask !== null && subTask.trim() !== '') {
      if (!tasks[taskIndex].subTasks) {
        tasks[taskIndex].subTasks = [];
      }
  
      const currentDate = new Date();
  
      const subTaskObj = {
        task: subTask.trim(),
      };
       
      tasks[taskIndex].subTasks.push(subTaskObj);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      
      renderTasks(); // Render tasks after adding the subtask
      logActivity(`Added new SubTask`, `'${subTask}'`);
    }
  }
  
  function markAsDone(taskIndex) {
    tasks[taskIndex].done = true;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    renderTasks(); // Refreshing the task list after marking as done
    logActivity(`Marked task as done`, `'${tasks[taskIndex].task}'`);
  }
  
  function markAsUndone(taskIndex) {
    tasks[taskIndex].done = false;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    renderTasks(); // Refreshing the task list after marking as undone
    logActivity(`Marked task as undone`, `'${tasks[taskIndex].task}'`);
  }

 

  function editPriority(taskIndex) {
    const taskObj = tasks[taskIndex];
    const editedPriority = prompt('Edit the priority:', taskObj.priority);
     if (editedPriority !== null && editedPriority.trim() !== '') {
      taskObj.priority = editedPriority;
      localStorage.setItem('tasks', JSON.stringify(tasks));
      applyFilter(); // Applying filter after editing the priority
    }
  }
  
  function deleteSubTask(taskIndex, subTaskIndex) {
    const removed= tasks[taskIndex].subTasks[subTaskIndex].task;
    if (confirm('Are you sure you want to delete this subtask?')) {
      tasks[taskIndex].subTasks.splice(subTaskIndex, 1);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      renderTasks(); // Rendering tasks after deleting the subtask
      logActivity(`Deleted Subtask`, `${removed}`);
    }
  }

  function logActivity(action, task) {
    const activityLog = document.getElementById('activityLog');
    const logItem = document.createElement('li');
    logItem.textContent = `${action}: ${task}`;
    activityLog.appendChild(logItem);
  }
  


  let dragTaskIndex = null; // Variable to store the index of the dragged task

  // Function to handle the "dragstart" event
  function handleDragStart(event) {
    dragTaskIndex = parseInt(event.target.dataset.taskIndex); // Store the index of the dragged task
  }
  
  // Function to handle the "dragover" event
  function handleDragOver(event) {
    event.preventDefault(); // Allow drop
    event.dataTransfer.dropEffect = "move"; // Set the drop effect to "move"
  }
  




  function handleDrop(event) {
    event.preventDefault(); // Prevent default behavior of drop
  
    const sourceTaskIndex = dragTaskIndex; // Use the previously stored dragTaskIndex
    const targetTaskIndex = parseInt(event.target.dataset.taskIndex);
  
    if (sourceTaskIndex !== targetTaskIndex) {
      // Swap the positions of the dragged task and the drop target task
      const draggedTask = tasks.splice(sourceTaskIndex, 1)[0];
      tasks.splice(targetTaskIndex, 0, draggedTask);
  
      localStorage.setItem('tasks', JSON.stringify(tasks));
      logActivity(`Moved task '${draggedTask.task}'`, `from position ${sourceTaskIndex + 1} to position ${targetTaskIndex + 1}`);
      renderTasks(); // Re-render the tasks list
    }
  }



  // Add event listeners for drag-and-drop functionality
  document.getElementById('taskList').addEventListener('dragstart', handleDragStart);
  document.getElementById('taskList').addEventListener('dragover', handleDragOver);
  document.getElementById('taskList').addEventListener('drop', handleDrop);






document.getElementById('addBtn').addEventListener('click', addTask);
document.getElementById('filterPriority').addEventListener('change', applyFilter);
document.getElementById('filterDueDate').addEventListener('change', applyFilter);
document.getElementById('filterCategory').addEventListener('change', applyFilter);
document.getElementById('searchInput').addEventListener('input', searchTasks);
renderTasks();