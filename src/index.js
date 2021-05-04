const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user){
    return response.status(400).json({"error": "This user account no exists"})
  }

  request.user = user;

  next();
}

function checksExistsId(request, response, next) {
  const { todos } = request.user;
  const { id } = request.params;

  const task = todos.find(task => task.id === id);

  if (!task){
    return response.status(404).json({"error": "This Id no exists"})
  }

  request.task = task;

  next();
}

app.post('/users', (request, response) => {
  const { name , username } = request.body;

  const existsUserAccount = users.some(user => user.username === username);

  if (existsUserAccount){
    return response.status(400).json({"error": "This user account already exists"})
  }

  const newUser = {
    id : uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  response.status(201).json(newUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;

  response.json(todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title , deadline } = request.body;
  const { todos } = request.user;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date( deadline),
    created_at: new Date()
  };

  todos.push(newTodo);

  response.status(201).json(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount, checksExistsId, (request, response) => {
  const { title, deadline } = request.body;
  const { task } = request;

  task.title = title;

  task.deadline = new Date(deadline);

  response.json(task);

});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsId, (request, response) => {
  const { task } = request;

  task.done = true;

  response.json(task);

});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsId, (request, response) => {
  const { todos } = request.user;
  const { task } = request;

  const taskId = todos.findIndex(taskTodo => taskTodo === task);

  todos.splice(taskId,1);

  response.status(204).send();
});

module.exports = app;