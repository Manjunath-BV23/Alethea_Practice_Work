let count = 0; 
  
const intervalId = setInterval(() => { 
  console.log('Hello Manju'); 
  count++; 
  
  if (count === 5) { 
    console.log('Clearing the interval id after 5 executions'); 
    clearInterval(intervalId); 
  } 
}, 1000);