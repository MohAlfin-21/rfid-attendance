// timezone.js
export function toWIB(utcISOString) {
  const date = utcISOString ? new Date(utcISOString) : new Date();

  // validasi
  if (isNaN(date.getTime())) {
    throw new Error("Invalid timestamp format");
  }

  // WIB = UTC +7
  const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  // simpan ISO dengan offset +07:00
  return wib.toISOString().replace("Z", "+07:00");
}
