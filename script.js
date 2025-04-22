function select(selector){
	return document.querySelector(selector);
}


const inputTask = select('input#task_input');
const createBtn = select('input#task_input+button.create_btn');
const tasksContainer = select('div.tasks');
const messageBox = select('.alert')
const messageTitle = select('.alert .title');
const messageClose = select('.alert .close');
const messageContent = select('.alert .inner');
const darkModeBtn = select('#darkMode');
const lightModeBtn = select('#lightMode');
const root = document.documentElement;


createBtn.onclick = createTask;

function createTask(){
	if (inputTask.value.trim()){
		new Task(inputTask.value);
		inputTask.value = ''
	}else{
		Window.showMessage('Warning' , "Please Enter The Task First");
	}

}

function updateTask(id) {
	let task = Task.getById(id);

	inputTask.value = task.title;

	createBtn.innerHTML = 'Update'
	if (inputTask.value.trim()){
		createBtn.onclick = () => Task.updateTask(inputTask.value , id);
	}

}



let darkTheme = {
	"--bg": "#222",
	"--text": "#fff",
	"--btn": "#ff7653",
	"--lightTxt": "#fff",
	"--border": "#bbb",
	"--danger": "#f66",
	"--darkBtn": "#222",
	"--lightBtn": "#fff",

}

let lightTheme = {
	"--bg": "#f7f7f7",
	"--text": "#222",
	"--btn": "#ff7653",
	"--lightTxt": "#fff",
	"--border": "#bbb",
	"--danger": "#f66",
	"--darkBtn": "#222",
	"--lightBtn": "#fff",

}



class Window{
	static showMessage(title , message){
		messageTitle.innerHTML = title;
		messageContent.innerHTML = message;
		messageBox.classList.remove('hidden')

		setTimeout(function() {
			messageBox.style.opacity = 1
		}, 100);

	}

	static closeMessage(){
		messageBox.classList.add('hidden')
		messageBox.style.opacity = 0
	}

	static setMode(mode){
		if (mode == 'dark'){

			Object.keys(darkTheme).forEach((key) => {
				root.style.setProperty(key , darkTheme[key])
			})

		}else{
			Object.keys(lightTheme).forEach((key) => {
				root.style.setProperty(key , lightTheme[key])
			})		
		}
		
	}

}



if (localStorage.mode){
	Window.setMode(localStorage.mode)

	if (localStorage.mode == 'light'){
		darkModeBtn.style.display = 'block';
		lightModeBtn.style.display = 'none';
	}else{
		darkModeBtn.style.display = 'none';
		lightModeBtn.style.display = 'block';
		
	}

}


darkModeBtn.onclick = () => {
	Window.setMode('dark')
	darkModeBtn.style.display = 'none';
	lightModeBtn.style.display = 'block';
	localStorage.mode = 'dark';

};
lightModeBtn.onclick = () => {
	Window.setMode('light')

	darkModeBtn.style.display = 'block';
	lightModeBtn.style.display = 'none';

	localStorage.mode = 'light';


};


class Task{

	constructor (title){

		this.title = title;

		this.date = Task.calcDate();

		this.append(this.title , this.date)

	}

	static calcDate(){
	  const now = new Date();
  
	  const hours = now.getHours();
	  const dayOfMonth = now.getDate(); 
	  const minutes = now.getMinutes();
	  
	  const pad = n => n < 10 ? `0${n}` : n;	  
	  return `${pad(minutes)}:${pad(hours)}:${pad(dayOfMonth)}`;
	}

	append(title , date){

		let allTasks = localStorage.tasks

		let info = {
			title: title,
			date: date,
			id: 0	
		}


		if (allTasks && JSON.parse(allTasks).length > 0){
			allTasks = JSON.parse(allTasks);
			info.id = allTasks[allTasks.length - 1].id + 1
			allTasks.push(info)
			localStorage.tasks = JSON.stringify(allTasks)
		}else{
			localStorage.tasks = JSON.stringify([info])
		}

		this.task  = info;
		Window.showMessage('Info' , 'Task Created Successfully')
		Task.renderAll()

	}


	static getById(id){
		let allTasks = localStorage.tasks

		if (allTasks){
			allTasks = JSON.parse(allTasks);
		
			return allTasks.find(task => task.id == id);
		}

	}

	static delete(id){
		let allTasks = localStorage.tasks

		if (allTasks){
			allTasks = JSON.parse(allTasks);

			allTasks = allTasks.filter((task) => task.id != id);
			localStorage.tasks = JSON.stringify(allTasks)
		
			Task.renderAll()
		
		}else{
			this.showMessage('Error' , 'Task Not Found')
		}


	}

	static updateTask(title , id){
		let allTasks = localStorage.tasks

		if (allTasks){
			allTasks = JSON.parse(allTasks);
			
			allTasks.map((task) =>{
				if (task.id == id){
					task.title = title;
				}
			})

			localStorage.tasks = JSON.stringify(allTasks)
			createBtn.onclick = createTask;
			createBtn.innerHTML = 'Create';
			inputTask.value = '';
			Task.renderAll();

		}
	}


	
	static renderAll(){
		let tasks = localStorage.tasks

		if (tasks && JSON.parse(tasks)){
			tasks = JSON.parse(tasks);
				
			tasksContainer.innerHTML = `
				<div class="head">
					<span class="task-content">Title</span>
					<span class="date">Date</span>
					<span class="oprs">Actions</span>	
				</div>
			`

			tasks.forEach(task => {
				tasksContainer.innerHTML += `
				<div class="task">
					<span class="task-content">${task.title.replaceAll('<' , '&lt;')}</span>
					<span class="date">${task.date}</span>
					<div class="oprs">
						<button class="delete" onclick="Task.delete(${task.id})">Delete</button>
						<button class="update" onclick="updateTask(${task.id})">update</button>
					</div>
				</div>`
			})

		}

	}

}

Task.renderAll()
