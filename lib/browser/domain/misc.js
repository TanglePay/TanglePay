export function formatMillis(millis) {
    let date = new Date(millis);
    let year = date.getFullYear();
    let month = ("0" + (date.getMonth() + 1)).slice(-2); // JavaScript months are 0-based
    let day = ("0" + date.getDate()).slice(-2);
    let hours = ("0" + date.getHours()).slice(-2);
    let minutes = ("0" + date.getMinutes()).slice(-2);
    let sec = ("0" + date.getSeconds()).slice(-2);
    return `${year}-${month}-${day} ${hours}:${minutes}:${sec}`;
  }