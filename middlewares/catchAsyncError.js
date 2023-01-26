export const catchAsyncError = (passedFunction) => {
  return (req, res, next) => {  //Returns an Arrow func (function returning an arrow function 😂😂)
    Promise.resolve(passedFunction(req, res, next)).catch(next) //Hear by doing next we are passing an another middleware instead of giving error   //⭕RATTA
  }
}