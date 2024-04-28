export function convertTo12HourFormat(timeString) {
  // Split the time string into hours, minutes, and seconds
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  
  // Determine if the time is AM or PM
  const period = hours >= 12 ? 'PM' : 'AM';
  
  // Convert the 24-hour hour value to a 12-hour format
  let hour12 = hours % 12;
  
  // Handle the case where hour12 is zero (12 AM/PM)
  if (hour12 === 0) {
      hour12 = 12;
  }
  
  // Format the time into a string with 12-hour format and AM/PM
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}
