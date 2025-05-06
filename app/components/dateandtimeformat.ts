export function formatDate(dateString) {
  const date = new Date(dateString);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

export function formatTime(timeString) {
  const [hours, minutes] = timeString.split(":");
  const formattedHours = String(Number(hours)).padStart(2, '0');
  const formattedMinutes = String(Number(minutes)).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}`;
}