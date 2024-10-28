import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addTodo, deleteTodo } from "../redux/action";
import { Link } from "react-router-dom";

export const Todos = () => {
    const [list, setList] = useState("");

    const dispatch = useDispatch();

    const todo = useSelector((store) => store.todo)

    // const [todo, setTodo] = useState([]);

    // const addTodo = (l) => {
    //     setTodo([...todo, l]);
    //     setList("");
    // }

    // const deleteTodo = (i) => {
    //     const updateTodo = todo.filter((e,index) => index !== i);
    //     setTodo(updateTodo);
    // }


    return(
        <div className="container">
            <div>
                <h1>Todo List</h1>
                <Link to={"/"} className="btn">Go back to Home</Link>
                <br/>
                <br/>
                <div className="form">
                    <input type="text" onChange={(e) => setList(e.target.value)} placeholder="Type todo list"/>
                    <button onClick={() => dispatch(addTodo(list))}>Add Todo</button>
                </div>
                <div className="todo-list">
                    {todo.length === 0 ? "":
                        <ul>
                            {todo.map((e, i) => (
                                <li>{e} <button onClick={() => dispatch(deleteTodo(i))}>Delete</button></li>
                            ))}

                        </ul>
                    }
                            
                </div>
            </div>
        </div>
    )
}