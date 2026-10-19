const monthNamesLong = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const monthNamesShort = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${monthNamesLong[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateTime(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  return `${date.getDate()} ${monthNamesShort[date.getMonth()]} ${date.getFullYear()} - ${date.getHours()}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

export function getTimeRemaining(expirationDateTime: string): string {
  const expirationTime = new Date(expirationDateTime).getTime();
  const currentTime = new Date().getTime();

  const differenceMs = expirationTime - currentTime;
  const seconds = Math.floor((differenceMs / 1000) % 60);
  const minutes = Math.floor((differenceMs / 1000 / 60) % 60);
  const hours = Math.floor((differenceMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(differenceMs / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days} days left`;
  if (hours > 0) return `${hours} hours left`;
  if (minutes > 0) return `${minutes} minutes left`;
  if (seconds > 0) return `${seconds} seconds left`;
  return "less than a second left";
}
