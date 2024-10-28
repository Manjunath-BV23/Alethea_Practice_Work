export const ADD_COUNT = "ADD_COUNT";
export const SUB_COUNT = "SUB_COUNT";
export const ADD_TODO = "ADD_TODO";
export const DELETE_TODO = "DELETE_TODO";


export const addCount = (payload) => ({type: ADD_COUNT, payload});
export const subCount = (payload) => ({type: SUB_COUNT, payload});
export const addTodo = (todo) => ({type: ADD_TODO, payload: todo});
export const deleteTodo = (todo) => ({type: DELETE_TODO, payload: todo});



// 101719258075 AssHme%*i031