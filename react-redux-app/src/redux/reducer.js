import { ADD_COUNT, ADD_TODO, DELETE_TODO, SUB_COUNT } from "./action";



export const reducer = (store, {type, payload}) => {

    switch(type) {
        case ADD_COUNT:
            return {...store, count: store.count + payload};
        case SUB_COUNT:
            return {...store, count: store.count - payload};
        case ADD_TODO:
            return {...store, todo: [...store.todo, payload]};
        case DELETE_TODO:
            return {...store, todo: store.todo.filter((e, i) => i !== payload)}
        default:
            return store;
    }
}