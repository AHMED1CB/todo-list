function selectAll(selector){
	return document.querySelectorAll(selector);
}


function select(selector){
	return document.querySelector(selector);
}

const inputTask = select('input#task_input');
const createBtn = select('input#task_input+button.create_btn');
const tasksContainer = select('div.tasks');
const messageBox = select('.alert');
const messageTitle = select('.alert .title');
const messageContent = select('.alert .inner');
const darkModeBtn = select('#darkMode');
const lightModeBtn = select('#lightMode');
const root = document.documentElement;
const filters = selectAll('.filters button');
const heading = select('.heading')

let currentFilter = 'all';

createBtn.onclick = createTask;

function createTask(){
	if (inputTask.value.trim()){
		new Task(inputTask.value);
		inputTask.value = '';
	}else{
		Window.showMessage('Warning' , "Please Enter The Task First");
	}

}


function updateTask(id) {
	let task = Task.getById(id);

	inputTask.value = task.title;

	createBtn.innerHTML = 'Update';
	if (inputTask.value.trim()){
		createBtn.onclick = () => Task.updateTask(inputTask.value , id);
	}

}



class Window{
	
	static theme = {
			light : {
				"--bg": "#f7f7f7",
				"--text": "#222",
				"--btn": "#ff7653",
				"--lightTxt": "#fff",
				"--border": "#bbb",
				"--danger": "#f66",
				"--darkBtn": "#222",
				"--lightBtn": "#fff",
			},
			dark:{
				"--bg": "#222",
				"--text": "#fff",
				"--btn": "#ff7653",
				"--lightTxt": "#fff",
				"--border": "#bbb",
				"--danger": "#f66",
				"--darkBtn": "#222",
				"--lightBtn": "#fff",			
			},

			
			
		}
	
	static showMessage(title , message){
		messageTitle.innerHTML = title;
		messageContent.innerHTML = message;
		messageBox.classList.remove('hidden');
	
		setTimeout(function() {
			messageBox.style.opacity = 1;
		}, 100);

	}

	static closeMessage(){
		messageBox.classList.add('hidden');
		messageBox.style.opacity = 0;
	}

	static setMode(mode){
		if (mode == 'dark'){

			Object.keys(Window.theme.dark).forEach((key) => {
				root.style.setProperty(key , Window.theme.dark[key]);
			});

		}else{
			Object.keys(Window.theme.light).forEach((key) => {
				root.style.setProperty(key , Window.theme.light[key])
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

		this.completed = false;

		this.append(this.title , this.date)

	}

	static getObjects(){
		return localStorage.tasks ? localStorage.tasks : '[]' 
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

		let allTasks = Task.getObjects()
		let info = {
			title: title,
			date: date,
			completed : this.completed,
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
		
		Task.renderAll({
			filter: currentFilter
		})

	}


	static getById(id){
		let allTasks = Task.getObjects()

		if (allTasks){
			allTasks = JSON.parse(allTasks);
		
			return allTasks.find(task => task.id == id);
		}

	}

	static delete(id){
		let allTasks = Task.getObjects()

		if (allTasks){
		
			allTasks = JSON.parse(allTasks);

			allTasks = allTasks.filter((task) => task.id != id);
		
			localStorage.tasks = JSON.stringify(allTasks)
			
			Window.showMessage('Info' , 'Task Deleted Successfully')
			
			Task.renderAll({
			filter: currentFilter
		})
		
		}else{
			this.showMessage('Error' , 'Task Not Found')
		}


	}


	static complete(id){
		let allTasks = Task.getObjects()

		if (allTasks){
		
			allTasks = JSON.parse(allTasks);

			let currentState = allTasks.find((task) => task.id == id).completed;


			allTasks.find((task) => task.id == id).completed = !currentState		

			localStorage.tasks = JSON.stringify(allTasks)
						
			Task.renderAll({
				filter : currentFilter
			})
		
		}else{
			this.showMessage('Error' , 'Task Not Found')
		}


	}

	static updateTask(title , id){
		let allTasks = Task.getObjects()

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
			Task.renderAll({
			filter: currentFilter
			});

		}
	}


	
	static renderAll(options){



		let tasks = Task.getObjects()

		if (tasks && JSON.parse(tasks)){
			tasks = JSON.parse(tasks);
			
			if (options && options.filter){

				if (options.filter == 'all'){
					tasks = JSON.parse(Task.getObjects());
				}else if (options.filter == 'completed'){
					
					tasks = tasks.filter(task => task.completed);
				}else{
					tasks = tasks.filter(task => !task.completed);	

				}

			}

			if (Array.isArray(tasks)){

				tasksContainer.innerHTML = `
					<div class="head">
						<span class="task-content">Title</span>
						<span class="date">Creation Date</span>
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
							
							${!task.completed ? `<button class="complete update" onclick="Task.complete(${task.id})">Complete</button>`: '' }
							
							${!task.completed ? `<button class="update" onclick="updateTask(${task.id})">update</button>`: '' }
							
							
						</div>
					</div>`
				})
			}

		}

	}

}

window.onload = () => {
	if(localStorage.tasks){
		Task.renderAll()
	}
}


filters.forEach(filter => {
	filter.onclick = () => {

		filters.forEach(f => f.classList.remove('active'));

		filter.classList.add('active')

		Task.renderAll({
			filter: filter.dataset.filter
		})

		heading.innerHTML = `${filter.dataset.filter} Tasks`
		currentFilter = filter.dataset.filter
	}
})