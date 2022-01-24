/**
 * Convert Timestamp to dd.mm.YYYY HH:MM:ss
 */
const convertDate = timestamp => {
	let date = new Date(timestamp);
	let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
	let month = parseInt(date.getMonth() + 1, 10);
	month = month < 10 ? '0' + month : '' + month;
	let year =
		date.getFullYear() < 10 ? '0' + date.getFullYear() : date.getFullYear();
	let hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
	let minute =
		date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
	let second =
		date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
	return (
		day + '.' + month + '.' + year + ' ' + hour + ':' + minute + ':' + second
	);
};

/**
 * Convert Seconds to HH:MM:ss
 */
const converTime = time => {
	let hours = Math.floor(time / 3600);
	let minutes = Math.floor(time / 60);
	let seconds = time % 60;

	if (hours < 10) hours = '0' + hours;
	if (minutes < 10) minutes = '0' + minutes;
	if (seconds < 10) seconds = '0' + seconds;

	return hours + ':' + minutes + ':' + seconds;
};

module.exports.convertDate = convertDate;
module.exports.converTime = converTime;
