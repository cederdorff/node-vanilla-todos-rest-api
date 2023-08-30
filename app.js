import http from "http";
import fs from "fs/promises";

const app = http.createServer(async (req, res) => {
    // "/"" : GET
    if (req.url === "/" && req.method === "GET") {
        //response headers
        res.writeHead(200, { "Content-Type": "application/json" });
        //set the response
        res.write("Node.js Vanilla Toos REST API 🎉");
        //end the response
        res.end();
    }
    // "/todos" : GET
    else if (req.url === "/todos" && req.method === "GET") {
        const data = await fs.readFile("data.json");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(data);
    }

    // "/todos" : POST
    else if (req.url === "/todos" && req.method === "POST") {
        // get the data sent along
        const newTodo = JSON.parse(await getReqData(req));
        // todo object with generated dummy id and parsed todoData
        const todo = {
            id: new Date().getTime(),
            ...newTodo
        };
        const data = await fs.readFile("data.json");
        const todos = JSON.parse(data);
        todos.push(todo);
        const todosJSON = JSON.stringify(todos);
        await fs.writeFile("data.json", todosJSON);

        // set the status code and content-type
        res.writeHead(200, { "Content-Type": "application/json" });
        //send the todo
        res.end(todosJSON);
    }

    // "/todos/:id" : PUT
    else if (req.url.match(/\/todos\/([0-9]+)/) && req.method === "PUT") {
        // get id from url
        const id = Number(req.url.split("/")[2]);
        const data = await fs.readFile("data.json");
        const todos = JSON.parse(data);

        let todoToUpdate = todos.find(todo => todo.id === id);
        const todoData = JSON.parse(await getReqData(req));
        todoToUpdate.task = todoData.task;
        todoToUpdate.completed = todoData.completed;

        const todosJSON = JSON.stringify(todos);
        fs.writeFile("data.json", todosJSON);
        // set the status code and content-type
        res.writeHead(200, { "Content-Type": "application/json" });
        //send the todo
        res.end(todosJSON);
    }

    // "/todos/:id" : DELETE
    else if (req.url.match(/\/todos\/([0-9]+)/) && req.method === "DELETE") {
        // get id from url
        const id = Number(req.url.split("/")[2]);
        const data = await fs.readFile("data.json");
        const todos = JSON.parse(data);

        const newTodos = todos.filter(todo => todo.id !== id);
        const todosJSON = JSON.stringify(newTodos);

        fs.writeFile("data.json", todosJSON);
        // set the status code and content-type
        res.writeHead(200, { "Content-Type": "application/json" });
        //send the todo
        res.end(todosJSON);
    }

    // If no route present
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
});

app.listen(3000, () => {
    console.log(`App running on http://localhost:3000`);
});

async function getReqData(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", chunk => (body += chunk));
        req.on("end", () => resolve(body));
        req.on("error", reject);
    });
}
