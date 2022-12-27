exports.headerdate= function ()
{
      const today = new Date()
      const options = {
        weekday: "long",
      //   year: "numeric",
        month: "long",
        day: "numeric",
      };
      let day = today.toLocaleDateString("en-US", options)

      return day;

}
exports.getday= function(){
  const today = new Date()
  const options = {
    weekday: "long",
    //   year: "numeric",
//     month: "long",
//     day: "numeric",
  }
  let day = today.toLocaleDateString("en-US", options)

  return day
}