

export const toCurrency = (num:any) => {
  // we want to handle string vals, as well as number vals
  // we want to set as currency
	if (typeof num === "number") {

		num = Math.round(num * 100);
	} else {
    num = parseFloat(num)
    if (typeof num != "number") {
      throw Error('curr method requires a number')
    } else {
      num = Math.round(num * 100);
    }
	}
	var len = num.toString().length;
	if (num !== 0) {
		num = (num / 100).toPrecision(len);
	} else {
		num = "0.00";
	}
	return num;
}

export const toCrypto = (num:any) => {
  // use significant digits
	if (typeof num === "number") {

		num = Math.round(num * 100);
	} else {
    num = parseFloat(num)
    if (typeof num != "number") {
      throw Error('curr method requires a number')
    } else {
      num = Math.round(num * 100);
    }
	}
	var len = num.toString().length;
	if (num !== 0) {
		num = (num / 100).toPrecision(len);
	} else {
		num = "0.00";
	}
	return num;
}